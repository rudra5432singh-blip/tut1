import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Map as MapIcon, TrendingUp, AlertCircle, FileText, PieChart as PieIcon, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import HeatmapMap from '../components/HeatmapMap';
import AnalyticsFilters from '../components/AnalyticsFilters';
import StatsCard from '../components/StatsCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

export default function Analytics() {
  const { API_URL, socket } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const [locationsRes, summaryRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/complaint-locations?${params.toString()}`),
        axios.get(`${API_URL}/analytics/summary`)
      ]);

      setComplaints(locationsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
      setError('Server connection failed. Could not load geospatial or summary data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters, API_URL]);

  useEffect(() => {
    if (socket) {
      const handleRefresh = () => fetchData();
      socket.on('complaintCreated', handleRefresh);
      socket.on('complaintUpdated', handleRefresh);
      return () => {
        socket.off('complaintCreated', handleRefresh);
        socket.off('complaintUpdated', handleRefresh);
      };
    }
  }, [socket]);

  // Chart Data Preparation
  const categoryData = summary ? {
    labels: Object.keys(summary.categoryCounts),
    datasets: [{
      data: Object.values(summary.categoryCounts),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#64748B'],
      borderWidth: 0
    }]
  } : null;

  const statusData = summary ? {
    labels: Object.keys(summary.statusCounts),
    datasets: [{
      label: 'Complaints',
      data: Object.values(summary.statusCounts),
      backgroundColor: '#3B82F6',
      borderRadius: 8
    }]
  } : null;

  const trendData = summary ? {
    labels: Object.keys(summary.dailyTrend).map(d => d.split('-').slice(1).join('/')),
    datasets: [{
      label: 'New Reports',
      data: Object.values(summary.dailyTrend),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  } : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 py-8 lg:px-8"
    >
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-3">
            <Activity className="text-rose-500" size={28} />
            City Geospatial Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Real-time complaint density and hotspot visualization dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-primary transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex flex-col items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Tracking
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="premium-card p-12 text-center bg-rose-50 border border-rose-100 mb-8">
          <AlertCircle className="text-rose-400 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Analytics Offline</h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={fetchData} className="premium-button bg-primary text-white px-8">Retry Connection</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Mapped Cases" value={summary?.total || 0} icon={MapIcon} color="text-primary" bgGradient="bg-gradient-to-br from-blue-600 to-indigo-500" delay={0.1} />
            <StatsCard title="Top Hotspot" value={summary ? Object.entries(summary.categoryCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A' : '...'} icon={AlertCircle} color="text-rose-500" bgGradient="bg-gradient-to-br from-rose-500 to-pink-500" delay={0.2} />
            <StatsCard title="Avg Priority" value={summary ? Object.entries(summary.urgencyCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A' : '...'} icon={TrendingUp} color="text-amber-500" bgGradient="bg-gradient-to-br from-amber-500 to-orange-400" delay={0.3} />
            <StatsCard title="Live Reports" value={complaints.length} icon={FileText} color="text-indigo-500" bgGradient="bg-gradient-to-br from-indigo-500 to-purple-500" delay={0.4} />
          </div>

          <AnalyticsFilters filters={filters} setFilters={setFilters} />

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="lg:col-span-2 premium-card p-1 bg-white relative overflow-hidden h-[500px]"
             >
               <HeatmapMap complaints={complaints} />
               {loading && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                   <div className="flex flex-col items-center gap-3">
                     <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compiling Geospatial Data...</p>
                   </div>
                 </div>
               )}
             </motion.div>

             <div className="space-y-6">
                <div className="premium-card p-6 bg-white h-[240px] flex flex-col items-center justify-center">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                     <PieIcon size={14} /> Category Distribution
                   </h3>
                   <div className="w-full h-full max-w-[180px]">
                      {categoryData && <Pie data={categoryData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />}
                   </div>
                </div>
                <div className="premium-card p-6 bg-white h-[235px] flex flex-col items-center justify-center">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                     <BarChart3 size={14} /> Status Overview
                   </h3>
                   <div className="w-full h-full">
                      {statusData && <Bar data={statusData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />}
                   </div>
                </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 premium-card p-6 bg-white overflow-hidden">
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <TrendingUp size={14} /> Reporting Trend (Last 7 Days)
               </h3>
               <div className="h-[200px] w-full">
                  {trendData && <Line data={trendData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />}
               </div>
            </div>
            
            <div className="premium-card p-6 bg-slate-900 text-white">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-60 text-white">Heatmap Index</h3>
              <div className="space-y-4">
                <div className="h-2 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 rounded-full" />
                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter opacity-80">
                  <span>Low Intensity</span>
                  <span>Critical Density</span>
                </div>
                <p className="text-[11px] text-slate-400 italic leading-relaxed pt-2">
                  Highlighted clusters indicate areas with multiple overlapping civic issues requiring prioritized intervention.
                </p>
                <div className="pt-4 border-t border-white/10">
                   <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Download Spatial PDF</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
