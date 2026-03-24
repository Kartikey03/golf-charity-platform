import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'
import { Trophy, Calendar, Gift, DollarSign } from 'lucide-react'

export default function DrawsPage() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDraws() {
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/draws`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          setDraws(await res.json())
        }
      } catch (err) {
        console.error('Error fetching draws:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDraws()
  }, [])

  if (loading) {
    return <div className="p-8 animate-pulse text-white/60">Loading draws...</div>
  }

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <Gift className="mr-3 text-brand-400" /> Monthly Draws
        </h1>
        <p className="text-white/60">View upcoming prize pools and past winning numbers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {draws.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-dashed border-2 border-white/10 bg-transparent">
              <CardBody className="p-12 text-center text-white/40">
                <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">No active draws yet</h3>
                <p>The first monthly draw will be scheduled soon.</p>
              </CardBody>
            </Card>
          </div>
        ) : (
          draws.map(draw => (
            <Card key={draw.id} className="flex flex-col relative overflow-hidden group">
              {/* Highlight active/upcoming */}
              {!draw.drawn_numbers && (
                <div className="absolute top-0 right-0 bg-brand-500 text-dark-950 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Upcoming
                </div>
              )}
              
              <CardHeader className="border-b border-white/5 pb-4">
                 <div className="flex items-center text-white/60 text-sm mb-2">
                   <Calendar size={14} className="mr-1.5" /> {new Date(draw.draw_month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                 </div>
                 <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider">{draw.title}</h2>
              </CardHeader>
              
              <CardBody className="flex-grow flex flex-col justify-between pt-6 space-y-6">
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-brand-400 font-bold uppercase tracking-widest mb-1">Estimated Jackpot</div>
                    <div className="text-4xl font-black text-white flex items-center">
                      <DollarSign size={28} className="text-white/40" />
                      {draw.jackpot_amount?.toLocaleString() || 'TBD'}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                    <div className="text-sm text-white/60">Total Players</div>
                    <div className="font-bold text-white">{draw.total_subscribers || 0}</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="text-xs text-white/40 font-bold uppercase tracking-widest mb-3">Winning Numbers</div>
                  {draw.drawn_numbers && draw.drawn_numbers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {draw.drawn_numbers.map((num, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-brand-500 text-dark-950 font-bold flex items-center justify-center shadow-[0_0_15px_rgba(205,255,100,0.3)]">
                          {num}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 opacity-30">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border border-dashed border-white flex items-center justify-center text-white font-bold">
                          ?
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </CardBody>
            </Card>
          ))
        )}
      </div>

    </div>
  )
}