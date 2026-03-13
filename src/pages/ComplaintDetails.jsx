import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, User, Building, MessageSquare, CheckCircle, AlertCircle, Loader2, ThumbsUp, Lightbulb, ShieldCheck } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function ComplaintDetails() {
  const { id } = useParams()
  const { API_URL, user, socket } = useAuth()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [comment, setComment] = useState('')
  const [voting, setVoting] = useState(false)
  const [voteError, setVoteError] = useState(null)

  const fetchDetails = async () => {
    try {
      setError(null)
      const res = await axios.get(`${API_URL}/complaints/${id}`)
      setComplaint(res.data)
    } catch (err) {
      console.error('Fetch detail error:', err)
      setError('Could not load complaint details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [id, API_URL])

  useEffect(() => {
    if (socket) {
      const handleUpdate = (update) => {
        if (update.id === id) fetchDetails()
      }
      socket.on('complaintUpdated', handleUpdate)
      return () => socket.off('complaintUpdated', handleUpdate)
    }
  }, [socket, id])

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true)
    try {
      await axios.put(`${API_URL}/complaints/${id}/status`, { status: newStatus, comment })
      setComment('')
      fetchDetails()
    } catch (err) {
      console.error('Update status error:', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleVote = async () => {
    if (voting) return
    setVoting(true)
    setVoteError(null)
    try {
      const res = await axios.post(`${API_URL}/complaints/${id}/vote`, {})
      setComplaint(prev => ({ ...prev, votes: res.data.votes }))
    } catch (err) {
      console.error('Voting error:', err)
      setVoteError(err.response?.data?.message || 'Could not record vote. You may have already voted.')
    } finally {
      setVoting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  )

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <AlertCircle size={48} className="text-rose-400 mx-auto mb-4" />
      <p className="text-slate-600 font-semibold">{error}</p>
      <button onClick={fetchDetails} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold">Retry</button>
    </div>
  )

  if (!complaint) return (
    <div className="p-10 text-center text-slate-500 font-semibold">Complaint not found</div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="premium-card p-8 bg-white">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-black text-primary p-2 bg-blue-50 rounded-lg tracking-tighter">CASE #{complaint.id}</span>
              <StatusBadge status={complaint.status} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">{complaint.title}</h1>
            <p className="text-slate-600 text-sm leading-relaxed mb-8">{complaint.description}</p>

            {/* AI Summary */}
            {complaint.summary && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">AI Summary</p>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{complaint.summary}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pb-8 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Location</p>
                  <p className="text-xs font-bold text-slate-700">{complaint.location || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Clock size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Reported On</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(complaint.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Voting section */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVote}
                  disabled={voting}
                  className="group flex items-center gap-2 px-6 py-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                >
                  <ThumbsUp size={16} className={`transition-transform duration-300 ${voting ? 'animate-bounce' : 'group-hover:scale-110'}`} />
                  <span className="text-xs font-black uppercase tracking-widest">Support This</span>
                </button>
                <div className="flex flex-col items-center justify-center min-w-[50px] p-2 bg-slate-50 text-slate-700 rounded-lg font-black text-lg shadow-inner">
                  {complaint.votes || 0}
                </div>
              </div>
              {voteError && (
                <p className="text-xs text-rose-500 font-semibold bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">{voteError}</p>
              )}
            </div>

            {/* AI Recommendations */}
            {(complaint.citizen_recommendation || complaint.authority_recommendation) && (
              <div className="pt-8 space-y-4">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">AI Recommendations</h3>
                {complaint.citizen_recommendation && (
                  <div className="flex gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <Lightbulb size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">For Citizens</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{complaint.citizen_recommendation}</p>
                    </div>
                  </div>
                )}
                {complaint.authority_recommendation && (
                  <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <ShieldCheck size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">For Authorities</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{complaint.authority_recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timeline */}
            <div className="pt-8">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4">Timeline & Updates</h3>
              <div className="space-y-6">
                {(complaint.ComplaintUpdates || []).length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium">No updates yet. Complaint is under review.</p>
                ) : (
                  complaint.ComplaintUpdates.map((u, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-blue-50" />
                        <div className="w-0.5 flex-1 bg-slate-100 mt-2" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-black text-slate-700">{u.status}</span>
                          <span className="text-[10px] text-slate-400 font-medium">— {new Date(u.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {u.comment || 'Status updated by department.'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="premium-card p-6 bg-slate-900 text-white">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-400">Department Node</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building size={18} className="text-primary-light" />
                <p className="text-sm font-bold">{complaint.Department?.name || complaint.department || 'Unassigned'}</p>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-amber-400" />
                <p className="text-sm font-bold uppercase tracking-tighter">Priority: {complaint.priority || 'Normal'}</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-blue-400" />
                <p className="text-sm font-medium text-slate-300">
                  ETA: {complaint.estimated_resolution_time || 'TBD'}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {user?.role === 'Department Admin' && (
            <div className="premium-card p-6 bg-white border-2 border-primary/10">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 text-slate-800">Admin Actions</h3>
              <textarea
                placeholder="Add internal comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full premium-input h-24 mb-4 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusUpdate('In Progress')}
                  disabled={updating}
                  className="premium-button bg-amber-500 text-white text-[10px] h-10"
                >In Progress</button>
                <button
                  onClick={() => handleStatusUpdate('Resolved')}
                  disabled={updating}
                  className="premium-button bg-emerald-500 text-white text-[10px] h-10"
                >Resolved</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
