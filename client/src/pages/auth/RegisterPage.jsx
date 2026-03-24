import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { PLANS } from '../../constants'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedPlan = searchParams.get('plan') || 'monthly'
  const preselectedCharity = searchParams.get('charity') || ''

  const [loading, setLoading] = useState(false)
  const [charities, setCharities] = useState([])
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: preselectedPlan,
    charityId: preselectedCharity,
    charityPct: 10
  })

  useEffect(() => {
    async function fetchCharities() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/charities`)
        if (res.ok) {
          const data = await res.json()
          // Sort alphabetically
          const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
          setCharities(sorted)
        }
      } catch (err) {
        console.error('Failed to fetch charities:', err)
      }
    }
    fetchCharities()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (formData.charityPct < 10) {
      return toast.error('Minimum charity contribution is 10%')
    }
    if (!formData.charityId) {
      return toast.error('Please select a charity')
    }

    setLoading(true)
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          charity_id: formData.charityId,
          charity_pct: parseInt(formData.charityPct),
          selected_plan: formData.plan
        }
      }
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Registration successful! Please log in.')
      // If email confirmation is required, inform the user
      if (authData?.user?.identities?.length === 0) {
        toast.error('This email is already registered. Please log in.')
      }
      navigate('/login')
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Create Your Account</h1>
        <p className="text-white/60">Join the community, log your scores, and start giving back.</p>
      </div>

      <Card className="w-full max-w-xl animate-slide-up">
        <CardBody className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <Input
                label="Confirm Password"
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <h3 className="text-lg font-bold text-white mb-4">Subscription & Impact</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Select Plan</label>
                  <select 
                    className="w-full input-field bg-dark-900"
                    value={formData.plan}
                    onChange={e => setFormData({ ...formData, plan: e.target.value })}
                  >
                    {Object.values(PLANS).map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.label} - {plan.currency}{plan.price}/{plan.interval}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Choose Charity</label>
                  <select 
                    className="w-full input-field bg-dark-900"
                    required
                    value={formData.charityId}
                    onChange={e => setFormData({ ...formData, charityId: e.target.value })}
                  >
                    <option value="" disabled>Select a verified charity</option>
                    {charities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Contribution Percentage (%)</label>
                  <div className="flex items-center space-x-4">
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
                      className="w-full accent-brand-500"
                      value={formData.charityPct}
                      onChange={e => setFormData({ ...formData, charityPct: e.target.value })}
                    />
                    <span className="text-xl font-bold text-brand-400 w-16 text-right">{formData.charityPct}%</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Minimum contribution is 10% of your subscription fee.</p>
                </div>
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-3 mt-8">
              Complete Registration
            </Button>
            
          </form>

          <div className="mt-8 text-center text-sm text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              Log In
            </Link>
          </div>
        </CardBody>
      </Card>

    </div>
  )
}