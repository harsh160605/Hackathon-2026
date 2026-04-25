import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, createNGO, getNGOs, matchTask, assignTask, getNGODashboard, predictPriority, getVolunteers } from '../services/api';
import { FiPlus, FiUsers, FiTarget, FiTrendingUp, FiCheck, FiZap, FiMapPin, FiClock, FiX, FiCpu, FiGrid, FiActivity, FiUploadCloud, FiMessageSquare, FiPieChart, FiList, FiMap } from 'react-icons/fi';
import ScanUploadModal from '../components/ScanUploadModal';
import TaskDiscussionModal from '../components/TaskDiscussionModal';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const SKILL_OPTIONS = ['medical', 'teaching', 'logistics', 'cooking', 'counseling', 'driving', 'construction', 'tech', 'translation', 'first-aid'];

const NGODashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [ngo, setNgo] = useState(null);
  const [stats, setStats] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateNGO, setShowCreateNGO] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [matches, setMatches] = useState(null);
  const [matchingTaskId, setMatchingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map'); // 'tasks', 'summary', 'volunteers', 'map'
  const [volunteers, setVolunteers] = useState([]);
  const [discussTask, setDiscussTask] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', requiredSkills: [],
    urgency: 'medium', city: 'Pune', deadline: ''
  });
  const [ngoForm, setNgoForm] = useState({
    name: '', description: '', category: 'community', city: 'Pune'
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const ngosRes = await getNGOs();
      const userNgo = ngosRes.data.find(n => n.adminUser?._id === user?._id || n.adminUser === user?._id);
      if (userNgo) {
        setNgo(userNgo);
        const [tasksRes, dashRes, volRes] = await Promise.all([
          getTasks(),
          getNGODashboard(userNgo._id),
          getVolunteers()
        ]);
        setTasks(tasksRes.data.filter(t => t.ngoId?._id === userNgo._id || t.ngoId === userNgo._id));
        setStats(dashRes.data);
        setVolunteers(volRes.data);
      } else {
        setShowCreateNGO(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cityCoords = {
    Pune: { lat: 18.5204, lng: 73.8567 }, Mumbai: { lat: 19.0760, lng: 72.8777 },
    Delhi: { lat: 28.7041, lng: 77.1025 }, Bangalore: { lat: 12.9716, lng: 77.5946 },
    Chennai: { lat: 13.0827, lng: 80.2707 }, Nagpur: { lat: 21.1458, lng: 79.0882 }
  };

  const handleCreateNGO = async (e) => {
    e.preventDefault();
    try {
      await createNGO({
        ...ngoForm,
        location: { ...cityCoords[ngoForm.city], city: ngoForm.city }
      });
      setShowCreateNGO(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...taskForm,
        location: { ...cityCoords[taskForm.city], city: taskForm.city },
        deadline: taskForm.deadline || undefined
      });
      setShowCreateTask(false);
      setTaskForm({ title: '', description: '', requiredSkills: [], urgency: 'medium', city: 'Pune', deadline: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleAutoDetectUrgency = async () => {
    if (!taskForm.title && !taskForm.description) {
      alert("Please enter a title and description first for the AI to analyze.");
      return;
    }
    try {
      const res = await predictPriority({
        title: taskForm.title,
        description: taskForm.description,
        requiredSkills: taskForm.requiredSkills,
        location: { city: taskForm.city }
      });
      const predicted = res.data.predictedUrgency;
      if (predicted) {
        setTaskForm({ ...taskForm, urgency: predicted });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reach AI Service.");
    }
  };

  const handleMatch = async (taskId) => {
    try {
      setMatchingTaskId(taskId);
      const res = await matchTask(taskId);
      setMatches(res.data);
    } catch (err) {
      alert('Matching failed');
    }
  };

  const handleAssign = async (taskId, volunteerId) => {
    try {
      await assignTask(taskId, volunteerId);
      setMatches(null);
      setMatchingTaskId(null);
      loadData();
    } catch (err) {
      alert('Assignment failed');
    }
  };

  const urgencyConfig = {
    low: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    high: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', shadow: '0 0 10px rgba(248,113,113,0.4)' },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', shadow: '0 0 20px rgba(239,68,68,0.6)', pulse: true }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-sans tracking-wide" style={{ background: 'transparent' }}>
      <div className="w-16 h-16 border-4 rounded-full animate-spin mb-6" style={{ borderColor: 'rgba(239,68,68,0.2)', borderTopColor: '#ef4444' }}></div>
      <p style={{ color: '#fca5a5' }} className="font-bold uppercase tracking-widest text-sm">Authenticating Command Node...</p>
    </div>
  );

  // NGO Creation Form (First time login)
  if (showCreateNGO) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans" style={{ background: 'transparent' }}>
        <div className="w-full max-w-lg backdrop-blur-3xl rounded-3xl p-10 shadow-2xl relative z-10 animate-slide-up" style={{ background: 'rgba(10,5,5,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <h2 className="text-3xl font-extrabold mb-8 text-white tracking-tight">Initialize Base Hub</h2>
          <form onSubmit={handleCreateNGO} className="space-y-6">
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#fca5a5' }}>Organization Designation</label>
              <input className="w-full rounded-xl px-4 py-4 text-white focus:outline-none transition-all font-medium" 
                style={{ background: 'rgba(20,5,5,0.6)', border: '1px solid rgba(239,68,68,0.3)' }}
                value={ngoForm.name} onChange={(e) => setNgoForm({ ...ngoForm, name: e.target.value })} required placeholder="E.g. Red Cross Society" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#fca5a5' }}>Core Directive</label>
              <textarea className="w-full rounded-xl px-4 py-4 text-white focus:outline-none transition-all resize-none font-medium" 
                style={{ background: 'rgba(20,5,5,0.6)', border: '1px solid rgba(239,68,68,0.3)' }}
                rows={3} value={ngoForm.description} onChange={(e) => setNgoForm({ ...ngoForm, description: e.target.value })} required placeholder="Describe operational focus..." />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#fca5a5' }}>Sector</label>
                <select className="w-full rounded-xl px-4 py-4 text-white focus:outline-none transition-all font-medium appearance-none" 
                  style={{ background: 'rgba(20,5,5,0.6)', border: '1px solid rgba(239,68,68,0.3)' }}
                  value={ngoForm.category} onChange={(e) => setNgoForm({ ...ngoForm, category: e.target.value })}>
                  {['education', 'healthcare', 'disaster-relief', 'environment', 'community', 'other'].map(c =>
                    <option key={c} value={c}>{c.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: '#fca5a5' }}>Base Location</label>
                <select className="w-full rounded-xl px-4 py-4 text-white focus:outline-none transition-all font-medium appearance-none" 
                  style={{ background: 'rgba(20,5,5,0.6)', border: '1px solid rgba(239,68,68,0.3)' }}
                  value={ngoForm.city} onChange={(e) => setNgoForm({ ...ngoForm, city: e.target.value })}>
                  {Object.keys(cityCoords).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-5 rounded-xl font-black text-white transition-all uppercase tracking-widest mt-4 text-sm"
              style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 0 25px rgba(220,38,38,0.4)' }}>
              Establish Network
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto font-sans flex flex-col lg:flex-row gap-8" style={{ background: 'transparent' }}>
      {showScanModal && <ScanUploadModal onClose={() => setShowScanModal(false)} onPublished={() => { setShowScanModal(false); loadData(); }} />}
      {discussTask && <TaskDiscussionModal task={discussTask} user={user} onClose={() => setDiscussTask(null)} onMessageAdded={loadData} />}
      
      {/* ── LEFT PANEL: Command Module ── */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
        
        {/* Identity Head */}
        <div className="backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden animate-slide-up" style={{ background: 'rgba(15,5,5,0.6)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl shadow-lg" style={{ background: 'linear-gradient(135deg,#ef4444,#991b1b)', color: '#fff' }}>
            <FiTarget />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-2 leading-tight uppercase">
            {ngo?.name}
          </h1>
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: '#fca5a5' }}>OPS COMMAND CENTER</p>
          
          <div className="mt-8 pt-6 border-t border-red-900/30 flex justify-between tracking-wide text-xs font-bold text-slate-400 uppercase">
            <span className="flex items-center gap-2"><FiMapPin className="text-red-500 text-lg"/> {ngo?.location?.city}</span>
            <span className="flex items-center gap-2"><FiGrid className="text-red-500 text-lg"/> {ngo?.category}</span>
          </div>
        </div>

        {/* Action Triggers */}
        <button 
          onClick={() => setShowCreateTask(!showCreateTask)} 
          className="w-full py-5 rounded-3xl font-black text-white hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-2xl animate-fade-in"
          style={{ background: showCreateTask ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg,#dc2626,#991b1b)', border: showCreateTask ? '1px solid rgba(239,68,68,0.5)' : 'none', boxShadow: showCreateTask ? 'none' : '0 10px 30px rgba(220,38,38,0.4)', color: showCreateTask ? '#fca5a5' : '#fff' }}
        >
          {showCreateTask ? <><FiX className="text-xl"/> ABORT PLANNING</> : <><FiPlus className="text-xl"/> ISSUE NEW DIRECTIVE</>}
        </button>

        {/* AI Scan Button */}
        <button
          onClick={() => setShowScanModal(true)}
          className="w-full py-4 rounded-3xl font-black hover:-translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm animate-fade-in"
          style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.35)', color: '#a78bfa', boxShadow: '0 0 20px rgba(124,58,237,0.1)' }}
        >
          <FiUploadCloud className="text-xl" /> Scan Field Report
        </button>

        {/* Tactical Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <FiActivity />, val: stats?.openTasks || 0, label: 'Active', color: '#10b981' }, // emerald
            { icon: <FiUsers />, val: stats?.memberCount || 0, label: 'Personnel', color: '#3b82f6' }, // blue
            { icon: <FiCheck />, val: stats?.completedTasks || 0, label: 'Secured', color: '#8b5cf6' }, // violet
            { icon: <FiTarget />, val: stats?.totalTasks || 0, label: 'Total Ops', color: '#ef4444' } // red
          ].map((stat, i) => (
            <div key={i} className="backdrop-blur-xl rounded-2xl p-5 animate-slide-up hover:scale-[1.02] transition-transform" 
              style={{ background: 'rgba(10,5,5,0.6)', border: `1px solid ${stat.color}30`, borderTop: `2px solid ${stat.color}` }}>
              <div className="text-3xl font-black mb-1 text-white">{stat.val}</div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
                <div style={{ color: stat.color }} className="text-sm">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: Active Theatre ── */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        
        {/* Create Task Form Overlay (injects above grid if open) */}
        {showCreateTask && (
          <div className="mb-8 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl animate-slide-up border relative overflow-hidden" 
               style={{ background: 'rgba(15,5,5,0.85)', borderColor: 'rgba(239,68,68,0.4)' }}>
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #dc2626, #10b981)' }}></div>
            
            <h3 className="text-xl font-black mb-6 text-white uppercase tracking-widest flex items-center gap-3">
              <span className="p-2 rounded-lg bg-red-500/20 text-red-500"><FiTarget /></span> Parameter Setup
            </h3>
            
            <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black mb-2 uppercase tracking-widest text-red-400">Operation Title</label>
                  <input className="w-full bg-black/40 border border-red-900/50 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 font-medium" 
                    value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="Supply drop execution..." />
                </div>
                <div>
                  <label className="block text-[11px] font-black mb-2 uppercase tracking-widest text-red-400 flex justify-between items-center">
                    <span>Threat Level</span>
                    <button type="button" onClick={handleAutoDetectUrgency} className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                      <FiCpu /> Auto-Detect
                    </button>
                  </label>
                  <select className="w-full bg-black/40 border border-red-900/50 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 font-medium appearance-none" 
                    value={taskForm.urgency} onChange={(e) => setTaskForm({ ...taskForm, urgency: e.target.value })}>
                    {['low', 'medium', 'high', 'critical'].map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black mb-2 uppercase tracking-widest text-red-400">Tactical Objective</label>
                <textarea className="w-full bg-black/40 border border-red-900/50 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 font-medium resize-none" 
                  rows={2} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} required placeholder="Input parameters..." />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black mb-2 uppercase tracking-widest text-red-400">Drop Zone</label>
                  <select className="w-full bg-black/40 border border-red-900/50 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 font-medium appearance-none" 
                    value={taskForm.city} onChange={(e) => setTaskForm({ ...taskForm, city: e.target.value })}>
                    {Object.keys(cityCoords).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black mb-2 uppercase tracking-widest text-red-400">T-Zero (Deadline)</label>
                  <input type="date" className="w-full bg-black/40 border border-red-900/50 rounded-xl px-4 py-4 text-slate-300 focus:outline-none focus:border-red-500 font-medium" 
                    value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black mb-3 uppercase tracking-widest text-red-400">Required Skill Vectors</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map(skill => {
                    const isSelected = taskForm.requiredSkills.includes(skill);
                    return (
                      <button key={skill} type="button"
                        onClick={() => setTaskForm(prev => ({ ...prev, requiredSkills: isSelected ? prev.requiredSkills.filter(s => s !== skill) : [...prev.requiredSkills, skill] }))}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${isSelected ? 'bg-red-500 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-black/40 border-red-900/50 text-slate-500 hover:text-red-300'}`}>
                        {skill}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="pt-4 mt-8 flex justify-end">
                <button type="submit" className="px-10 py-4 rounded-xl font-black text-white hover:-translate-y-1 transition-all uppercase tracking-widest text-[11px]"
                  style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)', boxShadow: '0 0 20px rgba(220,38,38,0.4)' }}>
                  Deploy Data
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Neural Match Overlay */}
        {matches && (
          <div className="absolute inset-0 z-50 backdrop-blur-2xl rounded-3xl p-8 flex flex-col border shadow-2xl animate-fade-in overflow-y-auto"
               style={{ background: 'rgba(5,20,15,0.92)', borderColor: 'rgba(16,185,129,0.5)', boxShadow: '0 0 80px rgba(16,185,129,0.2)' }}>
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                  <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400"><FiZap className="animate-pulse" /></span>
                  Neural Mapping Complete
                </h3>
                <p className="text-emerald-500 font-bold tracking-widest text-xs mt-3 uppercase border-l-2 border-emerald-500 pl-3">Target: "{matches.task}"</p>
              </div>
              <button onClick={() => { setMatches(null); setMatchingTaskId(null); }} className="w-12 h-12 rounded-xl flex items-center justify-center bg-black/40 text-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all text-2xl">
                <FiX />
              </button>
            </div>
            
            <div className="grid gap-4">
              {matches.matches.map((m, i) => (
                <div key={m.volunteerId} className={`relative flex flex-col lg:flex-row justify-between lg:items-center gap-6 p-6 rounded-2xl border transition-all ${i === 0 ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'bg-black/40 border-emerald-900/30 hover:border-emerald-500/50'}`}>
                  {i === 0 && <div className="absolute top-0 right-8 px-4 py-1 bg-emerald-500 text-[10px] font-black text-slate-950 uppercase tracking-widest rounded-b-lg">99.9% OPTIMAL</div>}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : 'bg-emerald-900/40 text-emerald-500'}`}>
                        {i + 1}
                      </div>
                      <span className="text-2xl font-black text-white tracking-tight">{m.name}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-400 mb-4 ml-14 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><FiMapPin className="text-emerald-500 text-lg" /> {m.location?.city}</span>
                      <span className="flex items-center gap-2"><FiClock className="text-blue-500 text-lg" /> {m.availability}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 ml-14">
                      {m.skills?.map(s => <span key={s} className="px-3 py-1.5 bg-emerald-950/50 border border-emerald-800/50 rounded text-[10px] font-black text-emerald-400 uppercase tracking-widest">{s}</span>)}
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 lg:border-l lg:border-emerald-500/20 lg:pl-8">
                    <div className="text-left lg:text-right">
                      <div className="text-4xl lg:text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        {(m.score * 100).toFixed(0)}<span className="text-xl text-emerald-500/50">%</span>
                      </div>
                      <div className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 space-x-2">
                        <span>S:{(m.breakdown.skill*100).toFixed(0)}</span> <span>L:{(m.breakdown.location*100).toFixed(0)}</span> <span>A:{(m.breakdown.availability*100).toFixed(0)}</span>
                      </div>
                    </div>
                    <button onClick={() => handleAssign(matchingTaskId, m.volunteerId)} 
                      className="px-8 py-4 rounded-xl font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all uppercase tracking-widest text-[11px] flex items-center gap-2">
                      Authorize <FiCheck className="text-lg"/>
                    </button>
                  </div>
                </div>
              ))}
              
              {matches.matches.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-red-900/50 rounded-2xl bg-red-950/20">
                  <FiAlertTriangle className="text-5xl text-red-500 mx-auto mb-4 opacity-50" />
                  <div className="text-white font-bold tracking-wide">NO PERSONNEL AVAILABLE</div>
                  <div className="text-red-400 text-sm mt-2">Vector analysis returned zero viable operatives. Adjust mission parameters.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-4 mb-6 pb-4 border-b border-red-900/20 overflow-x-auto">
          {[
            { id: 'tasks', label: 'Live Feed', icon: <FiList /> },
            { id: 'map', label: 'Strategic Map', icon: <FiMap /> },
            { id: 'summary', label: 'Reports Summary', icon: <FiPieChart /> },
            { id: 'volunteers', label: 'Personnel Directory', icon: <FiUsers /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-black/20 text-slate-500 hover:text-red-300'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'summary' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Operational Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="backdrop-blur-xl rounded-2xl p-6 border border-red-900/30 bg-black/40 text-center">
                <div className="text-4xl font-black text-white mb-2">{tasks.length}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Reports Submitted</div>
              </div>
              <div className="backdrop-blur-xl rounded-2xl p-6 border border-emerald-900/30 bg-black/40 text-center">
                <div className="text-4xl font-black text-emerald-400 mb-2">{tasks.filter(t => t.status === 'completed').length}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Resolved</div>
              </div>
              <div className="backdrop-blur-xl rounded-2xl p-6 border border-amber-900/30 bg-black/40 text-center">
                <div className="text-4xl font-black text-amber-400 mb-2">{tasks.filter(t => t.status === 'open').length}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Awaiting Action</div>
              </div>
            </div>
            <div className="backdrop-blur-xl rounded-2xl p-6 border border-red-900/30 bg-black/40">
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4">Urgency Breakdown</h3>
              <div className="space-y-4">
                {['critical', 'high', 'medium', 'low'].map(urg => {
                  const count = tasks.filter(t => t.urgency === urg).length;
                  const pct = tasks.length ? (count / tasks.length) * 100 : 0;
                  const u = urgencyConfig[urg] || urgencyConfig.low;
                  return (
                    <div key={urg}>
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                        <span style={{ color: u.color }}>{urg}</span>
                        <span className="text-slate-400">{count} tasks</span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: u.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* AI STRATEGIC ANALYSIS MOCK */}
            <div className="backdrop-blur-xl rounded-3xl p-8 border border-indigo-900/40 relative overflow-hidden mt-8" style={{ background: 'linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,23,42,0.9))' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
              <h3 className="text-xl font-black text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-3">
                <FiCpu className="text-2xl text-indigo-400" /> AI Strategic Analysis
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Situation Overview</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Analysis of recent reports indicates a high concentration of **medical supply shortages** in the Pune and Mumbai sectors. 40% of all critical tasks are clustered in these regions, primarily requiring first-aid and logistics personnel. The situation is escalating at a moderate pace.
                  </p>
                </div>
                
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Recommended Actions</h4>
                  <ul className="list-disc pl-5 text-slate-300 text-sm leading-relaxed space-y-1">
                    <li>Redeploy 5 available logistics volunteers from Nagpur to Pune immediately.</li>
                    <li>Initiate a bulk procurement of emergency medical kits.</li>
                    <li>Escalate the priority of pending transportation tasks to clear supply bottlenecks.</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">Future Preparedness</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Based on historical data and current trends, expect a 25% surge in demand for **construction and structural repair** skills in the next 14 days as immediate medical crises stabilize. Begin recruiting or re-skilling volunteers for infrastructure rebuilding efforts.
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {activeTab === 'map' && (
          <div className="animate-fade-in h-[600px] rounded-3xl overflow-hidden border border-red-900/30 relative shadow-[0_0_40px_rgba(239,68,68,0.1)]">
            {/* Overlay Title */}
            <div className="absolute top-6 left-6 z-[400] backdrop-blur-xl bg-black/60 border border-white/10 px-6 py-3 rounded-2xl pointer-events-none">
              <h3 className="text-white font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Tactical Heatmap
              </h3>
            </div>
            <MapContainer 
              center={[20.5937, 78.9629]} // Center of India
              zoom={5} 
              style={{ height: '100%', width: '100%', background: '#0f172a' }}
              zoomControl={false}
            >
              {/* Using a dark map tile layer suitable for dashboard */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              {tasks.map(t => {
                if (!t.location || !t.location.lat) return null;
                const u = urgencyConfig[t.urgency] || urgencyConfig.low;
                
                // Determine size and opacity based on urgency
                let radius = 10;
                let fillOpacity = 0.5;
                if (t.urgency === 'critical') { radius = 25; fillOpacity = 0.8; }
                else if (t.urgency === 'high') { radius = 18; fillOpacity = 0.6; }
                else if (t.urgency === 'medium') { radius = 14; fillOpacity = 0.5; }

                return (
                  <CircleMarker
                    key={t._id}
                    center={[t.location.lat, t.location.lng]}
                    radius={radius}
                    pathOptions={{ color: u.color, fillColor: u.color, fillOpacity, weight: 2 }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-1 font-sans">
                        <h4 className="font-bold text-slate-900 mb-1">{t.title}</h4>
                        <p className="text-xs text-slate-600 mb-2">{t.location?.city}</p>
                        <span className="px-2 py-1 text-[10px] font-black uppercase rounded text-white" style={{ background: u.color }}>
                          {t.urgency}
                        </span>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-6">Personnel Directory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {volunteers.map(vol => {
                const isBusy = vol.assignedTasks?.some(t => {
                  const assignedTask = tasks.find(tsk => tsk._id === t || tsk._id === t._id);
                  return assignedTask && assignedTask.status !== 'completed';
                });
                return (
                  <div key={vol._id} className="backdrop-blur-xl rounded-2xl p-6 border border-red-900/20 bg-black/40 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl mb-4 font-black text-slate-400">
                      {vol.name.charAt(0)}
                    </div>
                    <h4 className="font-black text-white text-lg">{vol.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{vol.location?.city || 'No location'}</p>
                    <div className="mt-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
                         style={{ 
                           background: isBusy ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', 
                           color: isBusy ? '#fcd34d' : '#34d399', 
                           borderColor: isBusy ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)' 
                         }}>
                      {isBusy ? 'Busy (Assigned)' : 'Available'}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1 justify-center">
                      {vol.skills?.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-1 rounded bg-red-900/20 text-red-300 text-[9px] uppercase font-black">{s}</span>
                      ))}
                      {vol.skills?.length > 3 && <span className="px-2 py-1 rounded bg-red-900/20 text-red-300 text-[9px] uppercase font-black">+{vol.skills.length - 3}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Task Grid */}
        {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 auto-rows-max pb-10">
          {tasks.map((task, i) => {
            const u = urgencyConfig[task.urgency] || urgencyConfig.low;
            return (
              <div key={task._id} className="backdrop-blur-xl rounded-2xl p-6 flex flex-col transition-all animate-slide-up group" 
                   style={{ animationDelay: `${i * 0.05}s`, background: 'rgba(10,5,5,0.6)', border: `1px solid rgba(239,68,68,0.15)`,
                            boxShadow: task.urgency === 'critical' ? '0 0 20px rgba(239,68,68,0.1) inset' : 'none' }}>
                
                <div className="flex justify-between items-start gap-4 mb-5">
                  <h4 className="font-black text-lg text-white leading-tight flex-1 tracking-tight group-hover:text-red-200 transition-colors">{task.title}</h4>
                  <div className="flex items-center gap-2">
                    {u.pulse && <span className="absolute top-8 right-10 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                    <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border"
                          style={{ background: u.bg, color: u.color, borderColor: `${u.color}40`, boxShadow: u.shadow || 'none' }}>
                      {task.urgency}
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-400 text-xs mb-6 flex-1 line-clamp-3 leading-relaxed">
                  {task.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {task.requiredSkills?.map(s => (
                    <span key={s} className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest"
                          style={{ background: 'rgba(239,68,68,0.05)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {s}
                    </span>
                  ))}
                </div>
                
                <div className="border-t border-red-900/30 pt-5 mt-auto flex justify-between items-center bg-[rgba(0,0,0,0.2)] -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl">
                  {task.status === 'open' ? (
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Awaiting Assignment</span>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-black"><FiCheck/></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{task.assignedVolunteer?.name?.split(' ')[0] || 'Assigned'}</span>
                      </div>
                      <button onClick={() => setDiscussTask(task)} className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all" title="Discuss Task">
                        <FiMessageSquare />
                      </button>
                    </div>
                  )}
                  
                  {task.status === 'open' && (
                    <button onClick={() => handleMatch(task._id)} 
                      className="px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-900 hover:bg-emerald-500 hover:text-slate-950 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2">
                      <FiZap className="text-sm"/> Neural Match
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          
          {tasks.length === 0 && (
             <div className="col-span-1 xl:col-span-2 backdrop-blur-xl border border-dashed border-red-900/30 rounded-3xl p-16 text-center" style={{ background: 'rgba(10,5,5,0.4)' }}>
               <div className="w-20 h-20 mx-auto bg-red-950/50 rounded-2xl flex items-center justify-center border border-red-900/50 mb-6 text-red-900">
                 <FiTarget className="text-4xl" />
               </div>
               <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Zero Active Parameters</h3>
               <p className="text-slate-500 text-sm font-medium">Clearance required to initialize new operational targets.</p>
             </div>
          )}
        </div>
        )}
      </div>

    </div>
  );
};

export default NGODashboard;
