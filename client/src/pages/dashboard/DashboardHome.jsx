import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function DashboardHome() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const isJustSubscribed = searchParams.get('subscribed') === 'true'

  useEffect(() => {
    async function initDashboard() {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (!token) { setLoading(false); return }

      // If returning from successful Stripe checkout, verify and sync the subscription
      if (isJustSubscribed) {
        toast.success('Subscription successful! Welcome to the club.')
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subscription/verify`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          })
        } catch (err) {
          console.error('Subscription verify error:', err)
        }
      }

      // Fetch subscription status
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subscription/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setSubscription(data)
        }
      } catch (err) {
        console.error('Error fetching subscription:', err)
      } finally {
        setLoading(false)
      }
    }
    initDashboard()
  }, [isJustSubscribed])

  const handleCheckout = async (plan) => {
    setCheckoutLoading(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subscription/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ plan })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to create checkout session')
      }
    } catch (err) {
      toast.error('Network error during checkout')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const isActive = subscription?.status === 'active'

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-white/10 rounded w-3/4"></div></div></div>
  }

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'}!
          </h1>
          <p className="text-white/60">Here's your latest performance and impact summary.</p>
        </div>
      </div>

      {!isActive ? (
        <Card className="border-brand-500/30 bg-gradient-to-br from-brand-900/20 to-dark-900">
          <CardBody className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center text-brand-400 font-bold mb-2">
                <AlertCircle size={20} className="mr-2" />
                No Active Subscription
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Activate Your Acccount</h2>
              <p className="text-white/70 max-w-xl">
                You need an active subscription to log scores, enter the monthly draws, and support your chosen charity.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button onClick={() => handleCheckout(profile?.selected_plan || 'monthly')} isLoading={checkoutLoading} className="px-8 py-3 whitespace-nowrap">
                Subscribe Now
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/20">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 font-medium">Subscription Status</h3>
                <CheckCircle2 className="text-brand-400" size={20} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">Active</div>
              <div className="text-sm text-brand-400">Renews automatically</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 font-medium">Eligible Scores</h3>
                <span className="text-xs font-bold px-2 py-1 rounded bg-white/10">This Month</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">0 <span className="text-lg text-white/40 font-normal">/ 5</span></div>
              <div className="text-sm text-white/60 mt-2">
                <Link to="/dashboard/scores" className="text-brand-400 hover:text-brand-300 flex items-center">
                  Log a score <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 font-medium">Total Charity Impact</h3>
                <span className="text-xs font-bold px-2 py-1 rounded bg-rose-500/20 text-rose-400">Lifetime</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">$0.00</div>
              <div className="text-sm text-white/60 mt-2">
                <Link to="/dashboard/charity" className="text-brand-400 hover:text-brand-300 flex items-center">
                  View details <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Placeholder for Recent Activity */}
      <h2 className="text-xl font-bold text-white mt-12 mb-6">Recent Activity</h2>
      <Card>
        <div className="divide-y divide-white/10">
           <div className="p-6 text-center text-white/40">No recent activity to show.</div>
        </div>
      </Card>

    </div>
  )
}