import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { user, profile } = useAuth()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'How it works', path: '/how-it-works' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Charities', path: '/charities' },
  ]

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/10 bg-dark-950/95 backdrop-blur-xl shadow-xl shadow-black/20'
          : 'border-transparent bg-dark-950/60 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-dark-950 font-bold text-xl shadow-lg shadow-brand-500/30"
            >
              G
            </motion.div>
            <span className="text-xl font-display font-bold text-white tracking-tight">
              Golf<span className="text-brand-400">Charity</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, i) => {
              const active = location.pathname === link.path
              return (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors group"
                  >
                    {link.label}
                    <motion.div
                      className="absolute bottom-0 left-4 right-4 h-px bg-brand-400 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: active ? 1 : 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            {user ? (
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="btn-primary py-2 px-5 text-sm"
                >
                  Dashboard
                </Link>
              </motion.div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white/70 hover:text-white transition-colors font-medium text-sm"
                >
                  Log in
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/pricing" className="btn-primary py-2 px-5 text-sm">
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

        </div>
      </div>
    </motion.nav>
  )
}
