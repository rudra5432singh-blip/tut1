import { Filter, Calendar, Tag, ShieldCheck } from 'lucide-react';

export default function AnalyticsFilters({ filters, setFilters }) {
  const CATEGORIES = ['All', 'Roads', 'Water', 'Electricity', 'Sanitation', 'Other'];
  const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Escalated'];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Tag size={16} className="text-slate-400" />
        <select 
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value === 'All' ? '' : e.target.value })}
          className="bg-gray-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-slate-400" />
        <select 
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value === 'All' ? '' : e.target.value })}
          className="bg-gray-50 border-0 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-slate-400" />
        <input 
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="bg-gray-50 border-0 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer"
        />
        <span className="text-slate-300 text-xs">-</span>
        <input 
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="bg-gray-50 border-0 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer"
        />
      </div>

      <button 
        onClick={() => setFilters({ category: '', status: '', startDate: '', endDate: '' })}
        className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
}
