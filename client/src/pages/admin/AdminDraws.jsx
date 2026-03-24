import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Trophy, Play, Settings } from 'lucide-react'

export default function AdminDraws() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState(null)

  useEffect(() => {
    fetchDraws()
  }, [])

  const fetchDraws = async () => {
    try {
      const { data, error } = await supabase
        .from('draw_periods')
        .select('*')
        .order('created_at', { ascending: false })
        
      if (error) throw error
      setDraws(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load draws')
    } finally {
      setLoading(false)
    }
  }

  const handleRunDraw = async (id, simulate) => {
    if (!simulate && !window.confirm('Are you sure you want to OFFICIALY EXTRUD the winning numbers? This action cannot be undone and will notify all winners!')) {
      return
    }

    setRunningId(id)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/draws/${id}/run`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ simulate })
      })
      
      if (res.ok) {
        toast.success(simulate ? 'Simulation complete!' : 'Draw published successfully!')
        fetchDraws()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to run draw')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setRunningId(null)
    }
  }

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Trophy className="mr-3 text-accent-400" /> Draw Management
          </h1>
          <p className="text-white/60">Configure, simulate, and publish monthly draws.</p>
        </div>
        <Button onClick={() => toast('New draw creation modal coming soon.')}>
          Schedule New Draw
        </Button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-8 text-center text-white/40 animate-pulse">Loading draws...</div>
        ) : draws.length === 0 ? (
          <Card>
            <CardBody className="p-12 text-center text-white/40">
              No draw periods exist yet. Create one to get started.
            </CardBody>
          </Card>
        ) : (
          draws.map(draw => (
            <Card key={draw.id} className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-lg ${
                draw.status === 'published' ? 'bg-brand-500 text-dark-950' :
                draw.status === 'simulation' ? 'bg-accent-500 text-dark-950' :
                'bg-white/20 text-white'
              }`}>
                {draw.status.toUpperCase()}
              </div>
              
              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  <div className="flex-1">
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider mb-2">
                      {draw.title}
                    </h2>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-white/40 block text-xs uppercase tracking-widest">Type</span>
                        <span className="text-white font-medium capitalize">{draw.draw_type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs uppercase tracking-widest">Jackpot</span>
                        <span className="text-brand-400 font-bold font-mono">${draw.jackpot_amount?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs uppercase tracking-widest">Players Snapshot</span>
                        <span className="text-white font-medium">{draw.total_subscribers || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-center bg-white/5 border border-white/10 rounded-xl p-4 min-w-[200px]">
                    <span className="text-white/40 block text-xs uppercase tracking-widest mb-2">Winning Numbers</span>
                    {draw.drawn_numbers ? (
                       <div className="flex justify-center gap-2">
                         {draw.drawn_numbers.map((n, i) => (
                           <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${draw.status === 'published' ? 'bg-brand-500 text-dark-950' : 'bg-white/20 text-white'}`}>
                             {n}
                           </div>
                         ))}
                       </div>
                    ) : (
                       <div className="text-white/20 font-bold uppercase tracking-widest text-sm py-1">Not Generated</div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[150px]">
                    {draw.status !== 'published' && (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full text-xs py-2"
                          onClick={() => handleRunDraw(draw.id, true)}
                          isLoading={runningId === draw.id}
                        >
                          <Settings size={14} className="mr-2" /> Simulate Rules
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="w-full text-xs py-2"
                          onClick={() => handleRunDraw(draw.id, false)}
                          isLoading={runningId === draw.id}
                        >
                          <Play size={14} className="mr-2" /> Publish Official
                        </Button>
                      </>
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