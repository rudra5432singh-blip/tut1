import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import StatusBadge from './StatusBadge'

export default function ComplaintCard({ complaint, index = 0 }) {
  const categoryColors = {
    Roads: 'bg-orange-100 text-orange-700',
    Water: 'bg-blue-100 text-blue-700',
    Electricity: 'bg-yellow-100 text-yellow-700',
    Sanitation: 'bg-green-100 text-green-700',
    Default: 'bg-gray-100 text-gray-700',
  }

  const catStyle = categoryColors[complaint.category] || categoryColors.Default

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(30,58,138,0.10)' }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm transition-shadow group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 ${catStyle}`}>
            {complaint.category}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 leading-snug truncate">{complaint.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{complaint.department}</p>
          </div>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{complaint.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-gray-400 text-[11px]">
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {complaint.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {complaint.date}
          </span>
        </div>
        <Link
          to={`/complaint/${complaint.id}`}
          className="flex items-center gap-1 text-xs text-[#1E3A8A] font-semibold opacity-0 group-hover:opacity-100 transition-opacity no-underline hover:gap-2"
        >
          View <ArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  )
}
