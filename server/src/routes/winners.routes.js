import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = Router()

// Get user's winnings (winner_verifications)
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('winner_verifications')
      .select(`
        *,
        draw_period:draw_periods(title, draw_month),
        draw_entry:draw_entries(match_count, prize_tier, scores_snapshot)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data || [])
  } catch (err) { next(err) }
})

// Get recent winners across all draws (public)
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('winner_verifications')
      .select(`
        id, prize_amount, status,
        draw_period:draw_periods(title, draw_month),
        user:profiles(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

export default router
