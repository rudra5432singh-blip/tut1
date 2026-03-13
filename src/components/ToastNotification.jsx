import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const config = {
  success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-500' },
  error: { icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', iconColor: 'text-yellow-500' },
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-500' },
}

export default function ToastNotification({ message, type = 'success', onClose }) {
  const c = config[type] || config.info
  const Icon = c.icon

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.94 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-xl ${c.bg} ${c.border} min-w-[280px] max-w-sm`}
      >
        <Icon size={20} className={`${c.iconColor} shrink-0 mt-0.5`} />
        <p className={`text-sm font-medium ${c.text} flex-1 leading-snug`}>{message}</p>
        <button onClick={onClose} className={`p-0.5 rounded-lg hover:bg-black/5 transition-colors ${c.text} opacity-60 hover:opacity-100 shrink-0`}>
          <X size={15} />
        </button>
      </motion.div>
    </div>
  )
}
