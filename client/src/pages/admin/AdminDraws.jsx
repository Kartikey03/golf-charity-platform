import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Trophy, Play, Settings, Plus, X, Trash2, Calendar } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token

const STATUS_COLORS = {
  pending:    'bg-white/10 text-white/50',
  simulation: 'bg-accent-500/20 text-accent-400',
  published:  'bg-brand-500/20 text-brand-400',
  closed:     'bg-white/5 text-white/30',
}

// ── New Draw Modal ─────────────────────────────────────────────────────────────
function NewDrawModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    draw_month: '',       // stored as YYYY-MM (month input native format)
    draw_type: 'random',
    jackpot_override: '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = await getToken()
      const body = {
        title: form.title,
        draw_month: form.draw_month ? form.draw_month + '-01' : '',  // API expects YYYY-MM-DD
        draw_type: form.draw_type,
      }
      if (form.jackpot_override) body.jackpot_override = Math.round(parseFloat(form.jackpot_override) * 100)

      const res = await fetch(`${API_URL}/api/draws`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Draw period created!')
        onCreated()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to create draw')
      }
    } catch { toast.error('Network error') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-brand-400" /> Schedule New Draw
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Draw Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. March 2026 Draw"
            required
          />
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Draw Month</label>
            <input
              type="month"
              className="input-field w-full"
              value={form.draw_month}
              onChange={e => setForm({ ...form, draw_month: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Draw Type</label>
            <select
              className="input-field w-full"
              value={form.draw_type}
              onChange={e => setForm({ ...form, draw_type: e.target.value })}
            >
              <option value="random">🎲 Random — Standard lottery-style draw</option>
              <option value="algorithmic">📊 Algorithmic — Weighted by most-frequent player scores</option>
            </select>
          </div>
          <Input
            label="Custom Jackpot Override (£, optional)"
            type="number"
            min="0"
            step="0.01"
            value={form.jackpot_override}
            onChange={e => setForm({ ...form, jackpot_override: e.target.value })}
            placeholder="Leave blank to auto-calculate from subscriptions"
          />
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/50">
            <strong className="text-white/70">Auto-calculation:</strong> Prize pool is automatically computed from active subscriber count using the configured pool contribution % if no override is provided.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Create Draw Period</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminDraws() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => { fetchDraws() }, [])

  const fetchDraws = async () => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/draws/all`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setDraws(await res.json())
      else toast.error('Failed to load draws')
    } catch { toast.error('Network error') }
    finally { setLoading(false) }
  }

  const handleRunDraw = async (id, simulate) => {
    if (!simulate && !window.confirm('Publish the official draw? This will notify all winners and cannot be undone.')) return

    setRunningId(id)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/draws/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ simulate }),
      })
      if (res.ok) {
        const result = await res.json()
        toast.success(simulate
          ? `Simulation complete! Drawn: [${result.numbers.join(', ')}] · ${result.results.length} winner(s)`
          : `Draw published! ${result.results.length} winner(s) notified.`
        )
        fetchDraws()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to run draw')
      }
    } catch { toast.error('Network error') }
    setRunningId(null)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this draw period?')) return
    setDeletingId(id)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/draws/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        toast.success('Draw deleted')
        setDraws(prev => prev.filter(d => d.id !== id))
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete')
      }
    } catch { toast.error('Network error') }
    setDeletingId(null)
  }

  const fmt = (pence) => `£${((pence || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  return (
    <div className="w-full h-full max-w-7xl mx-auto space-y-8 animate-fade-in">

      {showNew && <NewDrawModal onClose={() => setShowNew(false)} onCreated={fetchDraws} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Trophy className="mr-3 text-accent-400" /> Draw Engine
          </h1>
          <p className="text-white/60">Create, simulate, and publish monthly prize draws.</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus size={18} className="mr-2" /> Schedule New Draw
        </Button>
      </div>

      {/* Draw Type Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-white/50">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className={`px-2 py-1 rounded font-bold uppercase tracking-wider ${cls}`}>{status}</span>
        ))}
        <span className="text-white/30">· Status lifecycle: pending → simulation → published → closed</span>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)
        ) : draws.length === 0 ? (
          <Card>
            <CardBody className="p-12 text-center text-white/40">
              No draw periods yet. Create one to get started.
            </CardBody>
          </Card>
        ) : (
          draws.map(draw => (
            <Card key={draw.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${draw.status === 'published' ? 'bg-brand-500' : draw.status === 'simulation' ? 'bg-accent-500' : draw.status === 'closed' ? 'bg-white/10' : 'bg-white/20'}`} />

              <CardBody className="p-5 pl-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">

                  {/* Draw Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-display font-bold text-white">{draw.title}</h2>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${STATUS_COLORS[draw.status] || STATUS_COLORS.pending}`}>
                        {draw.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/60">
                      <span>📅 {draw.draw_month ? new Date(draw.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}</span>
                      <span>🎲 {draw.draw_type === 'algorithmic' ? 'Algorithmic' : 'Random'}</span>
                      <span>👥 {draw.total_subscribers || 0} subscribers</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-2">
                      <span className="text-brand-400 font-bold">💰 Jackpot: {fmt(draw.jackpot_amount)}</span>
                      <span className="text-white/50">4-match: {fmt(draw.pool_4match)}</span>
                      <span className="text-white/50">3-match: {fmt(draw.pool_3match)}</span>
                    </div>
                  </div>

                  {/* Winning Numbers */}
                  <div className="text-center bg-white/5 border border-white/10 rounded-xl p-4 min-w-[200px]">
                    <span className="text-white/40 block text-xs uppercase tracking-widest mb-2">Winning Numbers</span>
                    {draw.drawn_numbers ? (
                      <div className="flex justify-center gap-2">
                        {draw.drawn_numbers.map((n, i) => (
                          <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${draw.status === 'published' ? 'bg-brand-500 text-dark-950' : 'bg-white/20 text-white'}`}>{n}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-white/20 font-bold text-sm py-2">Not Generated</div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {draw.status === 'pending' && (
                      <>
                        <Button variant="secondary" size="sm" className="w-full text-xs py-2" onClick={() => handleRunDraw(draw.id, true)} isLoading={runningId === draw.id}>
                          <Settings size={14} className="mr-1.5" /> Simulate Draw
                        </Button>
                        <Button size="sm" className="w-full text-xs py-2" onClick={() => handleRunDraw(draw.id, false)} isLoading={runningId === draw.id}>
                          <Play size={14} className="mr-1.5" /> Publish Official
                        </Button>
                        <button
                          onClick={() => handleDelete(draw.id)}
                          disabled={deletingId === draw.id}
                          className="flex items-center justify-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors py-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                    {draw.status === 'simulation' && (
                      <>
                        <Button size="sm" className="w-full text-xs py-2" onClick={() => handleRunDraw(draw.id, false)} isLoading={runningId === draw.id}>
                          <Play size={14} className="mr-1.5" /> Publish Official
                        </Button>
                        <Button variant="secondary" size="sm" className="w-full text-xs py-2" onClick={() => handleRunDraw(draw.id, true)} isLoading={runningId === draw.id}>
                          <Settings size={14} className="mr-1.5" /> Re-simulate
                        </Button>
                        <button onClick={() => handleDelete(draw.id)} disabled={deletingId === draw.id} className="flex items-center justify-center gap-1 text-xs text-white/30 hover:text-red-400 transition-colors py-1">
                          <Trash2 size={12} /> Delete
                        </button>
                      </>
                    )}
                    {draw.status === 'published' && (
                      <div className="text-xs text-brand-400 text-center py-2">
                        ✓ Published<br />
                        <span className="text-white/30">{draw.published_at ? new Date(draw.published_at).toLocaleDateString() : ''}</span>
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
