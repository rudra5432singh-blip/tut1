import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, Shield, Building2 } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Citizen', department_name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const departments = ['Road Maintenance Department', 'Sanitation Department', 'Electricity Department', 'Water Supply Department', 'Drainage Department'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white p-8 md:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#14B8A6] flex items-center justify-center shadow-lg mb-4 ring-4 ring-white">
              <Shield size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Citizen Enrollment</h2>
            <p className="text-slate-400 text-sm font-bold">Join Archis Imperium governance network</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  className="premium-input w-full pl-12"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="premium-input w-full pl-12"
                  placeholder="Official Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="premium-input w-full pl-12"
                placeholder="Secure Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="relative group">
                <select
                  className="premium-input w-full cursor-pointer"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="Citizen">Citizen Role</option>
                  <option value="Department Admin">Dept. Administrator</option>
                </select>
              </div>

              {form.role === 'Department Admin' && (
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Building2 size={18} />
                  </div>
                  <select
                    required
                    className="premium-input w-full pl-12 cursor-pointer"
                    value={form.department_name}
                    onChange={(e) => setForm({ ...form, department_name: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>

            <button
              disabled={loading}
              className="premium-button w-full bg-primary text-white hover:bg-primary-light h-14 shadow-xl shadow-blue-900/10 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span className="font-bold tracking-tight">Establish Account</span>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-bold text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Access portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
