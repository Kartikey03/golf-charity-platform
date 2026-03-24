import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import { authenticate, adminOnly } from '../middleware/auth.js'

const router = Router()

// Get all active charities
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('status', 'active')
    
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Admin: Add new charity
router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { name, description, website_url, logo_url } = req.body
    const { data, error } = await supabase
      .from('charities')
      .insert({ name, description, website_url, logo_url, status: 'active' })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

export default router
