import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, BarChart3, Building2,
  Settings, X, Shield, ChevronRight
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/track', icon: FileText, label: 'Complaints' },
  { to: '/submit', icon: BarChart3, label: 'Submit New' },
  { to: '/', icon: Building2, label: 'Departments' },
  { to: '/', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">SCRS Portal</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X size={16} className="text-white/70" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">Main Menu</p>
        {navItems.map((item) => {
          const active = location.pathname === item.to
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 no-underline group ${
                active
                  ? 'bg-white/20 text-white shadow-lg shadow-black/10'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${active ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/15'}`}>
                  <item.icon size={16} className={active ? 'text-[#38BDF8]' : 'text-white/60'} />
                </div>
                {item.label}
              </div>
              {active && <ChevronRight size={14} className="text-white/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer card */}
      <div className="px-4 pb-6">
        <div className="bg-white/10 rounded-xl p-4 border border-white/10">
          <p className="text-white text-xs font-semibold mb-1">Need Help?</p>
          <p className="text-white/50 text-[11px] leading-relaxed mb-3">Contact support for technical assistance.</p>
          <button className="w-full bg-[#38BDF8] hover:bg-[#0ea5e9] text-[#0c1a3d] text-xs font-bold py-2 rounded-lg transition-colors">
            Get Support
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#1E3A8A] to-[#1e3070] shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-16 bottom-0 z-50 w-60 bg-gradient-to-b from-[#1E3A8A] to-[#1e3070] lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
