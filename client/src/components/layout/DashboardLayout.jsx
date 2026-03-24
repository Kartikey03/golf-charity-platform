import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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

  return (
    <div className="min-h-screen bg-dark-950 flex font-sans text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-dark-900/50 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-2 group">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-dark-950 font-bold text-sm">
                G
             </div>
             <span className="text-lg font-display font-bold text-white tracking-tight">
                Golf<span className="text-brand-400">Charity</span>
             </span>
          </Link>
          {isAdmin && <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wider text-accent-400 bg-accent-400/10 px-2 py-1 rounded">Admin</span>}
        </div>

        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon
            const active = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}

                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active ? 'bg-white/10 text-brand-400 font-medium' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} className={active ? 'text-brand-400' : 'text-white/40'} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={signOut}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors text-left"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-white/10 bg-dark-900/80 sticky top-0 z-10 flex justify-between items-center backdrop-blur-md">
           <Link to="/" className="font-display font-bold text-lg">Golf<span className="text-brand-400">Charity</span></Link>
           {/* Mobile menu toggle would go here */}
        </div>

        <div className="p-4 md:p-8 flex-grow">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
