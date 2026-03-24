import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Heart, Plus, Edit2, Trash2 } from 'lucide-react'

export default function AdminCharities() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website_url: '',
    logo_url: ''
  })

  useEffect(() => {
    fetchCharities()
  }, [])

  const fetchCharities = async () => {
    try {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .order('name', { ascending: true })
        
      if (error) throw error
      setCharities(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load charities')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/charities`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        toast.success('Charity added successfully')
        setFormData({ name: '', description: '', website_url: '', logo_url: '' })
        setShowAdd(false)
        fetchCharities()
      } else {
        toast.error('Failed to add charity')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to disable this charity? It will be marked as inactive rather than deleted to preserve history.')) return

    try {
      const { error } = await supabase
        .from('charities')
        .update({ status: 'inactive' })
        .eq('id', id)

      if (error) throw error
      toast.success('Charity disabled')
      fetchCharities()
    } catch (err) {
      toast.error('Failed to disable charity')
    }
  }

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Heart className="mr-3 text-purple-400" /> Charity Directory
          </h1>
          <p className="text-white/60">Manage partner charities and their profiles.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus size={18} className="mr-2" /> Add Charity
        </Button>
      </div>

      {showAdd && (
        <Card className="border-brand-500/30">
          <CardHeader>
            <h2 className="text-xl font-bold text-white">Add New Charity</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Organization Name" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required 
                />
                <Input 
                  label="Website URL" 
                  type="url"
                  value={formData.website_url}
                  onChange={e => setFormData({...formData, website_url: e.target.value})}
                />
                <div className="md:col-span-2">
                  <Input 
                    label="Logo URL (Optional for now)" 
                    type="url"
                    value={formData.logo_url}
                    onChange={e => setFormData({...formData, logo_url: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Description</label>
                  <textarea 
                    className="w-full input-field min-h-[100px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" isLoading={submitting}>Save Charity</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Charity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-white/40 animate-pulse">Loading charities...</td>
                </tr>
              ) : charities.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-white/40">No charities found.</td>
                </tr>
              ) : (
                charities.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-white">
                       <div className="font-bold">{c.name}</div>
                       <div className="text-white/40 text-xs mt-1 truncate max-w-sm">{c.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      {c.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/60">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button className="text-white/40 hover:text-brand-400 transition-colors tooltip-trigger" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className={`transition-colors tooltip-trigger ${c.status === 'active' ? 'text-white/40 hover:text-rose-400' : 'text-white/10 cursor-not-allowed'}`}
                        title="Disable"
                        disabled={c.status !== 'active'}
                      >
                        <Trash2 size={16} />
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