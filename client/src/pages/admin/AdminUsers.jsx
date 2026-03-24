import { useState, useEffect } from 'react'
import { Card, CardBody } from '../../components/ui/Card'
import { supabase } from '../../lib/supabase'
import { Users, Search, Edit2 } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Fetch profiles
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            charities(name),
            subscriptions(status, plan_type)
          `)
          .order('created_at', { ascending: false })
          .limit(100)
          
        if (error) throw error
        setUsers(data || [])
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.id?.includes(search)
  )

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
            <Users className="mr-3 text-accent-400" /> User Management
          </h1>
          <p className="text-white/60">View profiles, subscription status, and charity preferences.</p>
        </div>
        
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
           <input 
             type="text" 
             placeholder="Search users..." 
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
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Charity Preference</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-white/40 animate-pulse">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-white/40">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const sub = u.subscriptions?.[0]
                  const charityName = u.charities?.name || 'Unassigned'
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{u.full_name || 'Unnamed'}</td>
                      <td className="px-6 py-4">
                        {sub?.status === 'active' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-500/10 text-brand-400">
                            Active ({sub.plan_type})
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/60">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{charityName}</span>
                          <span className="text-xs text-white/40">{u.charity_pct}% contribution</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/60">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-white/40 hover:text-brand-400 transition-colors tooltip-trigger" title="Edit User">
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}