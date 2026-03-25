import { useState, useEffect, useCallback } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Users, Search, Edit2, X, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const getToken = async () => (await supabase.auth.getSession()).data.session?.access_token

// ── Edit User Modal ────────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    role: user.role || 'subscriber',
    handicap: user.handicap ?? '',
    phone: user.phone || '',
    country: user.country || 'AU',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, handicap: form.handicap === '' ? null : Number(form.handicap) }),
      })
      if (res.ok) {
        toast.success('User updated')
        onSaved()
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to update')
      }
    } catch { toast.error('Network error') }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Edit User</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">Role</label>
            <select
              className="input-field w-full"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="subscriber">Subscriber</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Handicap (optional)" type="number" min="0" max="54" value={form.handicap} onChange={e => setForm({ ...form, handicap: e.target.value })} placeholder="e.g. 18" />
            <Input label="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="AU" />
          </div>
          <Input label="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+44 ..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── User Row (expandable) ──────────────────────────────────────────────────────
function UserRow({ user, onEdit, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const [scores, setScores] = useState(null)
  const [loadingScores, setLoadingScores] = useState(false)
  const [addScore, setAddScore] = useState(false)
  const [scoreForm, setScoreForm] = useState({ score: '', played_on: '', course_name: '' })
  const [savingScore, setSavingScore] = useState(false)

  const sub = user.subscriptions?.[0]
  const charity = user.charity_contributions?.[0]
  const charityName = charity?.charities?.name || '—'

  const loadScores = useCallback(async () => {
    if (scores !== null) return
    setLoadingScores(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/scores`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setScores(await res.json())
    } catch { toast.error('Failed to load scores') }
    setLoadingScores(false)
  }, [user.id, scores])

  const handleExpand = () => {
    setExpanded(prev => !prev)
    if (!expanded) loadScores()
  }

  const handleDeleteScore = async (scoreId) => {
    if (!window.confirm('Delete this score?')) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/scores/${scoreId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        setScores(prev => prev.filter(s => s.id !== scoreId))
        toast.success('Score deleted')
      }
    } catch { toast.error('Failed to delete score') }
  }

  const handleAddScore = async (e) => {
    e.preventDefault()
    setSavingScore(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/users/${user.id}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...scoreForm, score: Number(scoreForm.score) }),
      })
      if (res.ok) {
        const newScore = await res.json()
        setScores(prev => [newScore, ...(prev || [])])
        setScoreForm({ score: '', played_on: '', course_name: '' })
        setAddScore(false)
        toast.success('Score added')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to add score')
      }
    } catch { toast.error('Network error') }
    setSavingScore(false)
  }

  return (
    <>
      <tr className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={handleExpand}>
        <td className="px-6 py-4">
          <div className="font-medium text-white">{user.full_name || 'Unnamed'}</div>
          <div className="text-white/40 text-xs mt-0.5">{user.email}</div>
        </td>
        <td className="px-6 py-4">
          {user.role === 'admin' ? (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-accent-500/10 text-accent-400">Admin</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/10 text-white/60">Subscriber</span>
          )}
        </td>
        <td className="px-6 py-4">
          {sub?.status === 'active' ? (
            <div>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-400">Active · {sub.plan}</span>
              {sub.cancel_at_period_end && <div className="text-xs text-rose-400 mt-0.5">Cancels {new Date(sub.current_period_end).toLocaleDateString()}</div>}
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/40">
              {sub?.status || 'No sub'}
            </span>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="text-sm">{charityName}</div>
          {charity && <div className="text-xs text-white/40">{charity.percentage}% contribution</div>}
        </td>
        <td className="px-6 py-4 text-white/60 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
        <td className="px-6 py-4 text-right flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
          <button className="text-white/40 hover:text-brand-400 transition-colors" title="Edit" onClick={() => onEdit(user)}>
            <Edit2 size={16} />
          </button>
          <button className="text-white/40 hover:text-white/60 transition-colors" onClick={handleExpand}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-white/[0.015]">
          <td colSpan="6" className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider">Golf Scores ({(scores || []).length})</h4>
                <button
                  onClick={() => setAddScore(prev => !prev)}
                  className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <Plus size={14} /> Add Score
                </button>
              </div>

              {addScore && (
                <form onSubmit={handleAddScore} className="flex flex-wrap gap-3 items-end bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="flex-1 min-w-[80px]">
                    <label className="text-xs text-white/60 block mb-1">Score (1-45)</label>
                    <input type="number" min="1" max="45" required value={scoreForm.score} onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })}
                      className="input-field py-1.5 text-sm w-full" placeholder="e.g. 32" />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-xs text-white/60 block mb-1">Played On</label>
                    <input type="date" required value={scoreForm.played_on} onChange={e => setScoreForm({ ...scoreForm, played_on: e.target.value })}
                      className="input-field py-1.5 text-sm w-full" />
                  </div>
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-xs text-white/60 block mb-1">Course (optional)</label>
                    <input type="text" value={scoreForm.course_name} onChange={e => setScoreForm({ ...scoreForm, course_name: e.target.value })}
                      className="input-field py-1.5 text-sm w-full" placeholder="Course name" />
                  </div>
                  <Button type="submit" size="sm" isLoading={savingScore} className="py-1.5 text-xs">Save</Button>
                  <Button type="button" size="sm" variant="secondary" className="py-1.5 text-xs" onClick={() => setAddScore(false)}>Cancel</Button>
                </form>
              )}

              {loadingScores ? (
                <div className="text-white/40 text-sm animate-pulse">Loading scores...</div>
              ) : scores?.length === 0 ? (
                <div className="text-white/40 text-sm italic">No scores recorded.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(scores || []).map(s => (
                    <div key={s.id} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm group">
                      <span className="font-bold text-brand-400 text-base">{s.score}</span>
                      <div className="text-white/50 text-xs">
                        <div>{new Date(s.played_on).toLocaleDateString()}</div>
                        {s.course_name && <div className="truncate max-w-[100px]">{s.course_name}</div>}
                      </div>
                      <button
                        onClick={() => handleDeleteScore(s.id)}
                        className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete score"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/users?search=${encodeURIComponent(search)}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const result = await res.json()
        setUsers(result.users || result)
      } else {
        toast.error('Failed to load users')
      }
    } catch { toast.error('Network error') }
    setLoading(false)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  return (
    <div className="w-full h-full max-w-7xl mx-auto space-y-8 animate-fade-in">

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={fetchUsers}
        />
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Users className="mr-3 text-accent-400" /> User Management
          </h1>
          <p className="text-white/60">View, edit profiles, manage subscriptions and golf scores.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Charity</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-white/5 rounded" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-white/40">No users found.</td>
                </tr>
              ) : (
                users.map(u => (
                  <UserRow key={u.id} user={u} onEdit={setEditingUser} onRefresh={fetchUsers} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && <div className="px-6 py-3 text-xs text-white/30 border-t border-white/5">{users.length} users shown</div>}
      </Card>

    </div>
  )
}