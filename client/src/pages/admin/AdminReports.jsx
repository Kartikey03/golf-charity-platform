import { useState, useEffect } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'
import { FileBarChart, Users, CreditCard, Heart, Trophy, Award, TrendingUp } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token
const fmt = (pence) => `£${((pence || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

function MetricCard({ label, value, sub, icon: Icon, color = 'white' }) {
  const iconColor = { brand: 'text-brand-400', accent: 'text-accent-400', rose: 'text-rose-400', purple: 'text-purple-400', yellow: 'text-yellow-400', white: 'text-white/40' }
  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <Icon className={iconColor[color] || 'text-white/40'} size={18} />
          <span className="text-xs uppercase tracking-wider text-white/50 font-bold">{label}</span>
        </div>
        <div className="text-3xl font-black text-white">{value}</div>
        {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
      </CardBody>
    </Card>
  )
}

function ProgressBar({ label, value, max, color = 'bg-brand-500' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function AdminReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/admin/reports`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setData(await res.json())
      } catch (err) { console.error('Reports load error:', err) }
      setLoading(false)
    }
    fetchReports()
  }, [])

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
      {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl" />)}
    </div>
  )

  const { subBreakdown = {}, planBreakdown = {}, charityStats = [], drawStats = {}, winnerStats = {}, priceConfig = {} } = data || {}

  const totalSubscribers = subBreakdown.active || 0
  const monthlyRev = (planBreakdown.monthly || 0) * (priceConfig.plan_monthly_pence || 999)
  const yearlyRev = (planBreakdown.yearly || 0) * (priceConfig.plan_yearly_pence || 9999)
  const totalRevPence = monthlyRev + yearlyRev
  const poolPct = (priceConfig.pool_contribution_pct || 50) / 100
  const charityPct = (priceConfig.charity_min_pct || 10) / 100
  const estPrizePoolPence = Math.floor(totalRevPence * poolPct)
  const estCharityPoolPence = Math.floor(totalRevPence * charityPct)

  const totalSubs = Object.values(subBreakdown).reduce((a, b) => a + b, 0)

  return (
    <div className="w-full h-full max-w-7xl mx-auto space-y-8 animate-fade-in">

      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <FileBarChart className="mr-3 text-brand-400" /> Reports & Analytics
        </h1>
        <p className="text-white/60">Live platform metrics across subscriptions, charity contributions, draws, and prizes.</p>
      </div>

      {/* Revenue & Financial */}
      <div>
        <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">💰 Revenue & Finance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Est. Monthly Revenue" value={fmt(totalRevPence)} sub="From all active plans" icon={TrendingUp} color="brand" />
          <MetricCard label="Est. Prize Pool" value={fmt(estPrizePoolPence)} sub={`${priceConfig.pool_contribution_pct || 50}% of revenue`} icon={Trophy} color="yellow" />
          <MetricCard label="Est. Charity Pool" value={fmt(estCharityPoolPence)} sub={`Min ${priceConfig.charity_min_pct || 10}% allocation`} icon={Heart} color="purple" />
          <MetricCard label="Total Prizes Paid" value={fmt(winnerStats.totalPaidPence)} sub={`${winnerStats.paid || 0} verified payouts`} icon={Award} color="rose" />
        </div>
      </div>

      {/* Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="text-accent-400" size={18} />
              <h2 className="text-base font-bold text-white">Subscription Status</h2>
            </div>
            <div className="space-y-4">
              <ProgressBar label="Active" value={subBreakdown.active || 0} max={totalSubs} color="bg-brand-500" />
              <ProgressBar label="Cancelled" value={subBreakdown.cancelled || 0} max={totalSubs} color="bg-rose-500" />
              <ProgressBar label="Lapsed" value={subBreakdown.lapsed || 0} max={totalSubs} color="bg-yellow-500" />
              <ProgressBar label="Past Due" value={subBreakdown.past_due || 0} max={totalSubs} color="bg-orange-500" />
              <ProgressBar label="Inactive" value={subBreakdown.inactive || 0} max={totalSubs} color="bg-white/20" />
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex gap-6 text-sm">
              <div>
                <div className="text-white/40 text-xs mb-1">Monthly Plans</div>
                <div className="text-white font-bold">{planBreakdown.monthly || 0}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-1">Yearly Plans</div>
                <div className="text-white font-bold">{planBreakdown.yearly || 0}</div>
              </div>
              <div>
                <div className="text-white/40 text-xs mb-1">Total Active</div>
                <div className="text-brand-400 font-bold">{totalSubscribers}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Charity Contributions */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Heart className="text-purple-400" size={18} />
              <h2 className="text-base font-bold text-white">Charity Support</h2>
            </div>
            {charityStats.length === 0 ? (
              <div className="text-white/40 text-sm italic">No charity contributions recorded.</div>
            ) : (
              <div className="space-y-4">
                {charityStats.map(c => (
                  <div key={c.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-white/80 truncate max-w-[200px]">{c.name}</span>
                      <div className="text-right ml-2 shrink-0">
                        <span className="text-sm font-bold text-white">{c.count} supporters</span>
                        <span className="text-xs text-white/40 ml-2">avg {c.count > 0 ? Math.round(c.totalPct / c.count) : 0}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${charityStats[0]?.count > 0 ? (c.count / charityStats[0].count) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Draw & Winner Statistics */}
      <div>
        <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">🏆 Draw & Winner Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Draws" value={drawStats.total || 0} icon={Trophy} color="yellow" />
          <MetricCard label="Published Draws" value={drawStats.published || 0} icon={Trophy} color="brand" />
          <MetricCard label="Total Winners" value={winnerStats.total || 0} icon={Award} color="accent" />
          <MetricCard label="Pending Review" value={winnerStats.pending || 0} sub={winnerStats.pending > 0 ? 'Action required' : 'All clear'} icon={Award} color={winnerStats.pending > 0 ? 'rose' : 'white'} />
        </div>

        {/* Winner Status Breakdown */}
        <Card className="mt-4">
          <CardBody className="p-6">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Winner Verification Pipeline</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { label: 'Pending', value: winnerStats.pending || 0, color: 'text-white/60' },
                { label: 'Approved', value: winnerStats.approved || 0, color: 'text-brand-400' },
                { label: 'Rejected', value: winnerStats.rejected || 0, color: 'text-red-400' },
                { label: 'Paid Out', value: winnerStats.paid || 0, color: 'text-brand-300' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-xl p-4">
                  <div className={`text-3xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">{item.label}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

    </div>
  )
}