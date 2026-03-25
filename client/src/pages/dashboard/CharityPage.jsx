import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Heart, Search, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function CharityPage() {
  const { user, profile, refetchProfile } = useAuth()
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const [formData, setFormData] = useState({
    charityId: '',
    charityPct: 10
  })

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
  }

  useEffect(() => {
    async function init() {
      try {
        const token = await getToken()
        
        // Fetch charities via backend API
        const charitiesRes = await fetch(`${API_URL}/api/charities`)
        const charitiesData = charitiesRes.ok ? await charitiesRes.json() : []
        setCharities(charitiesData)
        
        // Fetch current user's contribution via backend API
        if (token) {
          const contribRes = await fetch(`${API_URL}/api/charities/contribution`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const contrib = contribRes.ok ? await contribRes.json() : null
          
          if (contrib) {
            setFormData({
              charityId: contrib.charity_id || (charitiesData[0]?.id) || '',
              charityPct: contrib.percentage || 10
            })
          } else {
            setFormData({
              charityId: (charitiesData[0]?.id) || '',
              charityPct: 10
            })
          }
        }
      } catch (err) {
        console.error('Failed to load charity data:', err)
      }
      setLoading(false)
    }
    init()
  }, [user])

  const handleUpdate = async () => {
    if (formData.charityPct < 10) return toast.error('Minimum contribution is 10%')
    if (!formData.charityId) return toast.error('Please select a charity')
    
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/charities/contribution`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          charity_id: formData.charityId,
          percentage: formData.charityPct
        })
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('Charity update error:', err)
        toast.error('Failed to update preferences')
      } else {
        toast.success('Charity impact preferences saved!')
        refetchProfile()
      }
    } catch (err) {
      console.error('Charity update error:', err)
      toast.error('Failed to update preferences')
    }
    setSaving(false)
  }

  const handleDonation = () => {
    toast('Independent donations coming soon!', { icon: '🚧' })
  }

  const selectedCharity = charities.find(c => c.id === formData.charityId)

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-white/10 rounded w-3/4"></div></div></div>

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <Heart className="mr-3 text-brand-400" /> My Impact
        </h1>
        <p className="text-white/60">Manage your monthly contribution percentage and chosen charity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader className="flex flex-row flex-nowrap items-center">
               <DollarSign className="text-brand-400 mr-2" size={20} />
               <h2 className="text-xl font-bold text-white">Contribution</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-3">
                  Percentage of Subscription Fee
                </label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-4xl font-black text-white">{formData.charityPct}%</div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    className="w-full accent-brand-500"
                    value={formData.charityPct}
                    onChange={e => setFormData({ ...formData, charityPct: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-center text-white/40">
                    A minimum of 10% of your plan fee goes directly to your charity. You can increase this anytime to maximize your impact.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <Button onClick={handleUpdate} isLoading={saving} className="w-full py-3">
                  Save Preferences
                </Button>
              </div>

            </CardBody>
          </Card>

          <Card>
            <CardHeader>
               <h2 className="text-xl font-bold text-white">One-off Donation</h2>
            </CardHeader>
            <CardBody>
               <p className="text-sm text-white/60 mb-4">Want to make an additional contribution to {selectedCharity ? selectedCharity.name : 'your charity'} independent of your subscription?</p>
               <Button onClick={handleDonation} variant="secondary" className="w-full py-2">
                 Donate Now
               </Button>
            </CardBody>
          </Card>
        </div>

        {/* Charity Directory/Selection Column */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
               <h2 className="text-xl font-bold text-white mb-2">Change Supported Charity</h2>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                  <input 
                    type="text" 
                    placeholder="Find a charity..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-500"
                  />
               </div>
            </CardHeader>
            <div className="flex-grow overflow-y-auto max-h-[600px] p-2 space-y-2">
              {charities
                .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                .map((charity) => {
                const isSelected = charity.id === formData.charityId

                return (
                  <div 
                    key={charity.id} 
                    onClick={() => setFormData({...formData, charityId: charity.id})}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-brand-500/10 border-brand-500/50' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                  >
                    <div className="flex items-start">
                       <div className="w-12 h-12 rounded-lg bg-dark-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden mr-4">
                         {charity.logo_url ? <img src={charity.logo_url} className="w-full h-full object-cover" /> : <Heart size={20} className="text-brand-400" />}
                       </div>
                       <div>
                         <h3 className="text-white font-bold">{charity.name}</h3>
                         <p className="text-white/60 text-xs line-clamp-2 mt-1">{charity.description}</p>
                         
                         <Link to={`/charities/${charity.slug || charity.id}`} onClick={e => e.stopPropagation()} className="inline-block mt-2 text-xs text-brand-400 hover:text-brand-300">
                           View Profile
                         </Link>
                       </div>
                       
                       {isSelected && (
                         <div className="ml-auto shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-brand-500 text-dark-950">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         </div>
                       )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

      </div>

    </div>
  )
}