import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTasks, getNotifications } from '../services/api';
import { FiClipboard, FiCheckCircle, FiClock, FiStar, FiMapPin, FiAlertTriangle, FiBell, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import TaskDiscussionModal from '../components/TaskDiscussionModal';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [discussTask, setDiscussTask] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [tasksRes, notiRes] = await Promise.all([
        getTasks(),
        getNotifications()
      ]);
      setTasks(tasksRes.data);
      setNotifications(notiRes.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const myTasks = tasks.filter(t => t.assignedVolunteer?._id === user?._id || t.assignedVolunteer === user?._id);
  const recommendedTasks = tasks.filter(t =>
    t.status === 'open' &&
    t.requiredSkills?.some(s => user?.skills?.includes(s))
  );
  const openTasks = tasks.filter(t => t.status === 'open');

  const displayTasks = filter === 'my' ? myTasks : filter === 'recommended' ? recommendedTasks : openTasks;

  const urgencyConfig = {
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    critical: { bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center" style={{ background: 'transparent' }}>
      <div className="w-12 h-12 border-4 rounded-full animate-spin mb-4" style={{ borderColor: 'rgba(34,197,94,0.3)', borderTopColor: '#22c55e' }}></div>
      <p style={{ color: '#6ee7b7' }} className="font-medium">Loading your dashboard...</p>
    </div>
  );

  return (
    <div className="min-h-screen font-sans pt-24 pb-12 px-6 lg:px-8 relative overflow-hidden" style={{ background: 'transparent', color: '#e2fce9' }}>
      {discussTask && <TaskDiscussionModal task={discussTask} user={user} onClose={() => setDiscussTask(null)} onMessageAdded={loadData} />}

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-10 animate-slide-up">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Welcome back, <span style={{ background: 'linear-gradient(135deg,#4ade80,#22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.name}</span> 👋
          </h1>
          <p className="text-slate-400 text-lg">Your impact dashboard and active mission control.</p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: <FiClipboard />, val: myTasks.length, label: 'Assigned Tasks', color: 'indigo' },
            { icon: <FiCheckCircle />, val: user?.completedTasks || 0, label: 'Completed', color: 'emerald' },
            { icon: <FiStar />, val: user?.rating?.toFixed(1) || '0.0', label: 'Rating', color: 'amber' },
            { icon: <FiAlertTriangle />, val: recommendedTasks.length, label: 'Recommended', color: 'cyan' }
          ].map((stat, i) => (
            <div key={i} className="backdrop-blur-xl rounded-2xl p-6 flex items-center gap-5 hover:-translate-y-1 hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${i * 0.1}s`, background: 'rgba(5,20,10,0.55)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-${stat.color}-500/20 text-${stat.color}-400`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-3xl font-black text-white">{stat.val}</div>
                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications */}
        {notifications.filter(n => !n.read).length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-6 backdrop-blur-xl animate-fade-in shadow-lg">
            <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-4 text-lg">
              <FiBell className="animate-bounce" /> Action Required
            </h3>
            <div className="space-y-3">
              {notifications.filter(n => !n.read).slice(0, 3).map(n => (
                <div key={n._id} className="py-2 border-b border-white/5 text-slate-300 text-sm">
                  {n.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { key: 'all', label: `All Open (${openTasks.length})` },
                { key: 'recommended', label: `Recommended (${recommendedTasks.length})` },
                { key: 'my', label: `My Tasks (${myTasks.length})` }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${filter === tab.key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  style={filter === tab.key
                    ? { background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 0 20px rgba(34,197,94,0.35)' }
                    : { background: 'rgba(5,20,10,0.5)', border: '1px solid rgba(34,197,94,0.15)' }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayTasks.map((task, i) => {
                const uConfig = urgencyConfig[task.urgency] || urgencyConfig.low;
                return (
                  <div key={task._id} className="backdrop-blur-md rounded-2xl p-6 hover:shadow-xl transition-all group animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, background: 'rgba(5,20,10,0.5)', border: '1px solid rgba(34,197,94,0.1)' }}
                    onMouseEnter={e => { e.currentTarget.style.border='1px solid rgba(34,197,94,0.35)'; }}
                    onMouseLeave={e => { e.currentTarget.style.border='1px solid rgba(34,197,94,0.1)'; }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold group-hover:text-green-300 transition-colors" style={{ color: '#e2fce9' }}>{task.title}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${uConfig.bg || ''} ${uConfig.text || ''} ${uConfig.border || ''} border`}>
                        {task.urgency}
                      </span>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-5 leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-5">
                      {task.requiredSkills?.map(s => {
                        const hasSkill = user?.skills?.includes(s);
                        return (
                          <span key={s} className={`px-2.5 py-1 rounded-lg text-xs font-bold ${hasSkill ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                            {hasSkill && '✓ '}{s}
                          </span>
                        )
                      })}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-4">
                      <div className="flex items-center gap-4 text-slate-400">
                        <span className="flex items-center gap-1.5"><FiMapPin className="text-indigo-400"/> {task.location?.city || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><FiClock className="text-indigo-400"/> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}</span>
                      </div>
                      {task.status !== 'open' && (
                        <button onClick={() => setDiscussTask(task)} className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all flex items-center gap-2" title="Discuss Task">
                          <FiMessageSquare /> <span className="text-[10px] font-bold uppercase tracking-wider">Discuss</span>
                        </button>
                      )}
                    </div>
                    {task.ngoId?.name && (
                      <div className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Partner: <span className="text-cyan-400">{task.ngoId.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {displayTasks.length === 0 && (
                <div className="col-span-1 md:col-span-2 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-slate-500 mb-4 text-2xl">
                    <FiClipboard />
                  </div>
                  <h3 className="text-lg font-bold text-slate-300 mb-2">No tasks found</h3>
                  <p className="text-slate-500">There are no tasks matching your current filter criteria.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="backdrop-blur-xl rounded-2xl p-6 animate-slide-up" style={{ background: 'rgba(5,20,10,0.55)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <h3 className="text-lg font-bold text-white mb-4">Your Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-lg font-semibold text-sm" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
                    {s}
                  </span>
                ))}
                {(!user?.skills || user.skills.length === 0) && (
                  <span className="text-slate-500 text-sm">No skills added yet.</span>
                )}
              </div>
              <button className="mt-5 w-full py-2.5 rounded-xl border border-slate-700 text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors">
                Update Profile
              </button>
            </div>
            
            <div className="rounded-2xl p-6 relative overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s', background: 'rgba(5,46,22,0.5)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[30px]" style={{ background: 'rgba(34,197,94,0.08)' }}></div>
              <h3 className="text-lg font-bold mb-2 relative z-10" style={{ color: '#e2fce9' }}>AI Volunteer Assistant</h3>
              <p className="text-sm mb-5 relative z-10" style={{ color: '#6ee7b7' }}>Need help finding the right task or understanding your schedule?</p>
              <button className="w-full py-3 rounded-xl font-bold relative z-10 transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', color: '#fff', boxShadow: '0 0 15px rgba(34,197,94,0.35)' }}>
                Open Chatbot
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
