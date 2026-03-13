import { motion } from 'framer-motion'
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'

const iconMap = {
  submitted: Clock,
  assigned: Loader2,
  'in-progress': Loader2,
  resolved: CheckCircle,
  escalated: AlertCircle,
}

const colorMap = {
  submitted: { line: 'bg-yellow-400', dot: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  assigned: { line: 'bg-blue-400', dot: 'bg-blue-400', text: 'text-blue-700', bg: 'bg-blue-50' },
  'in-progress': { line: 'bg-[#38BDF8]', dot: 'bg-[#38BDF8]', text: 'text-sky-700', bg: 'bg-sky-50' },
  resolved: { line: 'bg-green-500', dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' },
  escalated: { line: 'bg-red-400', dot: 'bg-red-400', text: 'text-red-700', bg: 'bg-red-50' },
}

export default function ComplaintTimeline({ events }) {
  return (
    <div className="relative">
      {events.map((event, i) => {
        const Icon = iconMap[event.type] || Clock
        const color = colorMap[event.type] || colorMap.submitted
        const isLast = i === events.length - 1

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className="flex gap-4 relative"
          >
            {/* Vertical line */}
            {!isLast && (
              <div className={`absolute left-4 top-9 w-0.5 h-full ${color.line} opacity-30`} />
            )}

            {/* Dot */}
            <div className={`w-8 h-8 rounded-full ${color.dot} flex items-center justify-center shrink-0 shadow-sm`}>
              <Icon size={14} className="text-white" />
            </div>

            {/* Content */}
            <div className={`flex-1 mb-6 p-3.5 rounded-xl border ${color.bg}`} style={{ borderColor: 'transparent' }}>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${color.text}`}>{event.title}</p>
                <span className="text-[11px] text-gray-400 shrink-0">{event.time}</span>
              </div>
              {event.description && (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{event.description}</p>
              )}
              {event.by && (
                <p className="text-[11px] text-gray-400 mt-1">by {event.by}</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
