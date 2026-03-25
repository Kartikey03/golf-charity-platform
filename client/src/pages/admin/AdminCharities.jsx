import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Heart, Plus, Edit2, X, Star, StarOff } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const emptyForm = { name: '', description: '', website_url: '', logo_url: '', is_featured: false }

// ── Form — defined OUTSIDE component to prevent remount on every render ────────
// This is critical: if FormFields were inside AdminCharities, React would
// unmount/remount it on every state change, causing inputs to lose focus.
function CharityForm({ formData, setFormData, onSubmit, onCancel, submitLabel, submitting }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Organization Name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1.5">Website URL (optional)</label>
          <input
            type="url"
            className="input-field w-full"
            value={formData.website_url}
            onChange={e => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
            placeholder="https://..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white/80 mb-1.5">Logo URL (optional)</label>
          <input
            type="url"
            className="input-field w-full"
            value={formData.logo_url}
            onChange={e => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
            placeholder="https://..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-white/80 mb-1.5">Description</label>
          <textarea
            className="input-field w-full min-h-[100px]"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_featured_chk"
            checked={formData.is_featured}
            onChange={e => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
            className="w-4 h-4 accent-brand-500"
          />
          <label htmlFor="is_featured_chk" className="text-sm text-white/80 cursor-pointer">
            Feature on homepage (spotlight charity)
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminCharities() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [editingCharity, setEditingCharity] = useState(null)
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => { fetchCharities() }, [])

  const getToken = async () =>
    (await supabase.auth.getSession()).data.session?.access_token

  // Use backend API (not direct Supabase) to bypass RLS
  const fetchCharities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/charities`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setCharities(data || [])
    } catch {
      toast.error('Failed to load charities')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/charities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success('Charity added')
        setFormData(emptyForm)
        setShowAdd(false)
        fetchCharities()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to add charity')
      }
    } catch { toast.error('Network error') }
    finally { setSubmitting(false) }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/charities/${editingCharity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, is_active: editingCharity.is_active }),
      })
      if (res.ok) {
        toast.success('Charity updated')
        setEditingCharity(null)
        fetchCharities()
      } else {
        toast.error('Failed to update charity')
      }
    } catch { toast.error('Network error') }
    finally { setSubmitting(false) }
  }

  const handleToggleActive = async (charity) => {
    const action = charity.is_active ? 'disable' : 'enable'
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${charity.name}"?`)) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/charities/${charity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !charity.is_active }),
      })
      if (res.ok) { toast.success(`Charity ${action}d`); fetchCharities() }
      else toast.error(`Failed to ${action} charity`)
    } catch { toast.error('Network error') }
  }

  const handleToggleFeatured = async (charity) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/charities/${charity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_featured: !charity.is_featured }),
      })
      if (res.ok) { toast.success(charity.is_featured ? 'Removed from featured' : 'Marked as featured'); fetchCharities() }
    } catch { toast.error('Network error') }
  }

  const openEdit = (charity) => {
    setEditingCharity(charity)
    setFormData({
      name: charity.name,
      description: charity.description || '',
      website_url: charity.website_url || '',
      logo_url: charity.logo_url || '',
      is_featured: charity.is_featured || false,
    })
    setShowAdd(false)
  }

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Heart className="mr-3 text-purple-400" /> Charity Directory
          </h1>
          <p className="text-white/60">Manage partner charities, content, and featured spotlights.</p>
        </div>
        <Button onClick={() => { setShowAdd(!showAdd); setEditingCharity(null); setFormData(emptyForm) }}>
          <Plus size={18} className="mr-2" /> Add Charity
        </Button>
      </div>

      {showAdd && (
        <Card className="border-brand-500/30">
          <CardHeader><h2 className="text-xl font-bold text-white">Add New Charity</h2></CardHeader>
          <CardBody>
            <CharityForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAdd}
              onCancel={() => setShowAdd(false)}
              submitLabel="Save Charity"
              submitting={submitting}
            />
          </CardBody>
        </Card>
      )}

      {editingCharity && (
        <Card className="border-accent-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit: {editingCharity.name}</h2>
              <button onClick={() => setEditingCharity(null)} className="text-white/40 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </CardHeader>
          <CardBody>
            <CharityForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleEdit}
              onCancel={() => setEditingCharity(null)}
              submitLabel="Save Changes"
              submitting={submitting}
            />
          </CardBody>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Charity</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-white/40 animate-pulse">Loading charities...</td></tr>
              ) : charities.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-white/40">No charities found.</td></tr>
              ) : (
                charities.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white">
                      <div className="flex items-center gap-3">
                        {c.logo_url
                          ? <img src={c.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
                          : <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center"><Heart size={14} className="text-brand-400" /></div>
                        }
                        <div>
                          <div className="font-bold">{c.name}</div>
                          <div className="text-white/40 text-xs mt-0.5 truncate max-w-xs">{c.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(c)}
                        className={`transition-colors ${c.is_featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-white/20 hover:text-yellow-400'}`}
                        title={c.is_featured ? 'Remove from featured' : 'Set as featured'}
                      >
                        {c.is_featured ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                          c.is_active
                            ? 'bg-brand-500/10 text-brand-400 hover:bg-red-500/10 hover:text-red-400'
                            : 'bg-white/10 text-white/40 hover:bg-brand-500/10 hover:text-brand-400'
                        }`}
                      >
                        {c.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(c)} className="text-white/40 hover:text-brand-400 transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
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
