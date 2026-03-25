// =============================================
// server/src/routes/draw.routes.js
// =============================================
import { Router } from 'express'
import { authenticate, adminOnly } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'
import {
  generateDrawNumbers,
  processDraw,
  calculatePrizePool,
  createWinnerVerifications,
  getRolledOverJackpot,
} from '../services/drawEngine.service.js'

const router = Router()

// Public: get published draws
router.get('/', async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('draw_periods')
      .select('*')
      .in('status', ['published', 'simulation'])
      .order('draw_month', { ascending: false })
    res.json(data || [])
  } catch (err) { next(err) }
})

// Public: get single draw (for user draw detail)
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('draw_periods')
      .select('*')
      .eq('id', req.params.id)
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Admin: create draw period (with automatic jackpot rollover)
router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { title, draw_month, draw_type = 'random' } = req.body

    if (!title || !draw_month) {
      return res.status(400).json({ error: 'title and draw_month are required' })
    }

    // Count active subscribers
    const { count: subCount } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    const pools = await calculatePrizePool(subCount || 0)

    // Add any rolled-over jackpot from previous draws where no one won the jackpot
    const rolledOver = await getRolledOverJackpot()
    const jackpotWithRollover = pools.jackpot + rolledOver

    const { data, error } = await supabase
      .from('draw_periods')
      .insert({
        title,
        draw_month,
        draw_type,
        jackpot_amount: jackpotWithRollover,
        pool_4match: pools.pool4,
        pool_3match: pools.pool3,
        total_subscribers: subCount || 0,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// Admin: simulate or run official draw
router.post('/:id/run', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { simulate = false } = req.body

    const { data: draw, error: drawErr } = await supabase
      .from('draw_periods').select('*').eq('id', req.params.id).single()
    if (drawErr) throw drawErr

    if (draw.status === 'published') {
      return res.status(400).json({ error: 'Draw already published' })
    }

    // Generate numbers
    const numbers = await generateDrawNumbers(draw.draw_type)

    await supabase.from('draw_periods').update({
      drawn_numbers: numbers,
      status: simulate ? 'simulation' : 'published',
      published_at: simulate ? null : new Date().toISOString(),
    }).eq('id', req.params.id)

    // Snapshot entries from active subscribers
    const { data: subs } = await supabase
      .from('subscriptions').select('user_id').eq('status', 'active')

    for (const sub of (subs || [])) {
      const { data: scores } = await supabase
        .from('golf_scores').select('score')
        .eq('user_id', sub.user_id)
        .order('played_on', { ascending: false })
        .limit(5)

      if (!scores?.length) continue

      await supabase.from('draw_entries').upsert({
        draw_period_id: req.params.id,
        user_id: sub.user_id,
        scores_snapshot: scores.map(s => s.score),
      }, { onConflict: 'draw_period_id,user_id' })
    }

    // Process matches
    const results = await processDraw(req.params.id)

    if (!simulate) {
      // Fetch updated draw (with final pool amounts)
      const { data: finalDraw } = await supabase
        .from('draw_periods').select('*').eq('id', req.params.id).single()

      // Auto-create winner_verifications with split prizes
      const verificationCount = await createWinnerVerifications(req.params.id, results, finalDraw)
      console.log(`Created ${verificationCount} winner verification records`)

      // Mark jackpot as rolled over if no 5-match winners
      const has5Match = results.some(r => r.tier === '5-match')
      if (!has5Match) {
        await supabase.from('draw_periods')
          .update({ jackpot_rolled_over: true })
          .eq('id', req.params.id)
      }
    }

    res.json({
      numbers,
      simulate,
      totalEntries: subs?.length || 0,
      winners: results.map(r => ({
        user_id: r.entry.user_id,
        tier: r.tier,
        matches: r.matches,
      })),
    })
  } catch (err) { next(err) }
})

export default router
