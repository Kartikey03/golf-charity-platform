import { useState, useEffect } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, CreditCard, Trophy, Heart, Activity, Award, TrendingUp, Clock } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

const colorMap = {
  brand:  { border: 'border-t-brand-500',  icon: 'text-brand-400',  glow: 'hover:shadow-brand-500/10' },
  accent: { border: 'border-t-accent-500', icon: 'text-accent-400', glow: 'hover:shadow-accent-500/10' },
  rose:   { border: 'border-t-rose-500',   icon: 'text-rose-400',   glow: 'hover:shadow-rose-500/10' },
  purple: { border: 'border-t-purple-500', icon: 'text-purple-400', glow: 'hover:shadow-purple-500/10' },
  yellow: { border: 'border-t-yellow-500', icon: 'text-yellow-400', glow: 'hover:shadow-yellow-500/10' },
  teal:   { border: 'border-t-teal-500',   icon: 'text-teal-400',   glow: 'hover:shadow-teal-500/10' },
}

function StatCard({ label, value, sub, icon: Icon, color = 'brand', to }) {
  const c = colorMap[color] || colorMap.brand

  const content = (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <Card className={`border-t-4 ${c.border} hover:shadow-xl ${c.glow} transition-shadow duration-300 h-full`}>
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white/50 font-medium tracking-wide text-xs uppercase">{label}</h3>
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
              <Icon className={c.icon} size={20} />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="text-4xl font-black text-white"
          >
            {value}
          </motion.div>
          {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
        </CardBody>
      </Card>
    </motion.div>
  )

  return to ? <Link to={to}>{content}</Link> : content
}

const STATUS_COLORS = {
  published: 'bg-brand-500/20 text-brand-400',
  simulation: 'bg-accent-500/20 text-accent-400',
  pending: 'bg-white/10 text-white/50',
  paid: 'bg-brand-500 text-dark-950',
  approved: 'bg-brand-500/20 text-brand-400',
  rejected: 'bg-red-500/20 text-red-400',
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
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const fmt = (p) => `£${((p || 0) / 100).toFixed(2)}`

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className="h-28 bg-white/5 rounded-2xl"
        />
      ))}
    </div>
  )

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="mr-3"
          >
            <Activity className="text-accent-400" />
          </motion.span>
          Platform Overview
        </h1>
        <p className="text-white/50">Real-time metrics across users, subscriptions, draws, and charities.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <StatCard label="Total Users" value={stats?.totalUsers ?? '—'} icon={Users} color="brand" to="/admin/users" />
        <StatCard
          label="Active Subscribers"
          value={stats?.activeSubscriptions ?? '—'}
          sub={`${stats?.monthlySubscriptions ?? 0} monthly · ${stats?.yearlySubscriptions ?? 0} yearly`}
          icon={CreditCard} color="accent" to="/admin/users"
        />
        <StatCard
          label="Est. Monthly Revenue"
          value={stats ? fmt(stats.monthlyRevenuePence) : '—'}
          sub="From active subscriptions"
          icon={TrendingUp} color="teal"
        />
        <StatCard label="Total Draws" value={stats?.totalDraws ?? '—'} icon={Trophy} color="yellow" to="/admin/draws" />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingWinners ?? '—'}
          sub={stats?.pendingWinners > 0 ? 'Require review' : 'All clear'}
          icon={Clock}
          color={stats?.pendingWinners > 0 ? 'rose' : 'brand'}
          to="/admin/winners"
        />
        <StatCard label="Active Charities" value={stats?.activeCharities ?? '—'} icon={Heart} color="purple" to="/admin/charities" />
        <StatCard
          label="Total Prizes Paid"
          value={stats ? fmt(stats.totalPaidOutPence) : '—'}
          sub="Verified & paid to winners"
          icon={Award} color="rose" to="/admin/winners"
        />
      </motion.div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Draws */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <Card>
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recent Draws</h2>
              <Link to="/admin/draws" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
            </div>
            <div className="divide-y divide-white/5">
              {draws.length === 0 ? (
                <div className="px-6 py-8 text-center text-white/30 text-sm">No draws yet.</div>
              ) : draws.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <div className="text-white font-medium text-sm">{d.title}</div>
                    <div className="text-white/40 text-xs mt-0.5">{d.total_subscribers} subscribers · {d.draw_type}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {d.drawn_numbers && (
                      <div className="hidden sm:flex gap-1">
                        {d.drawn_numbers.map((n, j) => (
                          <motion.span
                            key={j}
                            whileHover={{ scale: 1.2 }}
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${d.status === 'published' ? 'bg-brand-500 text-dark-950' : 'bg-white/15 text-white'}`}
                          >
                            {n}
                          </motion.span>
                        ))}
                      </div>
                    )}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${STATUS_COLORS[d.status] || 'bg-white/10 text-white/50'}`}>
                      {d.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Winners */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <Card>
            <div className="px-6 pt-5 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recent Winners</h2>
              <Link to="/admin/winners" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
            </div>
            <div className="divide-y divide-white/5">
              {recentWinners.length === 0 ? (
                <div className="px-6 py-8 text-center text-white/30 text-sm">No winners yet.</div>
              ) : recentWinners.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.07 }}
                  className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div>
                    <div className="text-white font-medium text-sm">{w.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-white/40 text-xs mt-0.5">{w.draw_periods?.title} · {w.draw_entries?.prize_tier || '—'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-brand-400 font-mono text-sm font-bold">{fmt(w.prize_amount)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${STATUS_COLORS[w.status] || 'bg-white/10 text-white/50'}`}>
                      {w.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}
