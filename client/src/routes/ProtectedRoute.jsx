import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-dark-950 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/40 text-sm"
      >
        Loading your account...
      </motion.p>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />

  // KEY FIX: If admin hits any /dashboard route, send them to /admin
  if (!requireAdmin && profile?.role === 'admin' && location.pathname.startsWith('/dashboard')) {
    return <Navigate to="/admin" replace />
  }

  return children
}
