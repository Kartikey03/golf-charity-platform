import { Router } from 'express'
import { authenticate, adminOnly } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = Router()

// Apply admin only to all routes in this file
router.use(authenticate, adminOnly)

// Get system stats
router.get('/stats', async (req, res, next) => {
  try {
    // Basic example of gathering some stats
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: subCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
    
    res.json({
      totalUsers: userCount || 0,
      activeSubscriptions: subCount || 0
    })
  } catch (err) { next(err) }
})

export default router
