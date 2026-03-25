// =============================================
// server/src/routes/draw.routes.js
// =============================================
import { Router } from 'express'
import { authenticate, adminOnly } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'
import { generateDrawNumbers, processDraw, calculatePrizePool } from '../services/drawEngine.service.js'

const router = Router()

// Public: get published draws (for user-facing draw history)
router.get('/', async (req, res, next) => {
  try {
    const isAdmin = req.query.admin === 'true'
    let query = supabase
      .from('draw_periods')
      .select('*')
      .order('draw_month', { ascending: false })

    if (!isAdmin) query = query.eq('status', 'published')

    const { data } = await query
    res.json(data || [])
  } catch (err) { next(err) }
})

// Admin: get ALL draw periods
router.get('/all', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('draw_periods')
      .select('*')
      .order('draw_month', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (err) { next(err) }
})

// Admin: create draw period
router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { title, draw_month, draw_type, jackpot_override } = req.body

    if (!title || !draw_month) return res.status(400).json({ error: 'title and draw_month are required' })

    const { data: subs } = await supabase
      .from('subscriptions').select('id').eq('status', 'active')

    const pools = await calculatePrizePool(subs?.length || 0)

    const { data, error } = await supabase.from('draw_periods').insert({
      title,
      draw_month,
      draw_type: draw_type || 'random',
      jackpot_amount: jackpot_override || pools.jackpot,
      pool_4match: pools.pool4,
      pool_3match: pools.pool3,
      total_subscribers: subs?.length || 0,
      status: 'pending',
    }).select().single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// Admin: update draw metadata (before running)
router.patch('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { title, draw_type, jackpot_amount } = req.body
    const updates = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (draw_type !== undefined) updates.draw_type = draw_type
    if (jackpot_amount !== undefined) updates.jackpot_amount = jackpot_amount

    const { data, error } = await supabase
      .from('draw_periods')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Admin: delete unpublished draw
router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    // Only allow deletion of pending or simulation draws
    const { data: draw } = await supabase
      .from('draw_periods').select('status').eq('id', req.params.id).single()

    if (!draw) return res.status(404).json({ error: 'Draw not found' })
    if (draw.status === 'published' || draw.status === 'closed') {
      return res.status(400).json({ error: 'Cannot delete a published or closed draw' })
    }

    const { error } = await supabase.from('draw_periods').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

// Admin: simulate / run / publish draw
router.post('/:id/run', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { simulate = false } = req.body
    const { data: draw } = await supabase
      .from('draw_periods').select('*').eq('id', req.params.id).single()

    if (!draw) return res.status(404).json({ error: 'Draw not found' })

    const numbers = await generateDrawNumbers(draw.draw_type)

    await supabase.from('draw_periods').update({
      drawn_numbers: numbers,
      status: simulate ? 'simulation' : 'published',
      published_at: simulate ? null : new Date().toISOString(),
    }).eq('id', req.params.id)

    // Snapshot entries from active subscribers
    const { data: subs } = await supabase
      .from('subscriptions').select('user_id').eq('status', 'active')

    for (const sub of subs || []) {
      const { data: scores } = await supabase
        .from('golf_scores').select('score')
        .eq('user_id', sub.user_id)
        .order('played_on', { ascending: false }).limit(5)

      if (!scores?.length) continue

      await supabase.from('draw_entries').upsert({
        draw_period_id: req.params.id,
        user_id: sub.user_id,
        scores_snapshot: scores.map(s => s.score),
      }, { onConflict: 'draw_period_id,user_id' })
    }

    const results = await processDraw(req.params.id)

    // If official publish, create winner_verification records for winners
    if (!simulate && results.length > 0) {
      const { data: updatedDraw } = await supabase
        .from('draw_periods').select('*').eq('id', req.params.id).single()

      for (const result of results) {
        const { entry, tier } = result
        let prizeAmount = 0
        if (tier === '5-match') prizeAmount = updatedDraw.jackpot_amount
        else if (tier === '4-match') prizeAmount = Math.floor(updatedDraw.pool_4match / results.filter(r => r.tier === '4-match').length)
        else if (tier === '3-match') prizeAmount = Math.floor(updatedDraw.pool_3match / results.filter(r => r.tier === '3-match').length)

        await supabase.from('winner_verifications').upsert({
          draw_entry_id: entry.id,
          user_id: entry.user_id,
          draw_period_id: req.params.id,
          prize_amount: prizeAmount,
          status: 'pending',
        }, { onConflict: 'draw_entry_id' })
      }
    }

    res.json({ numbers, results })
  } catch (err) { next(err) }
})

export default router
