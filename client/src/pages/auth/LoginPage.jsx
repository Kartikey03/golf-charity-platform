import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Welcome back!')
      // AuthContext will automatically redirect via protected route or we can force navigate
      navigate('/dashboard')
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-white/60">Log in to track your scores and see upcoming draws</p>
      </div>

      <Card className="w-full max-w-md animate-slide-up">
        <CardBody className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full py-3">
              Log In
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-white/60">
            Don't have an account?{' '}
            <Link to="/pricing" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
              View Plans & Sign Up
            </Link>
          </div>
        </CardBody>
      </Card>

    </div>
  )
}