import { useState, useEffect } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Users, CreditCard, Trophy, Heart, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          setStats(await res.json())
        }
      } catch (err) {
        console.error('Error fetching admin stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-8 animate-pulse text-white/60">Loading admin dashboard...</div>

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <Activity className="mr-3 text-accent-400" /> Platform Overview
        </h1>
        <p className="text-white/60">High-level metrics and system status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-t-brand-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 font-medium tracking-wide text-sm uppercase">Total Users</h3>
              <Users className="text-brand-400" size={20} />
            </div>
            <div className="text-4xl font-black text-white">{stats.totalUsers}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-t-accent-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 font-medium tracking-wide text-sm uppercase">Active Subscribers</h3>
              <CreditCard className="text-accent-400" size={20} />
            </div>
            <div className="text-4xl font-black text-white">{stats.activeSubscriptions}</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-t-rose-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 font-medium tracking-wide text-sm uppercase">Monthly Draws</h3>
              <Trophy className="text-rose-400" size={20} />
            </div>
            <div className="text-4xl font-black text-white capitalize">Active</div>
          </CardBody>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 font-medium tracking-wide text-sm uppercase">Charity Pool</h3>
              <Heart className="text-purple-400" size={20} />
            </div>
            <div className="text-4xl font-black text-white text-lg">Growing</div>
            <div className="text-xs text-white/40 mt-1">Depends on active subs</div>
          </CardBody>
        </Card>
      </div>

    </div>
  )
}