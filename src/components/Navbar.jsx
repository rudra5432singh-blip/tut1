import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronDown, Shield, Menu, X, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/submit', label: 'Submit Complaint' },
    { to: '/dashboard', label: 'Admin Dashboard' },
  ]

  const notifications = [
    { id: 1, text: 'Complaint #C-1042 resolved', time: '2m ago', dot: 'bg-green-500' },
    { id: 2, text: 'New complaint assigned to Roads dept.', time: '15m ago', dot: 'bg-blue-500' },
    { id: 3, text: 'Complaint #C-1039 escalated', time: '1h ago', dot: 'bg-yellow-500' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-sm ring-1 ring-black/[0.02]">
      <div className="flex items-center justify-between h-full px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors lg:hidden active:scale-90"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          
          <Link to="/" className="flex items-center gap-3 no-underline group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white shadow-sm ring-2 ring-primary/20"
            >
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </motion.div>
            <div className="hidden sm:block">
              <p className="text-[15px] font-black tracking-tight text-slate-800 leading-none">AI Civic Complaint <span className="text-primary">Resolver</span></p>
              <p className="text-[10px] text-slate-500 font-semibold tracking-widest mt-0.5 uppercase">Smart Platform</p>
            </div>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-1.5 px-1.5 py-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/20 shadow-inner">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 no-underline whitespace-nowrap ${
                location.pathname === link.to
                  ? 'bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)] scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false) }}
                  className={`relative p-2.5 rounded-xl transition-all ${notifOpen ? 'bg-primary/5 text-primary' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </motion.button>
              </div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false) }}
                  className="flex items-center gap-3 pl-1 pr-3 py-1 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] flex items-center justify-center text-white text-[11px] font-black shadow-inner">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                    >
                      <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-800 tracking-tight">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-1.5 space-y-1">
                        <button onClick={() => {setProfileOpen(true); setDropdownOpen(false)}} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all">
                          <User size={16} /> Manage Profile
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-bold text-rose-500 hover:bg-rose-50 transition-all">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-light transition-all no-underline">
              Access Portal
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {profileOpen && user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProfileOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="h-32 bg-primary relative overflow-hidden">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              </div>
              <div className="px-8 pb-8">
                <div className="relative -mt-14 mb-6">
                  <div className="w-28 h-28 rounded-3xl bg-white p-1.5 shadow-2xl">
                    <div className="w-full h-full rounded-[1.25rem] bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-black">
                      {user.name[0]}
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800">{user.name}</h2>
                <p className="text-slate-400 text-sm font-bold bg-slate-50 inline-block px-3 py-1 rounded-full mt-2 uppercase tracking-widest">{user.role}</p>
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Email Node</p>
                    <p className="text-sm font-bold text-slate-700">{user.email}</p>
                  </div>
                  {user.department_id && (
                    <div className="p-4 bg-slate-50 rounded-2xl">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Assigned Department</p>
                       <p className="text-sm font-bold text-slate-700">Administrative Unit</p>
                    </div>
                  )}
                </div>
                <button onClick={() => setProfileOpen(false)} className="premium-button w-full mt-8 bg-slate-900 text-white h-14">Close Identity Module</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  )
}
