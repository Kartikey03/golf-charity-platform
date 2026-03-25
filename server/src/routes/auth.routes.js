import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = Router()

// Sync user profile from Supabase Auth after login
router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const { email, full_name, charity_id, charity_pct, selected_plan } = req.body

    // Upsert into profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({
        id: req.user.id,
        email: email || req.user.email,
        full_name: full_name || 'User',
      }, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('Auth sync error:', error)
      throw error
    }

    // If charity_id provided and no existing contribution, insert (first-time only)
    if (charity_id) {
      const { data: existing } = await supabase
        .from('charity_contributions')
        .select('id')
        .eq('user_id', req.user.id)
        .single()

      if (!existing) {
        await supabase
          .from('charity_contributions')
          .insert({
            user_id: req.user.id,
            charity_id,
            percentage: parseInt(charity_pct) || 10
          })
      }
    }

    res.json(profile)
  } catch (err) { next(err) }
})

// Update user profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { full_name } = req.body
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

export default router
