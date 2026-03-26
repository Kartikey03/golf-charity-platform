import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Heart } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function CharityDetailPage() {
  const { slug } = useParams()
  const [charity, setCharity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCharity() {
      try {
        const res = await fetch(`${API_URL}/api/charities/${encodeURIComponent(slug)}`)
        if (res.ok) {
          setCharity(await res.json())
        } else {
          setCharity(null)
        }
      } catch {
        setCharity(null)
      } finally {
        setLoading(false)
      }
    }
    fetchCharity()
  }, [slug])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>
  }

  if (!charity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold text-white mb-2">Charity Not Found</h1>
        <p className="text-white/60 mb-6">The charity you are looking for does not exist.</p>
        <Link to="/charities" className="btn-secondary px-6 py-2">Back to Directory</Link>
      </div>
    )
  }

  return (
    <div className="w-full pt-8 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/charities" className="inline-flex items-center text-white/40 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Directory
        </Link>
        
        <div className="relative rounded-3xl overflow-hidden bg-dark-900 border border-white/10">
          
          {/* Header Image Area */}
          <div className="h-64 md:h-80 w-full bg-dark-800 relative">
            {charity.logo_url ? (
              <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center"><Heart className="text-white/10 w-32 h-32" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent"></div>
          </div>

          <div className="px-6 md:px-12 py-8 relative -mt-24 z-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 drop-shadow-md">
              {charity.name}
            </h1>
            
            {charity.website_url && (
              <a href={charity.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-brand-400 hover:text-brand-300 font-medium mb-8">
                Official Website <ExternalLink size={14} className="ml-1.5" />
              </a>
            )}

            <div className="prose prose-invert max-w-none text-white/80 leading-relaxed text-lg">
              {charity.description?.split('\\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-white/60 text-sm w-full sm:w-auto text-center sm:text-left">
                Select this charity when you subscribe. <br className="hidden md:block"/>
                A minimum of 10% of your fee goes directly to them.
              </div>
              <Link to={`/register?charity=${charity.id}`} className="btn-primary w-full sm:w-auto px-8 py-3 text-center inline-block">
                Support {charity.name}
              </Link>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  )
}