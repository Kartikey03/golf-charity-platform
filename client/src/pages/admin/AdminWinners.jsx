import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Award, CheckCircle2, XCircle, Search, ExternalLink, DollarSign, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token
const fmt = (pence) => `£${((pence || 0) / 100).toFixed(2)}`

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected', 'paid']
const STATUS_STYLES = {
  pending:  'bg-white/10 text-white/50',
  approved: 'bg-brand-500/20 text-brand-400',
  rejected: 'bg-red-500/20 text-red-400',
  paid:     'bg-brand-500 text-dark-950',
}

// ── Action Modal (Approve / Reject) ───────────────────────────────────────────
function ActionModal({ winner, action, onClose, onDone }) {
  const [notes, setNotes] = useState(winner.admin_notes || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/winners/${winner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: action, admin_notes: notes }),
      })
      if (res.ok) {
        toast.success(`Winner ${action}`)
        onDone()
        onClose()
      } else {
        toast.error('Failed to update')
      }
    } catch { toast.error('Network error') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white capitalize">{action} Verification</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <div className="bg-white/5 rounded-xl p-4 mb-4 text-sm space-y-1">
          <div className="text-white font-medium">{winner.profiles?.full_name}</div>
          <div className="text-white/50">{winner.draw_periods?.title} · {winner.draw_entries?.prize_tier || '—'}</div>
          <div className="text-brand-400 font-bold">{fmt(winner.prize_amount)}</div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Admin Notes (optional)</label>
            <textarea
              className="input-field w-full min-h-[80px] resize-none text-sm"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={action === 'rejected' ? 'Reason for rejection...' : 'Internal notes...'}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              isLoading={saving}
              className={action === 'rejected' ? 'bg-red-600 hover:bg-red-500' : ''}
            >
              {action === 'approved' ? '✓ Approve' : action === 'rejected' ? '✗ Reject' : '💳 Mark Paid'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminWinners() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState('all')
  const [modal, setModal] = useState(null) // { winner, action }

  const fetchWinners = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/winners?status=${statusTab}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setWinners(await res.json())
      else toast.error('Failed to load winners')
    } catch { toast.error('Network error') }
    setLoading(false)
  }, [statusTab])

  useEffect(() => { fetchWinners() }, [fetchWinners])

  const filtered = winners.filter(w =>
    w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
    w.draw_periods?.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full h-full max-w-7xl mx-auto space-y-8 animate-fade-in">

      {modal && (
        <ActionModal
          winner={modal.winner}
          action={modal.action}
          onClose={() => setModal(null)}
          onDone={fetchWinners}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Award className="mr-3 text-brand-400" /> Winner Verification
          </h1>
          <p className="text-white/60">Review scorecards, verify winners, and mark payouts.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Search winners..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => setStatusTab(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${statusTab === s ? 'bg-brand-500 text-dark-950' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Winner</th>
                <th className="px-6 py-4">Draw</th>
                <th className="px-6 py-4">Tier / Prize</th>
                <th className="px-6 py-4">Proof & Notes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-white/5 rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-white/40">No winners found.</td>
                </tr>
              ) : filtered.map(w => (
                <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{w.profiles?.full_name || 'Unknown'}</div>
                    <div className="text-white/40 text-xs mt-0.5">{w.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    <div>{w.draw_periods?.title}</div>
                    <div className="text-white/40 text-xs">{w.draw_periods?.draw_month ? new Date(w.draw_periods.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-brand-400">{w.draw_entries?.prize_tier || '—'}</div>
                    <div className="text-white font-bold">{fmt(w.prize_amount)}</div>
                    {w.draw_entries?.scores_snapshot && (
                      <div className="flex gap-0.5 mt-1">
                        {w.draw_entries.scores_snapshot.map((s, i) => (
                          <span key={i} className="text-xs bg-white/10 px-1 rounded font-mono">{s}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {w.proof_url ? (
                      <a href={w.proof_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-accent-400 hover:text-accent-300 text-xs">
                        View Proof <ExternalLink size={12} className="ml-1" />
                      </a>
                    ) : (
                      <span className="text-white/30 italic text-xs">No proof uploaded</span>
                    )}
                    {w.admin_notes && (
                      <div className="mt-1 text-xs text-white/40 italic max-w-[180px] truncate" title={w.admin_notes}>📝 {w.admin_notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${STATUS_STYLES[w.status] || STATUS_STYLES.pending}`}>
                      {w.status === 'pending' && !w.proof_url ? 'Awaiting Proof' : w.status}
                    </span>
                    {w.paid_at && <div className="text-xs text-white/30 mt-1">{new Date(w.paid_at).toLocaleDateString()}</div>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {w.status === 'pending' && w.proof_url && (
                        <>
                          <Button size="sm" className="text-xs py-1.5 px-3" onClick={() => setModal({ winner: w, action: 'approved' })}>
                            <CheckCircle2 size={13} className="mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="secondary" className="text-xs py-1.5 px-3 text-rose-400 border-rose-500/30 hover:bg-rose-500/10" onClick={() => setModal({ winner: w, action: 'rejected' })}>
                            <XCircle size={13} className="mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {w.status === 'approved' && (
                        <Button size="sm" className="text-xs py-1.5 px-3" onClick={() => setModal({ winner: w, action: 'paid' })}>
                          <DollarSign size={13} className="mr-1" /> Mark Paid
                        </Button>
                      )}
                      {(w.status === 'rejected' || w.status === 'paid') && (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-6 py-3 text-xs text-white/30 border-t border-white/5">
            {filtered.length} record(s) shown
          </div>
        )}
      </Card>
    </div>
  )
}