import { useState, useEffect } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { Users, CreditCard, Trophy, Heart, Activity, Award, TrendingUp, Clock } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token

function StatCard({ label, value, sub, icon: Icon, color = 'brand', to }) {
  const colorMap = {
    brand: 'border-t-brand-500',
    accent: 'border-t-accent-500',
    rose: 'border-t-rose-500',
    purple: 'border-t-purple-500',
    yellow: 'border-t-yellow-500',
    teal: 'border-t-teal-500',
  }
  const iconColorMap = {
    brand: 'text-brand-400',
    accent: 'text-accent-400',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
    teal: 'text-teal-400',
  }
  const content = (
    <Card className={`border-t-4 ${colorMap[color]} hover:scale-[1.02] transition-transform`}>
      <CardBody className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white/60 font-medium tracking-wide text-xs uppercase">{label}</h3>
          <Icon className={iconColorMap[color]} size={20} />
        </div>
        <div className="text-4xl font-black text-white">{value}</div>
        {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
      </CardBody>
    </Card>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [draws, setDraws] = useState([])
  const [recentWinners, setRecentWinners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        const [statsRes, drawsRes, winnersRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/stats`, { headers }),
          fetch(`${API_URL}/api/draws/all`, { headers }),
          fetch(`${API_URL}/api/admin/winners?status=all`, { headers }),
        ])

        if (statsRes.ok) setStats(await statsRes.json())
        if (drawsRes.ok) setDraws((await drawsRes.json()).slice(0, 5))
        if (winnersRes.ok) setRecentWinners((await winnersRes.json()).slice(0, 5))
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const fmt = (pence) => `£${((pence || 0) / 100).toFixed(2)}`

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-28 bg-white/5 rounded-2xl" />
      ))}
    </div>
  )

  return (
    <div className="w-full h-full max-w-7xl mx-auto space-y-8 animate-fade-in">

      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <Activity className="mr-3 text-accent-400" /> Platform Overview
        </h1>
        <p className="text-white/60">Real-time metrics across users, subscriptions, draws, and charities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} icon={Users} color="brand" to="/admin/users" />
        <StatCard
          label="Active Subscribers"
          value={stats?.activeSubscriptions ?? '—'}
          sub={`${stats?.monthlySubscriptions ?? 0} monthly · ${stats?.yearlySubscriptions ?? 0} yearly`}
          icon={CreditCard}
          color="accent"
          to="/admin/users"
        />
        <StatCard
          label="Est. Monthly Revenue"
          value={stats ? fmt(stats.monthlyRevenuePence) : '—'}
          sub="From active subscriptions"
          icon={TrendingUp}
          color="teal"
        />
        <StatCard
          label="Total Draws"
          value={stats?.totalDraws ?? '—'}
          icon={Trophy}
          color="yellow"
          to="/admin/draws"
        />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingWinners ?? '—'}
          sub={stats?.pendingWinners > 0 ? 'Require review' : 'All clear'}
          icon={Clock}
          color={stats?.pendingWinners > 0 ? 'rose' : 'brand'}
          to="/admin/winners"
        />
        <StatCard
          label="Active Charities"
          value={stats?.activeCharities ?? '—'}
          icon={Heart}
          color="purple"
          to="/admin/charities"
        />
        <StatCard
          label="Total Prizes Paid"
          value={stats ? fmt(stats.totalPaidOutPence) : '—'}
          sub="Verified & paid to winners"
          icon={Award}
          color="rose"
          to="/admin/winners"
        />
      </div>

      {/* Recent Draws */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Draws</h2>
            <Link to="/admin/draws" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          <div className="divide-y divide-white/5">
            {draws.length === 0 ? (
              <div className="px-6 py-8 text-center text-white/40 text-sm">No draws yet.</div>
            ) : draws.map(d => (
              <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium text-sm">{d.title}</div>
                  <div className="text-white/40 text-xs mt-0.5">{d.total_subscribers} subscribers · {d.draw_type}</div>
                </div>
                <div className="flex items-center gap-3">
                  {d.drawn_numbers && (
                    <div className="hidden sm:flex gap-1">
                      {d.drawn_numbers.map((n, i) => (
                        <span key={i} className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${d.status === 'published' ? 'bg-brand-500 text-dark-950' : 'bg-white/15 text-white'}`}>{n}</span>
                      ))}
                    </div>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    d.status === 'published' ? 'bg-brand-500/20 text-brand-400' :
                    d.status === 'simulation' ? 'bg-accent-500/20 text-accent-400' :
                    'bg-white/10 text-white/50'
                  }`}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Winners */}
        <Card>
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Winners</h2>
            <Link to="/admin/winners" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentWinners.length === 0 ? (
              <div className="px-6 py-8 text-center text-white/40 text-sm">No winners yet.</div>
            ) : recentWinners.map(w => (
              <div key={w.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium text-sm">{w.profiles?.full_name || 'Unknown'}</div>
                  <div className="text-white/40 text-xs mt-0.5">{w.draw_periods?.title} · {w.draw_entries?.prize_tier || '—'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-brand-400 font-mono text-sm font-bold">{fmt(w.prize_amount)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    w.status === 'paid' ? 'bg-brand-500 text-dark-950' :
                    w.status === 'approved' ? 'bg-brand-500/20 text-brand-400' :
                    w.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white/50'
                  }`}>{w.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  )
}