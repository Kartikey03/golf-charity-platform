import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-dark-950 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-dark-950 font-bold text-sm">
                G
              </div>
              <span className="text-lg font-display font-bold text-white">
                Golf<span className="text-brand-400">Charity</span>
              </span>
            </Link>
            <p className="text-white/60 max-w-sm">
              Making every swing count. Join the community tying golf performance directly to charitable impact.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/pricing" className="text-white/60 hover:text-brand-400 transition-colors">Pricing & Plans</Link></li>
              <li><Link to="/how-it-works" className="text-white/60 hover:text-brand-400 transition-colors">How it works</Link></li>
              <li><Link to="/charities" className="text-white/60 hover:text-brand-400 transition-colors">Our Charities</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-brand-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-white/60 hover:text-brand-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/60 hover:text-brand-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} Golf Charity Platform. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Not affiliated with any official golf association.</p>
        </div>
      </div>
    </footer>
  )
}
