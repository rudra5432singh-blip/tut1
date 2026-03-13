import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, CheckCircle, Loader2, MapPin, FileText, Tag, AlignLeft, Image, Building2, AlertTriangle, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const categories = ['Roads & Infrastructure', 'Water Supply', 'Electricity', 'Sanitation', 'Public Safety', 'Parks & Recreation', 'Other']
const priorities = ['low', 'normal', 'high', 'urgent']
const departments = [
  'Road Maintenance Department',
  'Sanitation Department',
  'Electricity Department',
  'Water Supply Department',
  'Drainage Department'
]

const aiCategoryMap = {
  road: 'Roads & Infrastructure',
  garbage: 'Sanitation',
  streetlight: 'Electricity',
  electricity: 'Electricity',
  water: 'Water Supply',
  drainage: 'Sanitation',
  other: 'Other'
}

const aiDepartmentMap = {
  'roads & infrastructure': 'Road Maintenance Department',
  'road maintenance': 'Road Maintenance Department',
  sanitation: 'Sanitation Department',
  'electricity department': 'Electricity Department',
  'water supply board': 'Water Supply Department',
  'water supply department': 'Water Supply Department',
  'sewage & drainage': 'Drainage Department',
  'drainage department': 'Drainage Department'
}

const mapAiCategory = (category) => {
  if (!category) return ''
  const key = category.toLowerCase()
  return aiCategoryMap[key] || categories.find(c => c.toLowerCase().includes(key)) || ''
}

const mapAiDepartment = (department) => {
  if (!department) return ''
  const key = department.toLowerCase()
  return aiDepartmentMap[key] || departments.find(d => d.toLowerCase() === key) || departments.find(d => d.toLowerCase().includes(key)) || department
}

