import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = Router()

// Sync user profile from Supabase Auth after login
router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const { email, full_name } = req.body
    
    const { data: user, error } = await supabase
      .from('users')
      .upsert({ 
        id: req.user.id, 
        email: email || req.user.email,
        full_name: full_name || 'User',
      }, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error
    res.json(user)
  } catch (err) { next(err) }
})

export default router
