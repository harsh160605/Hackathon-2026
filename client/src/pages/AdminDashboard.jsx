import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/api';
import { FiUsers, FiTarget, FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiAward, FiActivity } from 'react-icons/fi';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-medium">Loading system analytics...</p>
    </div>
  );
  
  if (!stats) return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 flex flex-col items-center justify-center">
      <FiActivity className="text-4xl text-slate-700 mb-4" />
      <p className="text-slate-500 font-medium text-lg">No analytical data available currently.</p>
    </div>
  );

  const { overview, urgencyDistribution, statusDistribution, skillsDemand, recentTasks } = stats;

  const pieData = (urgencyDistribution || []).map(d => ({ name: d._id, value: d.count }));
  const skillsData = (skillsDemand || []).map(d => ({ name: d._id, count: d.count }));
  
  const urgencyConfig = {
    low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
    critical: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20 animate-pulse' }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100 font-sans pt-16 pb-12 px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-96 bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Analytics</span>
          </h1>
          <p className="text-slate-400 text-lg">Global platform overview, realtime mission data and analytics.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { icon: <FiUsers />, value: overview.totalVolunteers, label: 'Volunteers', color: 'indigo' },
            { icon: <FiAward />, value: overview.totalNGOs, label: 'NGOs', color: 'cyan' },
            { icon: <FiTarget />, value: overview.totalTasks, label: 'Total Tasks', color: 'blue' },
            { icon: <FiTrendingUp />, value: overview.openTasks, label: 'Open Tasks', color: 'amber' },
            { icon: <FiCheckCircle />, value: overview.completedTasks, label: 'Completed', color: 'emerald' },
            { icon: <FiAlertTriangle />, value: overview.criticalTasks, label: 'Critical', color: 'rose' }
          ].map((s, i) => (
            <div key={i} className={`bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex flex-col justify-center animate-slide-up relative overflow-hidden group hover:border-${s.color}-500/50 transition-all`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`absolute -right-4 -top-4 w-16 h-16 bg-${s.color}-500/10 rounded-full blur-[10px] group-hover:bg-${s.color}-500/20 transition-all`}></div>
              <div className={`text-2xl text-${s.color}-400 mb-3`}>{s.icon}</div>
              <div className="text-3xl font-black text-white mb-1 leading-none">{s.value}</div>
              <div className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Urgency Distribution */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/20 rounded-md text-indigo-400"><FiActivity /></span> Urgency Distribution
            </h3>
            {pieData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none" label={({ name, value }) => `${name.toUpperCase()}: ${value}`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', backdropFilter: 'blur(10px)' }} itemStyle={{ color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-slate-500 text-center py-10">Data insufficient for modeling</p>}
          </div>

          {/* Skills Demand */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-cyan-500/20 rounded-md text-cyan-400"><FiTrendingUp /></span> Top Skills in Demand
            </h3>
            {skillsData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsData} layout="vertical" margin={{ left: 60, right: 20 }}>
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 600 }} width={80} axisLine={{ stroke: '#334155' }} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="url(#colorCyanIndigo)" radius={[0, 6, 6, 0]}>
                      {skillsData.map((_, i) => <Cell key={i} fill={COLORS[i % 2 === 0 ? 0 : 1]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-slate-500 text-center py-10">Data insufficient for modeling</p>}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 rounded-md text-emerald-400"><FiTarget /></span> Network Activity Log
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Mission Designation</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Command NGO</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Threat Level</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentTasks || []).map(t => {
                  const uConf = urgencyConfig[t.urgency] || urgencyConfig.low;
                  return (
                    <tr key={t._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-200">{t.title}</td>
                      <td className="py-4 px-4 text-slate-400 font-medium">{t.ngoId?.name || 'Unassigned'}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded text-[0.65rem] font-bold uppercase tracking-wider border ${uConf.bg} ${uConf.text} ${uConf.border}`}>
                          {t.urgency}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded text-[0.65rem] font-bold uppercase tracking-wider border ${t.status === 'open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : t.status === 'assigned' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {(!recentTasks || recentTasks.length === 0) && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 border-none">No network activity recorded</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
