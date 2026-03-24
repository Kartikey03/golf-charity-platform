import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, profile } = useAuth()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-dark-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-dark-950 font-bold text-xl group-hover:scale-105 transition-transform">
              G
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">
              Golf<span className="text-brand-400">Charity</span>
            </span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link to="/how-it-works" className="text-white/70 hover:text-white transition-colors">How it works</Link>
            <Link to="/pricing" className="text-white/70 hover:text-white transition-colors">Pricing</Link>
            <Link to="/charities" className="text-white/70 hover:text-white transition-colors">Charities</Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link to={profile?.role === 'admin' ? '/admin' : '/dashboard'} className="btn-primary py-2 px-5 text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-white/70 hover:text-white transition-colors font-medium">Log in</Link>
                <Link to="/pricing" className="btn-primary py-2 px-5 text-sm">Get Started</Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
