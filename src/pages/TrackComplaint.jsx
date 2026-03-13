import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, AlertCircle, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { TableRowSkeleton } from '../components/LoaderSkeleton'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const ALL_STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Escalated']

export default function TrackComplaint() {
  const { API_URL } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allComplaints, setAllComplaints] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/complaints`);
      setAllComplaints(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load complaints. Check your server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [API_URL]);

  const filtered = allComplaints.filter(c => {
    if (!c) return false;
    const matchSearch = (c.title || '').toLowerCase().includes(search.toLowerCase()) || 
                       (c.id || '').toLowerCase().includes(search.toLowerCase()) || 
                       (c.location && c.location.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = status === 'All' || c.status === status
    return matchSearch && matchStatus
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 py-8 lg:px-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Track Complaints</h1>
          <p className="text-gray-500 text-sm mt-1">Search, filter, and monitor all submitted complaints.</p>
        </div>
        <button 
          onClick={fetchComplaints}
          disabled={loading}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-all shadow-sm"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, ID, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-primary rounded-xl text-sm outline-none transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400 shrink-0" />
            <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium outline-none border-2 border-transparent focus:border-primary cursor-pointer transition-all">
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <table className="w-full">
            <tbody className="divide-y divide-gray-50">
               <TableRowSkeleton rows={5} />
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-rose-50 rounded-2xl border border-rose-100">
          <AlertCircle size={40} className="text-rose-400 mb-3" />
          <p className="text-rose-600 font-bold mb-4">{error}</p>
          <button onClick={fetchComplaints} className="premium-button bg-primary text-white px-6">Retry Loading</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100">
          <AlertCircle size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No complaints found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-sm text-gray-500 font-medium">{filtered.length} complaint{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Complaint Information</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filtered.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <Link to={`/complaint/${c.id}`} className="text-[12px] font-black text-primary hover:text-primary-light no-underline tracking-tighter">
                        #{c.id}
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{c.title || 'Untitled'}</p>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block mt-1">{c.category || 'Other'}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] text-slate-500 font-black tracking-tighter uppercase whitespace-nowrap">
                        {c.Department?.name || c.department || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-5"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-5 text-[11px] text-slate-400 font-medium">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all inline" />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  )
}
