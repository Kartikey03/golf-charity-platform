
import { supabase } from '../config/supabase.js'

export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  // Attach profile with role from profiles table
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  req.user = user
  req.profile = profile
  next()
}

export async function adminOnly(req, res, next) {
  if (req.profile?.role !== 'admin')
    return res.status(403).json({ error: 'Admin access required' })
  next()
}
