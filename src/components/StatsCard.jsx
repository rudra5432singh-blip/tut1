import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ArrowUpRight } from 'lucide-react'

function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [target, duration])
  return count
}

export default function StatsCard({ title, value, icon: Icon, color, trend, bgGradient, delay = 0 }) {
  const count = useCounter(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="premium-card p-6 cursor-default group"
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            <div className={`w-1 h-1 rounded-full ${color.replace('text-', 'bg-')}`} />
          </div>
          <h3 className={`text-3xl font-black font-display tracking-tight ${color}`}>
            {count.toLocaleString()}
          </h3>
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100">
                <ArrowUpRight size={10} className="text-emerald-600" />
              </div>
              <span className="text-[12px] text-emerald-600 font-bold">{trend}</span>
            </div>
          )}
        </div>
        <motion.div 
          whileHover={{ rotate: 5, scale: 1.1 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${bgGradient} ring-4 ring-white shadow-blue-900/10`}
        >
          <Icon size={24} className="text-white" />
        </motion.div>
      </div>
      
      {/* Subtle bottom gradient sweep */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  )
}
