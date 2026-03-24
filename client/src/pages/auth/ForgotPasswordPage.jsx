import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard/settings?reset=true`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="w-full max-w-md mb-8">
        <Link to="/login" className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={14} className="mr-1" /> Back to Login
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Reset Password</h1>
        <p className="text-white/60">We'll send you a link to reset your password</p>
      </div>

      <Card className="w-full max-w-md animate-slide-up">
        <CardBody className="p-8">
          {sent ? (
            <div className="text-center text-white/80 py-4">
              <div className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p>Check your email for a password reset link.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button type="submit" isLoading={loading} className="w-full py-3">
                Send Reset Link
              </Button>
            </form>
          )}
        </CardBody>
      </Card>

    </div>
  )
}