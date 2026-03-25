import { useState, useEffect } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Award, CheckCircle2, XCircle, Search, ExternalLink } from 'lucide-react'

export default function AdminWinners() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('winner_verifications')
        .select(`
          *,
          profiles:user_id(full_name, email),
          draw_periods:draw_period_id(title, draw_month)
        `)
        .order('created_at', { ascending: false })
        
      if (error) throw error
      setWinners(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load winners')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this as ${newStatus.replace('_', ' ')}?`)) return
    
    setProcessingId(id)
    try {
      const { error } = await supabase
        .from('winner_verifications')
        .update({ status: newStatus, reviewed_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      toast.success(`Marked as ${newStatus.replace('_', ' ')}`)
      fetchWinners()
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setProcessingId(null)
    }
  }

  const filteredWinners = winners.filter(w => 
    w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    w.draw_periods?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Award className="mr-3 text-brand-400" /> Winner Verification
          </h1>
          <p className="text-white/60">Review scorecards, verify winners, and mark payouts.</p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
           <input 
             type="text" 
             placeholder="Search winners..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-500"
           />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Draw</th>
                <th className="px-6 py-4">Match / Prize</th>
                <th className="px-6 py-4">Scorecard Proof</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-white/40 animate-pulse">Loading winners...</td>
                </tr>
              ) : filteredWinners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-white/40">No winners found.</td>
                </tr>
              ) : (
                filteredWinners.map(w => (
                  <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{w.profiles?.full_name || 'Unknown User'}</div>
                      <div className="text-white/40 text-xs mt-1">{w.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {w.draw_periods?.title}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-brand-400">{w.status?.toUpperCase()}</span>
                        <span className="text-white/80">₹{w.prize_amount?.toLocaleString() || '0'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {w.proof_url ? (
                        <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-accent-400 hover:text-accent-300">
                           View Proof <ExternalLink size={14} className="ml-1" />
                        </a>
                      ) : (
                        <span className="text-white/40 italic text-xs">Not uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {w.status === 'pending' && !w.proof_url && <span className="text-white/40 bg-white/5 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Awaiting Proof</span>}
                      {w.status === 'pending' && w.proof_url && <span className="text-accent-400 bg-accent-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Review Needed</span>}
                      {w.status === 'approved' && <span className="text-brand-400 bg-brand-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Approved</span>}
                      {w.status === 'rejected' && <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Rejected</span>}
                      {w.status === 'paid' && <span className="text-dark-950 bg-brand-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Paid</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       {w.status === 'pending' && w.proof_url && (
                         <>
                           <Button 
                             size="sm" 
                             variant="primary" 
                             className="text-xs py-1.5 px-3"
                             onClick={() => handleUpdateStatus(w.id, 'approved')}
                             isLoading={processingId === w.id}
                           >
                             Approve
                           </Button>
                           <Button 
                             size="sm" 
                             variant="secondary" 
                             className="text-xs py-1.5 px-3 text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                             onClick={() => handleUpdateStatus(w.id, 'rejected')}
                             disabled={processingId === w.id}
                           >
                             Reject
                           </Button>
                         </>
                       )}
                       {w.status === 'approved' && (
                         <Button 
                           size="sm" 
                           variant="accent" 
                           className="text-xs py-1.5 px-3"
                           onClick={() => handleUpdateStatus(w.id, 'paid')}
                           isLoading={processingId === w.id}
                         >
                           Mark Paid
                         </Button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}