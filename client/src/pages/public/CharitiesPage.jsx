import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Card, CardBody } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Search, Heart } from 'lucide-react'

export default function CharitiesPage() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchCharities() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/charities`)
        if (res.ok) {
          const data = await res.json()
          const sorted = data.sort((a, b) => a.name.localeCompare(b.name))
          setCharities(sorted)
        }
      } catch (err) {
        console.error('Failed to fetch charities:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCharities()
  }, [])

  const filteredCharities = charities.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Our Supported Causes
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            These are the verified organizations turning every stroke into positive social impact. 
            Choose one to support with your monthly subscription.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
            <Input 
              type="text" 
              placeholder="Search charities by name or cause..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 py-4 text-lg rounded-2xl bg-white/5 border-white/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {filteredCharities.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                No charities found matching "{search}"
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCharities.map((charity) => (
                  <Link key={charity.id} to={`/charities/${charity.slug || charity.id}`}>
                    <Card className="h-full hover:-translate-y-1 transition-transform duration-200 group border-white/5 hover:border-brand-500/30">
                      <CardBody className="p-6 flex flex-col h-full">
                        <div className="w-full h-32 rounded-xl bg-dark-800 mb-6 flex items-center justify-center overflow-hidden">
                          {charity.logo_url ? (
                            <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <Heart className="text-white/20" size={40} />
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{charity.name}</h3>
                        <p className="text-white/60 text-sm flex-grow line-clamp-3 mb-4">
                          {charity.description}
                        </p>
                        <div className="mt-auto flex items-center text-brand-400 font-medium text-sm group-hover:text-brand-300">
                          View details <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}