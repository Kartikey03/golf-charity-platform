import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { PlusCircle, Target, Calendar, Trash2 } from 'lucide-react'

export default function ScoresPage() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    score: '',
    played_on: new Date().toISOString().split('T')[0],
    course_name: '',
    notes: ''
  })

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scores`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setScores(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const parsedScore = parseInt(formData.score)
    if (parsedScore < 1 || parsedScore > 45) {
      return toast.error('Stableford scores must be between 1 and 45')
    }

    setSubmitting(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          score: parsedScore,
          played_on: formData.played_on,
          course_name: formData.course_name,
          notes: formData.notes
        })
      })
      
      if (res.ok) {
        toast.success('Score logged successfully!')
        setFormData({
          score: '',
          played_on: new Date().toISOString().split('T')[0],
          course_name: '',
          notes: ''
        })
        fetchScores()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Failed to log score. Remember you need an active subscription.')
      }
    } catch (err) {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this score?')) return
    
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/scores/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        toast.success('Score deleted')
        fetchScores()
      } else {
        toast.error('Failed to delete score')
      }
    } catch (err) {
      toast.error('Network error')
    }
  }

  return (
    <div className="w-full h-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 flex items-center">
          <Target className="mr-3 text-brand-400" /> My Scores
        </h1>
        <p className="text-white/60">Log your latest Stableford rounds. We securely hold your 5 most recent scores for the monthly draws.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader className="flex flex-row flex-nowrap items-center">
               <PlusCircle className="text-brand-400 mr-2" size={20} />
               <h2 className="text-xl font-bold text-white">Log a Round</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input 
                  label="Stableford Score (1-45)" 
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={formData.score}
                  onChange={e => setFormData({...formData, score: e.target.value})}
                />
                
                <Input 
                  label="Date Played" 
                  type="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.played_on}
                  onChange={e => setFormData({...formData, played_on: e.target.value})}
                />

                <Input 
                  label="Course Name (Optional)" 
                  type="text"
                  placeholder="e.g. St Andrews"
                  value={formData.course_name}
                  onChange={e => setFormData({...formData, course_name: e.target.value})}
                />

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Notes (Optional)</label>
                  <textarea 
                    className="w-full input-field min-h-[80px]"
                    placeholder="Weather, highlights..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>

                <Button type="submit" isLoading={submitting} className="w-full py-3">
                  Submit Score
                </Button>
                
                <p className="text-xs text-white/40 text-center mt-2">
                  Scores are verified upon winning. Please retain scorecards for significant rounds.
                </p>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
           <Card className="h-full">
            <CardHeader className="flex flex-row flex-nowrap items-center justify-between">
               <div className="flex items-center">
                 <Calendar className="text-accent-400 mr-2" size={20} />
                 <h2 className="text-xl font-bold text-white">Recent Rounds</h2>
               </div>
               <span className="text-sm text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full">
                 {scores.length} / 5 Eligible
               </span>
            </CardHeader>
            <div className="divide-y divide-white/10">
              {loading ? (
                <div className="p-8 text-center text-white/40 animate-pulse">Loading scores...</div>
              ) : scores.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-white/20">
                    <Target size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No scores logged</h3>
                  <p className="text-white/40 max-w-sm mx-auto">
                    You haven't submitted any scores yet. Log your first round to enter the next draw.
                  </p>
                </div>
              ) : (
                scores.map((score, index) => (
                  <div key={score.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center group hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                    {/* Eligibility Badge */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                    
                    <div className="flex-grow pl-4">
                      <div className="flex items-baseline space-x-3 mb-1">
                        <span className="text-3xl font-display font-bold text-white">{score.score}</span>
                        <span className="text-sm font-medium text-brand-400 uppercase tracking-wider">Pts</span>
                      </div>
                      <div className="text-white/60 flex items-center flex-wrap gap-x-4 gap-y-1 text-sm">
                        <span className="flex items-center"><Calendar size={14} className="mr-1 opacity-60"/> {new Date(score.played_on).toLocaleDateString()}</span>
                        {score.course_name && <span>📍 {score.course_name}</span>}
                      </div>
                      {score.notes && <p className="text-white/40 text-sm mt-2 italic">"{score.notes}"</p>}
                    </div>
                    
                    <div className="mt-4 sm:mt-0 ml-4 flex items-center">
                      <button 
                        onClick={() => handleDelete(score.id)}
                        className="text-white/20 hover:text-red-400 transition-colors p-2"
                        title="Delete score"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

      </div>

    </div>
  )
}