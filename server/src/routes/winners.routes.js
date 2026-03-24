import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

// Get recent winners across all draws
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('draw_results')
      .select(`
        id, match_type, prize_amount, is_jackpot,
        draw_period:draw_periods(title, draw_month),
        user:users(full_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

export default router
