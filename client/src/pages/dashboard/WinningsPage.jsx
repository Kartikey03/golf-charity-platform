import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Award, UploadCloud, CheckCircle2, Clock, DollarSign } from 'lucide-react'

export default function WinningsPage() {
  const { user } = useAuth()
  const [winnings, setWinnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState(null)

  useEffect(() => {
    fetchWinnings()
  }, [])

  const fetchWinnings = async () => {
    try {
      const { data, error } = await supabase
        .from('draw_results')
        .select(`
          *,
          draw_period:draw_periods(title, draw_month)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setWinnings(data || [])
    } catch (err) {
      console.error('Error fetching winnings:', err)
      toast.error('Failed to load winnings')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e, resultId) => {
    const file = e.target.files[0]
    if (!file) return

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size must be under 5MB')
    }

    setUploadingId(resultId)
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${resultId}-${Math.random()}.${fileExt}`
      const filePath = `scorecards/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verifications')
        .getPublicUrl(filePath)

      // Update draw_result record
      const { error: updateError } = await supabase
        .from('draw_results')
        .update({ 
          verification_proof_url: publicUrl,
          status: 'pending_verification'
        })
        .eq('id', resultId)

      if (updateError) throw updateError

      toast.success('Scorecard uploaded successfully! Pending verification.')
      fetchWinnings()
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload verification proof')
    } finally {
      setUploadingId(null)
    }
  }

  if (loading) return <div className="p-8 animate-pulse text-white/60">Loading winnings...</div>

  return (
    <div className="w-full h-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <Award className="mr-3 text-brand-400" /> My Winnings
        </h1>
        <p className="text-white/60">Track your prizes and upload scorecards for verification.</p>
      </div>

      <div className="space-y-6">
        {winnings.length === 0 ? (
          <Card className="border-dashed border-2 border-white/10 bg-transparent">
            <CardBody className="p-12 text-center text-white/40 flex flex-col items-center">
              <Award size={48} className="mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No winnings yet</h3>
              <p className="max-w-md mx-auto">
                Keep logging your Stableford scores and stay subscribed to be eligible for upcoming draws. Your matching numbers will appear here!
              </p>
            </CardBody>
          </Card>
        ) : (
          winnings.map(win => (
            <Card key={win.id} className="relative overflow-hidden group border-brand-500/20 bg-gradient-to-br from-white/[0.02] to-transparent">
              {win.is_jackpot && (
                <div className="absolute top-0 right-0 bg-accent-500 text-dark-950 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  JACKPOT WINNER
                </div>
              )}
              <CardBody className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  <div className="flex-1">
                    <div className="text-sm text-brand-400 font-bold tracking-wider uppercase mb-1">
                      {win.draw_period?.title} 
                      <span className="text-white/40 ml-2">({win.match_type} MATCH)</span>
                    </div>
                    <div className="text-3xl font-black text-white flex items-center mb-2">
                      <DollarSign size={24} className="text-white/40 mr-1" />
                      {win.prize_amount?.toLocaleString() || '0.00'}
                    </div>
                    <div className="text-sm text-white/60">
                      Won on {new Date(win.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="w-full md:w-auto min-w-[250px] bg-dark-900 border border-white/10 p-5 rounded-xl">
                    <div className="text-xs text-white/40 font-bold uppercase tracking-widest mb-3">Status</div>
                    
                    {win.status === 'unverified' ? (
                      <div className="space-y-3">
                        <div className="flex items-center text-rose-400 text-sm font-medium">
                          <Clock size={16} className="mr-2" /> Pending Verification
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Please upload a clear photo of your signed scorecard to claim this prize.
                        </p>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => handleFileUpload(e, win.id)}
                            disabled={uploadingId === win.id}
                          />
                          <Button 
                            className="w-full relative pointer-events-none" 
                            variant="secondary"
                            isLoading={uploadingId === win.id}
                          >
                            <UploadCloud size={16} className="mr-2" /> 
                            {uploadingId === win.id ? 'Uploading...' : 'Upload Scorecard'}
                          </Button>
                        </div>
                      </div>
                    ) : win.status === 'pending_verification' ? (
                      <div className="space-y-3">
                        <div className="flex items-center text-accent-400 text-sm font-medium">
                          <Clock size={16} className="mr-2" /> Under Review
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Your scorecard has been uploaded and is currently being verified by our team.
                        </p>
                        {win.verification_proof_url && (
                          <a href={win.verification_proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:text-brand-300 underline block mt-2">
                            View uploaded proof
                          </a>
                        )}
                      </div>
                    ) : win.status === 'verified_unpaid' ? (
                      <div className="space-y-3">
                        <div className="flex items-center text-brand-400 text-sm font-medium">
                          <CheckCircle2 size={16} className="mr-2" /> Verified
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Your scorecard is verified! The prize amount will be transferred to your account shortly.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center text-brand-400 text-sm font-medium">
                          <CheckCircle2 size={16} className="mr-2" /> Paid
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed">
                          This prize has been successfully paid out.
                        </p>
                      </div>
                    )}
                  </div>
                  
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

    </div>
  )
}