export default function ComplaintForm({ onSuccess, showToast }) {
  const { API_URL } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', category: '', priority: 'normal', department_name: '', location: '', latitude: null, longitude: null, phone_number: '' })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiApplied, setAiApplied] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    if (form.description.length < 10) {
      setAiSuggestions(null)
      setAiApplied(false)
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsAnalyzing(true)
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_URL}/complaints/analyze`, { description: form.description }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAiSuggestions(res.data)
        setAiApplied(false)
      } catch (err) {
        console.error('AI Analysis error:', err)
      } finally {
        setIsAnalyzing(false)
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [form.description, API_URL])

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }))
        },
        (err) => console.warn('Geolocation error:', err)
      )
    }
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await axios.post(`${API_URL}/complaints`, {
        ...form,
        image_url: imagePreview
      });
      
      setSubmitted(true)
      showToast && showToast('Complaint registered successfully!', 'success');
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Submission error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to submit complaint. Please check your connection.';
      showToast && showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-16 px-6"
      >
        <div className="relative w-24 h-24 mx-auto mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
            className="absolute inset-0 bg-emerald-100 rounded-full"
          />
          <svg className="absolute inset-0 w-full h-full text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
              d="M20 6L9 17L4 12"
            />
          </svg>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Submission Successful</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-[300px] mx-auto leading-relaxed">
            Your complaint has been registered successfully. A confirmation message has been sent to your phone.
          </p>
          <p className="text-xs text-slate-400 mb-10 max-w-[280px] mx-auto leading-relaxed">
            Our AI has categorized and routed it to the relevant department for immediate action.
          </p>
          
          <button
            onClick={() => {
              setSubmitted(false)
              setForm({ title: '', description: '', category: '', priority: 'normal', department_name: '', location: '', latitude: null, longitude: null, phone_number: '' })
              setImage(null)
              setImagePreview(null)
              setAiSuggestions(null)
              setAiApplied(false)
            }}
            className="premium-button bg-primary text-white hover:bg-primary-light shadow-xl shadow-blue-500/20 px-8"
          >
            Submit Another
          </button>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FloatingInput name="title" label="Complaint Title" icon={FileText} value={form.title} onChange={handleChange} focused={focused} setFocused={setFocused} />

      <FloatingInput name="phone_number" label="Phone Number (e.g. +91XXXXXXXXXX)" icon={Phone} type="tel" value={form.phone_number} onChange={handleChange} focused={focused} setFocused={setFocused} required={false} />

      <div className="relative group">
        <div className={`absolute left-3 top-4 transition-colors ${focused === 'desc' || form.description ? 'text-primary' : 'text-slate-400'}`}>
          <AlignLeft size={16} />
        </div>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          onFocus={() => setFocused('desc')}
          onBlur={() => setFocused('')}
          placeholder="Describe your complaint in detail..."
          rows={4}
          required
          className={`premium-input w-full pl-10 resize-none ${focused === 'desc' ? 'border-primary ring-4 ring-primary/5' : ''}`}
        />
      </div>

      <AnimatePresence>
        {(isAnalyzing || aiSuggestions) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-primary rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-white" size={12} />
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">AI Smart Assistant</span>
                </div>
                {isAnalyzing && (
                   <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                     <Loader2 size={12} className="text-primary" />
                   </motion.div>
                )}
              </div>

              {aiSuggestions && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-white rounded-xl border border-blue-50">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Detected Category</p>
                       <p className="text-[11px] font-bold text-slate-700 capitalize">{aiSuggestions.category || 'other'}</p>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-blue-50">
                       <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Priority Level</p>
                       <p className={`text-[11px] font-bold capitalize ${
                         aiSuggestions.priority === 'urgent' ? 'text-rose-600' :
                         aiSuggestions.priority === 'high' ? 'text-orange-600' : 'text-slate-600'
                       }`}>{aiSuggestions.priority || 'normal'}</p>
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-blue-50">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Suggested Department</p>
                    <p className="text-[11px] font-bold text-slate-700">{aiSuggestions.department || aiSuggestions.deptName || 'Unassigned'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const mappedCategory = mapAiCategory(aiSuggestions?.category)
                      const mappedDept = mapAiDepartment(aiSuggestions?.department || aiSuggestions?.deptName)
                      const mappedPriority = aiSuggestions?.priority
                      setForm(f => ({
                        ...f,
                        category: mappedCategory || f.category,
                        priority: mappedPriority || f.priority,
                        department_name: mappedDept || f.department_name
                      }))
                      setAiApplied(true)
                    }}
                    disabled={aiApplied}
                    className={`w-full py-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/10 transition-all ${
                      aiApplied ? 'bg-emerald-500 text-white cursor-default' : 'bg-primary text-white hover:bg-primary-light'
                    }`}
                  >
                    {aiApplied ? 'Suggestions Applied' : 'Confirm & Apply Suggestions'}
                  </button>
                  <p className="text-[10px] text-slate-500">You can adjust category, priority, or department below before submitting.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          <Tag size={16} />
        </div>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
          className="premium-input w-full pl-10 appearance-none cursor-pointer"
        >
          <option value="">Select Category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            <AlertTriangle size={16} />
          </div>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="premium-input w-full pl-10 appearance-none cursor-pointer"
          >
            {priorities.map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            <Building2 size={16} />
          </div>
          <select
            name="department_name"
            value={form.department_name}
            onChange={handleChange}
            className="premium-input w-full pl-10 appearance-none cursor-pointer"
          >
            <option value="">Auto-detect Department</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <FloatingInput name="location" label="Location / Area" icon={MapPin} value={form.location} onChange={handleChange} focused={focused} setFocused={setFocused} />

      {/* Image Upload */}
      <div
        onClick={() => fileRef.current.click()}
        className="premium-card p-6 cursor-pointer group border-dashed border-2 bg-slate-50/50 hover:bg-white transition-all overflow-hidden"
      >
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="preview" className="w-full h-44 object-cover rounded-xl shadow-inner" />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={e => { e.stopPropagation(); setImage(null); setImagePreview(null) }}
              className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-slate-400 group-hover:text-primary transition-all">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-110">
              <Image size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-600">Click to upload photo evidence</p>
              <p className="text-[11px] font-medium">PNG, JPG up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={submitting}
        whileTap={{ scale: 0.98 }}
        className="premium-button w-full bg-primary text-white hover:bg-primary-light shadow-xl shadow-blue-900/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-14"
      >
        {submitting ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 size={18} />
            </motion.div>
            <span className="font-bold tracking-tight">Processing submission...</span>
          </>
        ) : (
          <span className="font-bold tracking-tight">Submit Complaint</span>
        )}
      </motion.button>
    </form>
  )
}

const FloatingInput = ({ name, label, icon: Icon, type = 'text', value, onChange, focused, setFocused, required = true }) => (
  <div className="relative group">
    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focused === name || value ? 'text-primary' : 'text-slate-400'}`}>
      <Icon size={16} />
    </div>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(name)}
      onBlur={() => setFocused('')}
      placeholder={required ? label : `${label} (optional)`}
      required={required}
      className={`premium-input w-full pl-10 ${focused === name ? 'border-primary ring-4 ring-primary/5 shadow-sm' : ''}`}
    />
  </div>
)
