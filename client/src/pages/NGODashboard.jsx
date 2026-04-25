import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, createNGO, getNGOs, matchTask, assignTask, getNGODashboard, predictPriority } from '../services/api';
import { FiPlus, FiUsers, FiTarget, FiTrendingUp, FiCheck, FiZap, FiMapPin, FiClock, FiX, FiCpu } from 'react-icons/fi';

const SKILL_OPTIONS = ['medical', 'teaching', 'logistics', 'cooking', 'counseling', 'driving', 'construction', 'tech', 'translation', 'first-aid'];

const NGODashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [ngo, setNgo] = useState(null);
  const [stats, setStats] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateNGO, setShowCreateNGO] = useState(false);
  const [matches, setMatches] = useState(null);
  const [matchingTaskId, setMatchingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);

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
        const [tasksRes, dashRes] = await Promise.all([
          getTasks(),
          getNGODashboard(userNgo._id)
        ]);
        setTasks(tasksRes.data.filter(t => t.ngoId?._id === userNgo._id || t.ngoId === userNgo._id));
        setStats(dashRes.data);
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
        alert(`AI detected urgency as: ${predicted.toUpperCase()} (Confidence: ${res.data.confidence * 100}%)`);
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
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    critical: { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse ring-2 ring-rose-500/20' }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-medium">Authenticating credentials...</p>
    </div>
  );

  // NGO Creation Form
  if (showCreateNGO) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-slide-up">
          <h2 className="text-3xl font-extrabold mb-8 text-white">Create Your NGO Hub</h2>
          <form onSubmit={handleCreateNGO} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Organization Name</label>
              <input className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium" 
                value={ngoForm.name} onChange={(e) => setNgoForm({ ...ngoForm, name: e.target.value })} required placeholder="E.g. Red Cross Society" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">Mission Statement</label>
              <textarea className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-medium" 
                rows={3} value={ngoForm.description} onChange={(e) => setNgoForm({ ...ngoForm, description: e.target.value })} required placeholder="Describe your NGO's primary focus..." />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Sector</label>
                <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all font-medium appearance-none" 
                  value={ngoForm.category} onChange={(e) => setNgoForm({ ...ngoForm, category: e.target.value })}>
                  {['education', 'healthcare', 'disaster-relief', 'environment', 'community', 'other'].map(c =>
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Base City</label>
                <select className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all font-medium appearance-none" 
                  value={ngoForm.city} onChange={(e) => setNgoForm({ ...ngoForm, city: e.target.value })}>
                  {Object.keys(cityCoords).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:-translate-y-1 transition-all mt-4 text-lg">
              Establish Headquarter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-slate-100 font-sans pt-16 pb-12 px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-96 bg-cyan-900/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 animate-slide-up">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{ngo?.name}</span> Command
            </h1>
            <p className="text-slate-400 text-lg">Oversee active missions, task deployments, and volunteer personnel.</p>
          </div>
          <button onClick={() => setShowCreateTask(!showCreateTask)} className="px-6 py-3 rounded-xl bg-cyan-600 text-white font-bold flex items-center gap-2 hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
            {showCreateTask ? <><FiX /> Close Planner</> : <><FiPlus /> New Mission Task</>}
          </button>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: <FiTarget />, val: stats?.totalTasks || 0, label: 'Total Operations', color: 'indigo' },
            { icon: <FiTrendingUp />, val: stats?.openTasks || 0, label: 'Active Missions', color: 'cyan' },
            { icon: <FiCheck />, val: stats?.completedTasks || 0, label: 'Successful', color: 'emerald' },
            { icon: <FiUsers />, val: stats?.memberCount || 0, label: 'Personnel deployed', color: 'amber' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/30 hover:shadow-2xl transition-all animate-slide-up relative overflow-hidden" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/10 rounded-full blur-[20px] -mr-10 -mt-10`}></div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 bg-${stat.color}-500/20 text-${stat.color}-400 relative z-10`}>
                {stat.icon}
              </div>
              <div className="relative z-10">
                <div className="text-4xl font-black text-white mb-1">{stat.val}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Task Form Details */}
        {showCreateTask && (
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/30 rounded-3xl p-8 mb-12 animate-slide-up shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
            <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <span className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><FiTarget /></span> Configure New Protocol
            </h3>
            
            <form onSubmit={handleCreateTask} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Operation Title</label>
                  <input className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium" 
                    value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required placeholder="E.g. Flood relief medical camp..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide flex justify-between items-center">
                    <span>Threat Level / Urgency</span>
                    <button type="button" onClick={handleAutoDetectUrgency} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20 transition-all">
                      <FiCpu /> Auto-Detect
                    </button>
                  </label>
                  <select className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all font-medium appearance-none" 
                    value={taskForm.urgency} onChange={(e) => setTaskForm({ ...taskForm, urgency: e.target.value })}>
                    {['low', 'medium', 'high', 'critical'].map(u =>
                      <option key={u} value={u}>{u.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Tactical Objective (Description)</label>
                <textarea className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium resize-none" 
                  rows={2} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} required placeholder="Provide clear instructions and expected outcomes..." />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Deployment Zone (City)</label>
                  <select className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all font-medium appearance-none" 
                    value={taskForm.city} onChange={(e) => setTaskForm({ ...taskForm, city: e.target.value })}>
                    {Object.keys(cityCoords).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Absolute Deadline</label>
                  <input type="date" className="w-full bg-slate-950/50 border border-slate-700 text-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-all font-medium" 
                    value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-3 uppercase tracking-wide">Required Personnel Skills</label>
                <div className="flex flex-wrap gap-3">
                  {SKILL_OPTIONS.map(skill => {
                    const isSelected = taskForm.requiredSkills.includes(skill);
                    return (
                      <button key={skill} type="button"
                        onClick={() => setTaskForm(prev => ({
                          ...prev, requiredSkills: isSelected ? prev.requiredSkills.filter(s => s !== skill) : [...prev.requiredSkills, skill]
                        }))}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isSelected ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>
                        {isSelected && '✓ '} {skill.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="pt-4 flex gap-4 border-t border-white/5">
                <button type="submit" className="px-8 py-3 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-900/50 transition-all">
                  Initialize Mission
                </button>
                <button type="button" onClick={() => setShowCreateTask(false)} className="px-8 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all">
                  Abort
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AI Matching Intelligence */}
        {matches && (
          <div className="bg-slate-900/90 backdrop-blur-2xl border-2 border-emerald-500/50 rounded-3xl p-8 mb-12 animate-slide-up shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <FiZap className="text-emerald-400 animate-pulse" /> Neural Matching Results
                </h3>
                <p className="text-emerald-400/80 font-medium mt-1">Analyzing vector parameters for task: "{matches.task}"</p>
              </div>
              <button onClick={() => { setMatches(null); setMatchingTaskId(null); }} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="grid gap-4 relative z-10">
              {matches.matches.map((m, i) => (
                <div key={m.volunteerId} className={`flex flex-col md:flex-row justify-between md:items-center gap-6 p-6 rounded-2xl border ${i === 0 ? 'bg-emerald-500/10 border-emerald-500/40 relative overflow-hidden' : 'bg-slate-950/50 border-slate-800'}`}>
                  {i === 0 && <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-xs font-bold text-white rounded-bl-xl">TOP MATCH</div>}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${i === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>#{i + 1}</span>
                      <span className="text-xl font-bold text-white">{m.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3 ml-11">
                      <span className="flex items-center gap-1"><FiMapPin className="text-emerald-500" /> {m.location?.city}</span>
                      <span className="flex items-center gap-1"><FiClock className="text-indigo-400" /> {m.availability}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 ml-11">
                      {m.skills?.map(s => <span key={s} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-bold text-slate-300 uppercase">{s}</span>)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 md:border-l md:border-white/10 md:pl-6">
                    <div className="text-right">
                      <div className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">{(m.score * 100).toFixed(0)}%</div>
                      <div className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        S:{(m.breakdown.skill*100).toFixed(0)} L:{(m.breakdown.location*100).toFixed(0)} A:{(m.breakdown.availability*100).toFixed(0)}
                      </div>
                    </div>
                    <button onClick={() => handleAssign(matchingTaskId, m.volunteerId)} className="h-14 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all uppercase tracking-wide text-sm flex items-center gap-2">
                       Deploy <FiCheck />
                    </button>
                  </div>
                </div>
              ))}
              
              {matches.matches.length === 0 && (
                <div className="p-8 text-center text-slate-400 border border-dashed border-slate-700 rounded-2xl">
                  No suitable personnel found in proximity with required vector parameters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Task Dashboard Grid */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-white">Active Logs</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task, i) => {
            const uConfig = urgencyConfig[task.urgency] || urgencyConfig.low;
            return (
              <div key={task._id} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col h-full hover:border-cyan-500/30 transition-colors animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h4 className="font-bold text-lg text-white leading-tight flex-1">{task.title}</h4>
                  <span className={`px-2 py-1 rounded border text-[0.65rem] font-black uppercase tracking-wider ${uConfig.bg} ${uConfig.text} ${uConfig.border}`}>
                    {task.urgency}
                  </span>
                </div>
                
                <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                  {task.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {task.requiredSkills?.map(s => (
                    <span key={s} className="px-2 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md text-xs font-bold uppercase">
                      {s}
                    </span>
                  ))}
                </div>
                
                <div className="border-t border-white/5 pt-4 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${task.status === 'open' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : task.status === 'assigned' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {task.status}
                    </span>
                    
                    {task.status === 'open' && (
                      <button onClick={() => handleMatch(task._id)} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg text-xs font-bold hover:-translate-y-0.5 shadow-lg shadow-cyan-900/50 transition-all flex items-center gap-2">
                        <FiZap /> Run AI Match
                      </button>
                    )}
                    
                    {task.assignedVolunteer && (
                      <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-bold text-slate-300">{task.assignedVolunteer.name || 'Assigned'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          
          {tasks.length === 0 && (
             <div className="col-span-1 lg:col-span-2 xl:col-span-3 bg-slate-900/30 border border-dashed border-slate-700 rounded-3xl p-16 text-center">
               <FiTarget className="text-4xl text-slate-600 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-slate-300 mb-2">No Active Missions</h3>
               <p className="text-slate-500">Initialize a new mission task to begin operation coordination.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
