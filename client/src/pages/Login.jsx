import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { FiMail, FiLock, FiLogIn, FiActivity } from 'react-icons/fi';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      const role = res.data.user.role;
      navigate(role === 'admin' ? '/admin' : role === 'ngo' ? '/ngo' : '/volunteer');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 px-6 lg:px-8 relative overflow-hidden font-sans" style={{ background: 'transparent' }}>

      <div className="w-[90%] max-w-md mx-auto relative z-10 animate-slide-up text-center">
        <div className="flex justify-center mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 0 30px rgba(34,197,94,0.5)' }}
        >
             <FiActivity className="text-white text-3xl animate-pulse" />
          </div>
        </div>
        <h2 className="text-center text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-slate-400 font-medium">
          Sign in to your command center
        </p>
      </div>

      <div className="mt-8 w-[90%] max-w-md mx-auto relative z-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-slate-900/60 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl w-full"
             style={{ border: '1px solid rgba(34,197,94,0.15)', background: 'rgba(5,20,10,0.65)' }}>
          {error && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div> {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <FiMail className="text-indigo-400" /> Email Address
              </label>
              <div className="mt-1">
                <input id="email" name="email" type="email" required placeholder="operative@volunteer.ai"
                  className="block w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all font-medium"
                  style={{ background: 'rgba(3,13,6,0.6)', border: '1px solid rgba(34,197,94,0.2)' }}
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={e => e.target.style.borderColor='rgba(74,222,128,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(34,197,94,0.2)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                <FiLock className="text-indigo-400" /> Password
              </label>
              <div className="mt-1">
                <input id="password" name="password" type="password" required placeholder="••••••••"
                  className="block w-full px-4 py-3 rounded-xl text-white placeholder-slate-600 focus:outline-none transition-all font-medium"
                  style={{ background: 'rgba(3,13,6,0.6)', border: '1px solid rgba(34,197,94,0.2)' }}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={e => e.target.style.borderColor='rgba(74,222,128,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(34,197,94,0.2)'}
                />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border-0 rounded-xl text-sm font-bold text-white focus:outline-none transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
                style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 0 20px rgba(34,197,94,0.35)' }}
              >  {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Authenticating...</>
                ) : (
                  <><FiLogIn className="text-lg" /> Sign In</>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold" style={{ color: '#4ade80' }}>
                Apply for Access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
