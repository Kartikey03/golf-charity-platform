import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Trophy, Play, Settings, Plus, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function AdminDraws() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    draw_month: new Date().toISOString().slice(0, 7) + '-01',
    draw_type: 'random',
  })

  useEffect(() => { fetchDraws() }, [])

  const fetchDraws = async () => {
    try {
      const { data, error } = await supabase
        .from('draw_periods')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setDraws(data || [])
    } catch (err) {
      toast.error('Failed to load draws')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!createForm.title || !createForm.draw_month) {
      return toast.error('Title and draw month are required')
    }
    setCreating(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${API_URL}/api/draws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: createForm.title,
          draw_month: createForm.draw_month,
          draw_type: createForm.draw_type,
        }),
      })

      if (res.ok) {
        toast.success('Draw period created!')
        setShowCreate(false)
        setCreateForm({ title: '', draw_month: new Date().toISOString().slice(0, 7) + '-01', draw_type: 'random' })
        fetchDraws()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to create draw')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setCreating(false)
    }
  }

  const handleRunDraw = async (id, simulate) => {
    if (!simulate && !window.confirm('Officially publish the winning numbers? This cannot be undone.')) return

    setRunningId(id)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${API_URL}/api/draws/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ simulate }),
      })

      if (res.ok) {
        const data = await res.json()
        const winnersText = data.winners?.length
          ? ` ${data.winners.length} winner(s) found.`
          : ' No winners this round — jackpot rolls over!'
        toast.success(simulate ? 'Simulation complete!' : `Draw published!${winnersText}`)
        fetchDraws()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to run draw')
      }
    } catch {
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
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={18} className="mr-2" /> Schedule New Draw
        </Button>
      </div>

      {/* Create Draw Modal */}
      {showCreate && (
        <Card className="border-accent-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Schedule New Draw Period</h2>
              <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="space-y-5">
              <Input
                label="Draw Title"
                placeholder="e.g. April 2026 Draw"
                value={createForm.title}
                onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Draw Month
                </label>
                <input
                  type="month"
                  className="input-field"
                  value={createForm.draw_month.slice(0, 7)}
                  onChange={e => setCreateForm({ ...createForm, draw_month: e.target.value + '-01' })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Draw Type
                </label>
                <select
                  className="input-field bg-dark-900"
                  value={createForm.draw_type}
                  onChange={e => setCreateForm({ ...createForm, draw_type: e.target.value })}
                >
                  <option value="random">Random — 5 completely random numbers (1-45)</option>
                  <option value="algorithmic">Algorithmic — weighted by global score frequency</option>
                </select>
                <p className="text-xs text-white/40 mt-1.5">
                  Algorithmic draws bias toward commonly submitted Stableford scores, adding skill-based weight.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <p className="text-sm text-white/40">
                  Jackpot auto-includes any rolled-over amount from previous draws.
                </p>
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={creating}>
                    Create Draw
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Draw List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-8 text-center text-white/40 animate-pulse">Loading draws...</div>
        ) : draws.length === 0 ? (
          <Card>
            <CardBody className="p-12 text-center text-white/40">
              No draw periods yet. Click <strong>"Schedule New Draw"</strong> to create one.
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
                {draw.jackpot_rolled_over && draw.status === 'published' &&
                  <span className="ml-1 text-yellow-900">· ROLLED</span>
                }
              </div>

              <CardBody className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                  <div className="flex-1">
                    <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider mb-3">
                      {draw.title}
                    </h2>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-white/40 block text-xs uppercase tracking-widest">Type</span>
                        <span className="text-white font-medium capitalize">{draw.draw_type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs uppercase tracking-widest">Jackpot</span>
                        <span className="text-brand-400 font-bold font-mono">
                          £{((draw.jackpot_amount || 0) / 100).toFixed(2)}
                          {draw.jackpot_rolled_over && <span className="text-yellow-400 text-xs ml-1">(rolled)</span>}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs uppercase tracking-widest">4-match Pool</span>
                        <span className="text-white font-medium">£{((draw.pool_4match || 0) / 100).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block text-xs uppercase tracking-widest">Players</span>
                        <span className="text-white font-medium">{draw.total_subscribers || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-center bg-white/5 border border-white/10 rounded-xl p-4 min-w-[200px]">
                    <span className="text-white/40 block text-xs uppercase tracking-widest mb-2">Winning Numbers</span>
                    {draw.drawn_numbers?.length ? (
                      <div className="flex justify-center gap-2">
                        {draw.drawn_numbers.map((n, i) => (
                          <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${draw.status === 'published' ? 'bg-brand-500 text-dark-950' : 'bg-accent-500/30 text-accent-300'}`}>
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
                          className="w-full text-xs py-2"
                          onClick={() => handleRunDraw(draw.id, true)}
                          isLoading={runningId === draw.id}
                        >
                          <Settings size={14} className="mr-2" /> Simulate
                        </Button>
                        <Button
                          variant="primary"
                          className="w-full text-xs py-2"
                          onClick={() => handleRunDraw(draw.id, false)}
                          isLoading={runningId === draw.id}
                        >
                          <Play size={14} className="mr-2" /> Publish Official
                        </Button>
                      </>
                    )}
                    {draw.status === 'published' && (
                      <span className="text-center text-white/30 text-xs px-2">Draw complete</span>
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
