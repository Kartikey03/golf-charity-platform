import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Settings, User, CreditCard, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { user, profile, refetchProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [subLoading, setSubLoading] = useState(false)
  const [subscription, setSubscription] = useState(null)

  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
  })
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    async function fetchSubscription() {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subscription/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          setSubscription(await res.json())
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchSubscription()
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ full_name: formData.fullName })
      })

      if (res.ok) {
        toast.success('Profile updated successfully')
        refetchProfile()
      } else {
        toast.error('Failed to update profile')
      }
    } catch (err) {
      toast.error('Failed to update profile')
    }
    setLoading(false)
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated successfully')
      setPasswordData({ newPassword: '', confirmPassword: '' })
    }
    setLoading(false)
  }

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel? You will lose access to monthly draws and your charity contributions will stop at the end of your billing cycle.')) return
    
    setSubLoading(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subscription/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        toast.success('Subscription cancelled successfully.')
        // Reload page or refetch subscription to show status canceled
        window.location.reload()
      } else {
        toast.error('Failed to cancel subscription')
      }
    } catch (err) {
      toast.error('Network error')
    }
    setSubLoading(false)
  }

  return (
    <div className="w-full h-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <Settings className="mr-3 text-brand-400" /> Account Settings
        </h1>
        <p className="text-white/60">Manage your profile, security, and subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Settings */}
        <div className="md:col-span-2 space-y-8">
          
          <Card>
            <CardHeader className="flex flex-row flex-nowrap items-center">
               <User className="text-brand-400 mr-2" size={20} />
               <h2 className="text-xl font-bold text-white">Profile Information</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                  <Input 
                    label="Email Address" 
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" isLoading={loading}>Save Changes</Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-row flex-nowrap items-center">
               <Shield className="text-accent-400 mr-2" size={20} />
               <h2 className="text-xl font-bold text-white">Security</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <Input 
                    label="New Password" 
                    type="password"
                    minLength={8}
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  />
                  <Input 
                    label="Confirm New Password" 
                    type="password"
                    minLength={8}
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="secondary" isLoading={loading} disabled={!passwordData.newPassword}>Update Password</Button>
                </div>
              </form>
            </CardBody>
          </Card>

        </div>

        {/* Subscription Sidebar */}
        <div className="space-y-8">
           <Card>
            <CardHeader className="flex flex-row flex-nowrap items-center">
               <CreditCard className="text-rose-400 mr-2" size={20} />
               <h2 className="text-xl font-bold text-white">Subscription</h2>
            </CardHeader>
            <CardBody className="space-y-6">
               
               <div>
                 <div className="text-sm text-white/60 mb-1">Current Plan</div>
                 <div className="text-lg font-bold text-white capitalize">{subscription?.plan || 'None'}</div>
               </div>

               <div>
                 <div className="text-sm text-white/60 mb-1">Status</div>
                 <div className={`text-sm font-bold inline-flex px-2 py-1 rounded bg-white/10 ${subscription?.status === 'active' ? 'text-brand-400' : 'text-red-400'}`}>
                   {subscription?.status || 'Inactive'}
                 </div>
               </div>

               {subscription?.status === 'active' && (
                 <div className="pt-4 border-t border-white/10">
                   <Button 
                     variant="accent" 
                     className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0" 
                     onClick={handleCancelSubscription}
                     isLoading={subLoading}
                   >
                     Cancel Subscription
                   </Button>
                   <p className="text-xs text-white/40 mt-3 text-center">
                     Canceling will stop future billing. You will lose access at the end of your current cycle.
                   </p>
                 </div>
               )}

            </CardBody>
          </Card>
        </div>

      </div>

    </div>
  )
}