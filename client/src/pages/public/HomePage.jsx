import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody } from '../../components/ui/Card'
import { ArrowRight, Trophy, Heart, Coins } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function HomePage() {
  const [featuredCharities, setFeaturedCharities] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/charities`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setFeaturedCharities((data || []).filter(c => c.is_featured)))
      .catch(() => {})
  }, [])

  return (
    <div className="w-full">

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-glow pointer-events-none rounded-full blur-[100px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse"></span>
            <span className="text-sm text-white/80 font-medium">Monthly draws now active</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight leading-tight mb-8">
            Play your game. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-400">
              Change their world.
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
            The subscription platform that links your golf performance directly to charitable giving—and rewards you with huge monthly prize pools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 px-8 py-4 text-lg w-full sm:w-auto">
              Start Making an Impact <ArrowRight size={20} />
            </Link>
            <Link to="/how-it-works" className="btn-secondary px-8 py-4 text-lg w-full sm:w-auto text-center">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-dark-950 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <Card className="hover:-translate-y-2 transition-transform duration-300">
              <CardBody className="p-8 text-center sm:text-left flex flex-col items-center sm:items-start text-white">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-6 text-brand-400">
                  <Trophy size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Track Your Form</h3>
                <p className="text-white/60">
                  Log your latest 5 Stableford scores. No complicated handicaps, just pure performance tracking that feeds into our draw engine.
                </p>
              </CardBody>
            </Card>

            <Card className="hover:-translate-y-2 transition-transform duration-300">
              <CardBody className="p-8 text-center sm:text-left flex flex-col items-center sm:items-start text-white">
                <div className="w-14 h-14 rounded-2xl bg-accent-500/20 flex items-center justify-center mb-6 text-accent-400">
                  <Coins size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Win Big</h3>
                <p className="text-white/60">
                  Every month, your scores enter a draw. Match 3, 4, or 5 numbers derived from the algorithm to win a share of the rolling jackpot.
                </p>
              </CardBody>
            </Card>

            <Card className="hover:-translate-y-2 transition-transform duration-300">
              <CardBody className="p-8 text-center sm:text-left flex flex-col items-center sm:items-start text-white">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-6 text-rose-400">
                  <Heart size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-3">Support Causes</h3>
                <p className="text-white/60">
                  A minimum of 10% of your subscription goes directly to your chosen charity. Increase it anytime to maximise your impact.
                </p>
              </CardBody>
            </Card>

          </div>
        </div>
      </section>

      {/* Featured Charities */}
      {featuredCharities.length > 0 && (
        <section className="py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Spotlight Causes
              </h2>
              <p className="text-white/60 text-lg">
                These organisations are making a real difference. Your subscription helps fund their work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCharities.map(charity => (
                <Link key={charity.id} to={`/charities/${charity.slug || charity.id}`}>
                  <Card className="h-full hover:-translate-y-1 transition-transform duration-200 group border-white/5 hover:border-brand-500/30">
                    <CardBody className="p-6 flex flex-col h-full">
                      <div className="w-full h-28 rounded-xl bg-dark-800 mb-5 flex items-center justify-center overflow-hidden">
                        {charity.logo_url
                          ? <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          : <Heart className="text-white/20" size={36} />
                        }
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{charity.name}</h3>
                      <p className="text-white/60 text-sm flex-grow line-clamp-3 mb-4">
                        {charity.description}
                      </p>
                      <div className="mt-auto flex items-center text-brand-400 font-medium text-sm group-hover:text-brand-300">
                        Learn more <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/charities" className="btn-secondary px-6 py-3 inline-flex items-center gap-2">
                View All Charities <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 to-dark-950"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to join the club?
          </h2>
          <p className="text-xl text-white/60 mb-10">
            Subscribe today for less than the cost of a sleeve of balls.
          </p>
          <Link to="/pricing" className="btn-accent px-8 py-4 text-lg inline-block">
            View Plans & Pricing
          </Link>
        </div>
      </section>

    </div>
  )
}
