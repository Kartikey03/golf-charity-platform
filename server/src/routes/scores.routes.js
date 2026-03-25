
import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const SCORE_MIN = 1
const SCORE_MAX = 45

const router = Router()

// Get user's scores
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { data } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('played_on', { ascending: false })
    res.json(data)
  } catch (err) { next(err) }
})

// Add score (trigger auto-drops oldest beyond 5)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { score, played_on, course_name, notes } = req.body
    if (score < 1 || score > 45)
      return res.status(400).json({ error: `Score must be between 1 and 45` })

    const { data, error } = await supabase.from('golf_scores').insert({
      user_id: req.user.id, score, played_on, course_name, notes,
    }).select().single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// Delete score
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await supabase.from('golf_scores').delete()
      .eq('id', req.params.id).eq('user_id', req.user.id)
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
