import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, LayoutDashboard, PlusCircle, Trophy, Gift, Settings, Users, Percent } from 'lucide-react'

export default function DashboardLayout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const isAdmin = profile?.role === 'admin'

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Scores', path: '/dashboard/scores', icon: PlusCircle },
    { name: 'Draws & History', path: '/dashboard/draws', icon: Trophy },
    { name: 'Winnings', path: '/dashboard/winnings', icon: Gift },
    { name: 'My Charity', path: '/dashboard/charity', icon: Percent },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  const adminLinks = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Draw Engine', path: '/admin/draws', icon: Trophy },
    { name: 'Charities', path: '/admin/charities', icon: Gift },
    { name: 'Verify Winners', path: '/admin/winners', icon: Percent },
    { name: 'Reports', path: '/admin/reports', icon: Settings },
  ]

  const links = isAdmin && location.pathname.startsWith('/admin') ? adminLinks : userLinks

  const sidebarVariants = {
    hidden: { x: -280 },
    visible: { x: 0, transition: { type: 'spring', stiffness: 260, damping: 30 } },
  }

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1, x: 0,
      transition: { delay: 0.05 * i, duration: 0.3, ease: 'easeOut' },
    }),
  }

  const pageVariants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
  }

  return (
    <div className="min-h-screen bg-dark-950 flex font-sans text-white">
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="w-64 border-r border-white/10 bg-dark-900/80 backdrop-blur-xl hidden md:flex flex-col h-screen sticky top-0"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-dark-950 font-bold text-sm shadow-lg shadow-brand-500/30"
            >
              G
            </motion.div>
            <span className="text-lg font-display font-bold text-white tracking-tight">
              Golf<span className="text-brand-400">Charity</span>
            </span>
          </Link>
          {isAdmin && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block mt-2 text-xs font-bold uppercase tracking-wider text-accent-400 bg-accent-400/10 px-2 py-1 rounded border border-accent-400/20"
            >
              Admin
            </motion.span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {links.map((link, i) => {
            const Icon = link.icon
            const active = location.pathname === link.path
            return (
              <motion.div
                key={link.path}
                custom={i}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  to={link.path}
                  className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {/* Active background pill */}
                  {active && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={18}
                    className={`relative z-10 transition-colors ${active ? 'text-brand-400' : 'text-white/30 group-hover:text-white/60'}`}
                  />
                  <span className="relative z-10 font-medium text-sm">{link.name}</span>

                  {/* Active dot */}
                  {active && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-400"
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={signOut}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-colors text-left group"
          >
            <LogOut size={18} className="transition-transform group-hover:rotate-12" />
            <span className="text-sm font-medium">Sign Out</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-white/10 bg-dark-900/80 sticky top-0 z-10 flex justify-between items-center backdrop-blur-md">
          <Link to="/" className="font-display font-bold text-lg">
            Golf<span className="text-brand-400">Charity</span>
          </Link>
        </div>

        {/* Animated Page Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="p-4 md:p-8 flex-grow"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
