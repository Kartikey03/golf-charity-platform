import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) syncAndFetchProfile(session)
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) syncAndFetchProfile(session)
      else { setProfile(null); setLoading(false) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const syncAndFetchProfile = async (session) => {
    try {
      const token = session.access_token
      const meta = session.user.user_metadata || {}

      // Sync user to backend users table (upsert) — returns the user profile
      const res = await fetch(`${API_URL}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: session.user.email,
          full_name: meta.full_name || 'User',
          charity_id: meta.charity_id,
          charity_pct: meta.charity_pct,
          selected_plan: meta.selected_plan
        })
      })

      if (res.ok) {
        const profileData = await res.json()
        setProfile(profileData)
      } else {
        console.error('Auth sync failed:', await res.text())
        setProfile(null)
      }
    } catch (err) {
      console.error('Profile sync error:', err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refetchProfile: () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) syncAndFetchProfile(session)
      })
    }}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)