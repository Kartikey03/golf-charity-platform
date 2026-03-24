
// =============================================
// server/src/routes/draw.routes.js
// =============================================
import { Router } from 'express'
import { authenticate, adminOnly } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'
import { generateDrawNumbers, processDraw, calculatePrizePool } from '../services/drawEngine.service.js'

const router = Router()

// Public: get published draws
router.get('/', async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('draw_periods')
      .select('*')
      .eq('status', 'published')
      .order('draw_month', { ascending: false })
    res.json(data)
  } catch (err) { next(err) }
})

// Admin: create draw period
router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { title, draw_month, draw_type } = req.body
    const { data: subs } = await supabase
      .from('subscriptions').select('id').eq('status', 'active')

    const pools = await calculatePrizePool(subs.length)

    const { data } = await supabase.from('draw_periods').insert({
      title, draw_month, draw_type,
      jackpot_amount: pools.jackpot,
      pool_4match: pools.pool4,
      pool_3match: pools.pool3,
      total_subscribers: subs.length,
    }).select().single()

    res.status(201).json(data)
  } catch (err) { next(err) }
})

// Admin: simulate / run draw
router.post('/:id/run', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { simulate = false } = req.body
    const { data: draw } = await supabase
      .from('draw_periods').select('*').eq('id', req.params.id).single()

    const numbers = await generateDrawNumbers(draw.draw_type)

    await supabase.from('draw_periods').update({
      drawn_numbers: numbers,
      status: simulate ? 'simulation' : 'published',
      published_at: simulate ? null : new Date().toISOString(),
    }).eq('id', req.params.id)

    // Snapshot entries from active subscribers
    const { data: subs } = await supabase
      .from('subscriptions').select('user_id').eq('status', 'active')

    for (const sub of subs) {
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
    res.json({ numbers, results })
  } catch (err) { next(err) }
})

export default router
