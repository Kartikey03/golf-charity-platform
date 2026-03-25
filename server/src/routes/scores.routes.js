// =============================================
// server/src/routes/scores.routes.js
// =============================================
import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = Router()

// Get user's scores
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('played_on', { ascending: false })
    res.json(data || [])
  } catch (err) { next(err) }
})

// Add score — requires active subscription
router.post('/', authenticate, async (req, res, next) => {
  try {
    // Subscription paywall check
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', req.user.id)
      .single()

    if (!sub || sub.status !== 'active') {
      return res.status(403).json({
        error: 'An active subscription is required to log scores. Please subscribe to continue.',
      })
    }

    const { score, played_on, course_name, notes } = req.body

    if (!score || score < 1 || score > 45) {
      return res.status(400).json({ error: 'Score must be between 1 and 45' })
    }
    if (!played_on) {
      return res.status(400).json({ error: 'played_on date is required' })
    }

    const { data, error } = await supabase
      .from('golf_scores')
      .insert({ user_id: req.user.id, score, played_on, course_name, notes })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// Delete score
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('golf_scores')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
