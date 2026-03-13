import { motion } from 'framer-motion'
import ComplaintForm from '../components/ComplaintForm'
import { FileText, MapPin, Bell, Shield } from 'lucide-react'

const steps = [
  { icon: FileText, title: 'Fill the Form', desc: 'Provide complaint details, category, and location.' },
  { icon: Shield, title: 'Auto Routing', desc: 'AI assigns it to the responsible department instantly.' },
  { icon: Bell, title: 'Get Updates', desc: 'Receive real-time status updates on your complaint.' },
  { icon: MapPin, title: 'Resolution', desc: 'Department resolves and closes the complaint on-site.' },
]

export default function SubmitComplaint({ showToast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 py-8 lg:px-8"
    >
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Report a Civic Issue</h1>
        <p className="text-slate-500 text-sm sm:text-base mt-2 leading-relaxed">Fill in the details below. Our AI assistant will automatically structure and route your complaint to the appropriate governing department.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form Container */}
        <div className="lg:col-span-3">
          <div className="premium-card overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-100 px-8 py-6">
              <h2 className="text-slate-800 font-black text-lg">Complaint Details</h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">All fields marked with an asterisk are required</p>
            </div>
            <div className="p-8">
              <ComplaintForm 
                onSuccess={() => showToast && showToast('Complaint submitted successfully!', 'success')} 
                showToast={showToast}
              />
            </div>
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* How it works */}
          <div className="premium-card p-6 border-transparent bg-gradient-to-br from-white to-slate-50">
            <h3 className="text-sm font-black text-slate-800 mb-5 uppercase tracking-widest">How It Works</h3>
            <div className="space-y-5">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-center shrink-0">
                    <step.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-0.5">{step.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6">
            <div className="flex items-start gap-2 mb-2">
              <Shield size={16} className="text-primary mt-0.5" />
              <p className="text-sm font-bold text-primary">Your Privacy is Protected</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Your personal information is encrypted and only shared with the relevant department for resolution purposes. All complaints can be submitted anonymously.
            </p>
          </div>

          {/* SLA box */}
          <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Resolution Service Level Agreement (SLA)</p>
            {[
              { cat: 'Emergency', time: '24 hours', bar: 'w-full', color: 'bg-error' },
              { cat: 'High Priority', time: '3 days', bar: 'w-4/5', color: 'bg-warning' },
              { cat: 'Normal', time: '7 days', bar: 'w-3/5', color: 'bg-primary' },
            ].map(s => (
              <div key={s.cat} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{s.cat}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{s.time}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${s.bar} ${s.color} rounded-full opacity-80`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
