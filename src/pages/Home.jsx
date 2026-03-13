import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, BarChart3, CheckCircle, Clock, Globe } from 'lucide-react'

const features = [
  { icon: Zap, title: 'AI Classification', desc: 'Our AI instantly classifies the complaint category, department and urgency in seconds.', color: 'bg-blue-100 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300' },
  { icon: Clock, title: 'Urgency Detection', desc: 'Automatically flags high-priority and urgent civic complaints for immediate response.', color: 'bg-red-100 text-error group-hover:bg-error group-hover:text-white transition-colors duration-300' },
  { icon: Globe, title: 'Complaint Tracking', desc: 'Real-time transparent progress tracking from submission straight to resolution.', color: 'bg-green-100 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-300' },
  { icon: BarChart3, title: 'Live Dashboard', desc: 'Admin dashboards visualize active complaints and department performance instantly.', color: 'bg-yellow-100 text-warning group-hover:bg-warning group-hover:text-white transition-colors duration-300' },
]

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bg"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-32 pb-24 lg:pt-40 lg:pb-32 border-b border-gray-100">
        <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px]" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-primary text-xs font-bold mb-8"
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            AI-Powered Civic Technology
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight"
          >
            Resolve Civic Issues <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Instantly with AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            A modern, intelligent platform that auto-analyzes citizen complaints and routes them natively to the correct department, accelerating civic repairs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/submit"
              className="premium-button bg-primary text-white hover:bg-primary-light hover:shadow-[0_8px_30px_rgba(37,99,235,0.25)] flex items-center justify-center py-3.5 px-8 text-base shadow-lg shadow-primary/20"
            >
              Submit Complaint <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              to="/dashboard"
              className="premium-button bg-white text-slate-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center py-3.5 px-8 text-base"
            >
              Admin Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">Smart Civic Routing</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed">
            Eliminate operational bottlenecks visually using intelligent AI classification. 
            Complaints go straight to the responsible party instantly.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group premium-card p-8 flex flex-col items-start translate-y-0"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${f.color}`}>
                <f.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-12 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-accent" />
              <span className="text-accent text-sm font-bold uppercase tracking-widest">Public Safety</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">Report an issue today.</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Help us build a better city. Submit your civic complaint in under 2 minutes and watch progress happen in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {['Smart AI Forms', 'Track via Map', 'Fast Resolution'].map(t => (
                <span key={t} className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                  <CheckCircle size={16} className="text-success" /> {t}
                </span>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <Link
              to="/submit"
              className="premium-button w-full md:w-auto text-center bg-white text-slate-900 hover:bg-gray-50 hover:shadow-xl hover:scale-105 flex justify-center py-4 px-10 text-base"
            >
              Start Complaint <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </motion.div>
      </section>
    </motion.div>
  )
}
