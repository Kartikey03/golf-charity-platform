import { Router } from 'express'
import { supabase } from '../config/supabase.js'
import { authenticate, adminOnly } from '../middleware/auth.js'

const router = Router()

// Get all active charities (public)
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
    
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Admin: Add new charity
router.post('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { name, slug, description, website_url, logo_url } = req.body
    const { data, error } = await supabase
      .from('charities')
      .insert({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description, website_url, logo_url, is_active: true })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// Admin: Toggle charity active status
router.patch('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const { is_active } = req.body
    const { data, error } = await supabase
      .from('charities')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// Get current user's charity contribution
router.get('/contribution', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('charity_contributions')
      .select('charity_id, percentage')
      .eq('user_id', req.user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    res.json(data || null)
  } catch (err) { next(err) }
})

// Upsert user's charity contribution
router.put('/contribution', authenticate, async (req, res, next) => {
  try {
    const { charity_id, percentage } = req.body
    if (!charity_id) return res.status(400).json({ error: 'charity_id is required' })
    if (!percentage || percentage < 10 || percentage > 100) {
      return res.status(400).json({ error: 'percentage must be between 10 and 100' })
    }

    const { data, error } = await supabase
      .from('charity_contributions')
      .upsert({
        user_id: req.user.id,
        charity_id,
        percentage: parseInt(percentage),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

export default router
