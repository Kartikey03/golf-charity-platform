import { Router } from 'express'
import { authenticate, adminOnly } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = Router()

// All admin routes require authentication + admin role
router.use(authenticate, adminOnly)

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: monthlySubscriptions },
      { count: yearlySubscriptions },
      { count: pendingWinners },
      { count: totalDraws },
      { count: activeCharities },
      { data: priceConfig },
      { data: paidWinners },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'monthly'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'yearly'),
      supabase.from('winner_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('draw_periods').select('*', { count: 'exact', head: true }),
      supabase.from('charities').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('prize_pool_config').select('*').limit(1).single(),
      supabase.from('winner_verifications').select('prize_amount').eq('status', 'paid'),
    ])

    const config = priceConfig || {}
    const monthlyRevenuePence = (monthlySubscriptions || 0) * (config.plan_monthly_pence || 999)
    const yearlyRevenuePence = (yearlySubscriptions || 0) * (config.plan_yearly_pence || 9999)
    const totalMonthlyRevenuePence = monthlyRevenuePence + yearlyRevenuePence
    const totalPaidOut = (paidWinners || []).reduce((sum, w) => sum + (w.prize_amount || 0), 0)

    res.json({
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      monthlySubscriptions: monthlySubscriptions || 0,
      yearlySubscriptions: yearlySubscriptions || 0,
      pendingWinners: pendingWinners || 0,
      totalDraws: totalDraws || 0,
      activeCharities: activeCharities || 0,
      monthlyRevenuePence: totalMonthlyRevenuePence,
      totalPaidOutPence: totalPaidOut,
    })
  } catch (err) { next(err) }
})

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const { search = '', limit = 100, offset = 0 } = req.query

    let query = supabase
      .from('profiles')
      .select(`
        *,
        subscriptions(status, plan, current_period_end, cancel_at_period_end, amount_pence, created_at),
        charity_contributions(charity_id, percentage, charities(name, slug)),
        golf_scores(score, played_on, course_name)
      `)
      .order('created_at', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1)

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    if (error) throw error
    res.json({ users: data || [], total: count })
  } catch (err) { next(err) }
})

// ── GET /api/admin/users/:id ──────────────────────────────────────────────────
router.get('/users/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        subscriptions(*),
        charity_contributions(*, charities(name, slug)),
        golf_scores(*)
      `)
      .eq('id', req.params.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── PUT /api/admin/users/:id ──────────────────────────────────────────────────
router.put('/users/:id', async (req, res, next) => {
  try {
    const { full_name, role, handicap, phone, country } = req.body
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, role, handicap, phone, country, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── GET /api/admin/users/:id/scores ──────────────────────────────────────────
router.get('/users/:id/scores', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', req.params.id)
      .order('played_on', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (err) { next(err) }
})

// ── POST /api/admin/users/:id/scores ─────────────────────────────────────────
router.post('/users/:id/scores', async (req, res, next) => {
  try {
    const { score, played_on, course_name, notes } = req.body
    if (!score || score < 1 || score > 45) return res.status(400).json({ error: 'Score must be 1–45' })
    if (!played_on) return res.status(400).json({ error: 'played_on is required' })

    const { data, error } = await supabase
      .from('golf_scores')
      .insert({ user_id: req.params.id, score, played_on, course_name, notes })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// ── DELETE /api/admin/scores/:scoreId ────────────────────────────────────────
router.delete('/scores/:scoreId', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('golf_scores')
      .delete()
      .eq('id', req.params.scoreId)

    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

// ── GET /api/admin/winners ────────────────────────────────────────────────────
router.get('/winners', async (req, res, next) => {
  try {
    const { status } = req.query
    let query = supabase
      .from('winner_verifications')
      .select(`
        *,
        profiles:user_id(full_name, email),
        draw_periods:draw_period_id(title, draw_month),
        draw_entries:draw_entry_id(match_count, prize_tier, scores_snapshot)
      `)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    res.json(data || [])
  } catch (err) { next(err) }
})

// ── PUT /api/admin/winners/:id ────────────────────────────────────────────────
router.put('/winners/:id', async (req, res, next) => {
  try {
    const { status, admin_notes, prize_amount } = req.body
    const updates = { status, admin_notes, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    if (status === 'paid') updates.paid_at = new Date().toISOString()
    if (prize_amount !== undefined) updates.prize_amount = prize_amount

    const { data, error } = await supabase
      .from('winner_verifications')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── GET /api/admin/reports ────────────────────────────────────────────────────
router.get('/reports', async (req, res, next) => {
  try {
    const [
      { data: subscriptions },
      { data: charityContribs },
      { data: drawPeriods },
      { data: winnerVerifs },
      { data: priceConfig },
    ] = await Promise.all([
      supabase.from('subscriptions').select('status, plan, amount_pence, created_at'),
      supabase.from('charity_contributions').select('charity_id, percentage, charities(name)'),
      supabase.from('draw_periods').select('id, status, draw_month, total_subscribers, jackpot_amount, pool_4match, pool_3match'),
      supabase.from('winner_verifications').select('status, prize_amount, paid_at'),
      supabase.from('prize_pool_config').select('*').limit(1).single(),
    ])

    // Subscription breakdown
    const subBreakdown = { active: 0, inactive: 0, cancelled: 0, lapsed: 0, past_due: 0 }
    const planBreakdown = { monthly: 0, yearly: 0 }
    for (const s of subscriptions || []) {
      subBreakdown[s.status] = (subBreakdown[s.status] || 0) + 1
      if (s.status === 'active') planBreakdown[s.plan] = (planBreakdown[s.plan] || 0) + 1
    }

    // Charity totals
    const charityMap = {}
    for (const c of charityContribs || []) {
      const name = c.charities?.name || 'Unknown'
      if (!charityMap[name]) charityMap[name] = { name, count: 0, totalPct: 0 }
      charityMap[name].count++
      charityMap[name].totalPct += c.percentage || 0
    }
    const charityStats = Object.values(charityMap).sort((a, b) => b.count - a.count)

    // Draw stats
    const drawStats = {
      total: (drawPeriods || []).length,
      published: (drawPeriods || []).filter(d => d.status === 'published').length,
      pending: (drawPeriods || []).filter(d => d.status === 'pending').length,
    }

    // Winner stats
    const winnerStats = {
      total: (winnerVerifs || []).length,
      pending: (winnerVerifs || []).filter(w => w.status === 'pending').length,
      approved: (winnerVerifs || []).filter(w => w.status === 'approved').length,
      paid: (winnerVerifs || []).filter(w => w.status === 'paid').length,
      rejected: (winnerVerifs || []).filter(w => w.status === 'rejected').length,
      totalPaidPence: (winnerVerifs || []).filter(w => w.status === 'paid').reduce((s, w) => s + (w.prize_amount || 0), 0),
    }

    res.json({ subBreakdown, planBreakdown, charityStats, drawStats, winnerStats, priceConfig })
  } catch (err) { next(err) }
})

export default router
