import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signup } from '../services/api';
import { FiUser, FiMail, FiLock, FiMapPin, FiUserPlus, FiActivity } from 'react-icons/fi';

const SKILL_OPTIONS = ['medical', 'teaching', 'logistics', 'cooking', 'counseling', 'driving', 'construction', 'tech', 'translation', 'first-aid'];
const CITIES = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Nagpur', 'Hyderabad', 'Kolkata'];

const Signup = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    role: 'volunteer', skills: [],
    city: 'Pune', availability: 'part-time'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const toggleSkill = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cityCoords = {
        Pune: { lat: 18.5204, lng: 73.8567 }, Mumbai: { lat: 19.0760, lng: 72.8777 },
        Delhi: { lat: 28.7041, lng: 77.1025 }, Bangalore: { lat: 12.9716, lng: 77.5946 },
        Chennai: { lat: 13.0827, lng: 80.2707 }, Nagpur: { lat: 21.1458, lng: 79.0882 },
        Hyderabad: { lat: 17.3850, lng: 78.4867 }, Kolkata: { lat: 22.5726, lng: 88.3639 }
      };

      const data = { ...form, location: { ...cityCoords[form.city], city: form.city } };
      delete data.city;

      const res = await signup(data);
      loginUser(res.data.token, res.data.user);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'ngo' ? '/ngo' : '/volunteer');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden font-sans" style={{ background: 'transparent' }}>

      <div className="w-[90%] max-w-2xl mx-auto relative z-10 animate-slide-up text-center">
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 0 30px rgba(34,197,94,0.5)' }}
          >
             <FiActivity className="text-white text-3xl animate-pulse" />
          </div>
        </div>
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
          Join the Network
        </h2>
        <p className="text-center text-slate-400 font-medium">
          Create an account to deploy or assist in active missions.
        </p>
      </div>

      <div className="mt-8 w-[90%] max-w-2xl mx-auto relative z-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl w-full"
             style={{ background: 'rgba(5,20,10,0.65)', border: '1px solid rgba(34,197,94,0.15)' }}>
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <FiUser className="text-cyan-400" /> Full Name
                </label>
                <input type="text" required placeholder="John Doe"
                  className="block w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <FiMail className="text-cyan-400" /> Email Address
                </label>
                <input type="email" required placeholder="john@example.com"
                  className="block w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <FiLock className="text-cyan-400" /> Password
                </label>
                <input type="password" required placeholder="••••••••" minLength={6}
                  className="block w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Clearance Status (Role)</label>
                <select className="block w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-medium appearance-none"
                  value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="volunteer">Volunteer Operative</option>
                  <option value="ngo">NGO Command (Admin)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                  <FiMapPin className="text-cyan-400" /> Base City
                </label>
                <select className="block w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-medium appearance-none"
                  value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Mission Availability</label>
                <select className="block w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all font-medium appearance-none"
                  value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                  <option value="full-time">Full-time Ready</option>
                  <option value="part-time">Part-time Availability</option>
                  <option value="weekends">Weekends Only</option>
                </select>
              </div>
            </div>

            {form.role === 'volunteer' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Spec-Ops Skills (Select all that apply)</label>
                <div className="flex flex-wrap gap-2.5">
                  {SKILL_OPTIONS.map(skill => {
                    const isSelected = form.skills.includes(skill);
                    return (
                      <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all border ${isSelected ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>
                        {isSelected && '✓ '} {skill.toUpperCase()}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border-0 rounded-xl text-sm font-black text-white focus:outline-none transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
                style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 0 20px rgba(34,197,94,0.35)' }}
              >  {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Generating License...</>
                ) : (
                  <><FiUserPlus className="text-lg" /> Authorize Account</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-sm text-slate-400">
              Already possess clearance?{' '}
              <Link to="/login" className="font-bold" style={{ color: '#4ade80' }}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
