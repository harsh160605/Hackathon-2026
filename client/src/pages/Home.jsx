import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiZap, FiMap, FiUsers, FiBarChart2, FiMessageCircle, FiShield, FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const features = [
  { icon: <FiZap />, title: 'Intelligent Matching', desc: 'AI-powered volunteer-task matching using skill analysis, proximity, and availability. Find the perfect task instantly.' },
  { icon: <FiMap />, title: 'Real-time Operations', desc: 'Interactive live maps showing real-time task locations, urgency hotspots, and volunteer distribution.' },
  { icon: <FiUsers />, title: 'Unified Ecosystem', desc: 'Seamlessly connect and manage multiple NGOs, corporate partners, and thousands of dedicated volunteers.' },
  { icon: <FiBarChart2 />, title: 'Advanced Analytics', desc: 'Data-driven insights with predictive urgency tracking, skill demand forecasting, and performance metrics.' },
  { icon: <FiMessageCircle />, title: 'Smart AI Assistant', desc: '24/7 AI chatbot to guide volunteers, recommend immediate actions, and provide instant operational support.' },
  { icon: <FiShield />, title: 'Automated Prioritization', desc: 'Dynamic urgency scoring based strictly on absolute deadlines, task age, and community impact needs.' }
];

const Home = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden relative font-sans" style={{ background: 'transparent', color: '#e2fce9' }}>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 w-full max-w-7xl mx-auto flex flex-col items-center text-center" style={{ zIndex: 10 }}>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-slide-up"
          style={{
            background: 'rgba(5,30,15,0.7)',
            border: '1px solid rgba(34,197,94,0.35)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(34,197,94,0.15)',
          }}
        >
          <span className="flex h-2 w-2 rounded-full animate-ping" style={{ background: '#22c55e' }}></span>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#86efac' }}>Next-Gen Volunteer Platform</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 animate-slide-up max-w-4xl leading-tight" style={{ animationDelay: '100ms', color: '#e2fce9' }}>
          Smart Resource Allocation for{' '}
          <span style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Global Impact
          </span>
        </h1>

        <p className="text-lg lg:text-xl max-w-2xl mb-12 animate-slide-up leading-relaxed" style={{ color: '#86efac', animationDelay: '200ms' }}>
          Intelligently connect passionate volunteers with urgent community needs using AI-driven skill matching, hyper-local prioritization, and real-time operational data.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-slide-up w-full sm:w-auto justify-center px-4" style={{ animationDelay: '300ms' }}>
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/volunteer'}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #059669)',
                boxShadow: '0 0 30px rgba(22,163,74,0.5)',
              }}
            >
              Access Dashboard <FiArrowRight />
            </Link>
          ) : (
            <>
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:-translate-y-1 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #059669)',
                  boxShadow: '0 0 30px rgba(22,163,74,0.5)',
                }}
              >
                Join the Movement <FiArrowRight />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(5,46,22,0.7)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#86efac',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-20 w-full relative animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, #030d06 5%, rgba(3,13,6,0.2) 50%, transparent)' }}></div>
          <div
            className="rounded-2xl p-2 shadow-2xl relative overflow-hidden mx-auto max-w-5xl"
            style={{
              background: 'rgba(5,20,10,0.6)',
              border: '1px solid rgba(34,197,94,0.15)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 80px rgba(34,197,94,0.1), inset 0 1px 0 rgba(34,197,94,0.1)',
            }}
          >
            <div className="h-8 flex items-center px-4 gap-2 mb-2" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }}></div>
              <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }}></div>
            </div>
            <div className="grid grid-cols-12 gap-4 h-[400px] p-2 opacity-80">
              <div className="col-span-3 rounded-xl p-4 flex flex-col gap-3" style={{ background: 'rgba(5,46,22,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <div className="h-8 rounded" style={{ background: 'rgba(34,197,94,0.15)' }}></div>
                <div className="h-20 rounded mt-4" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}></div>
                <div className="h-8 rounded w-2/3" style={{ background: 'rgba(34,197,94,0.1)' }}></div>
                <div className="h-8 rounded w-5/6" style={{ background: 'rgba(34,197,94,0.1)' }}></div>
              </div>
              <div className="col-span-9 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 rounded-xl p-4" style={{ background: 'rgba(5,46,22,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}></div>
                  <div className="h-24 rounded-xl p-4" style={{ background: 'rgba(5,46,22,0.6)', border: '1px solid rgba(74,222,128,0.25)' }}></div>
                  <div className="h-24 rounded-xl p-4" style={{ background: 'rgba(5,46,22,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}></div>
                </div>
                <div className="flex-1 rounded-xl relative overflow-hidden" style={{ background: 'rgba(5,46,22,0.3)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative" style={{ zIndex: 10, background: 'rgba(5,20,10,0.5)', borderTop: '1px solid rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.08)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8" style={{ borderLeft: 'none' }}>
            {[
              { val: '25,000+', label: 'Active Volunteers', color: '#4ade80' },
              { val: '450+',    label: 'Partnered NGOs',   color: '#34d399' },
              { val: '1.2M',    label: 'Hours Dedicated',  color: '#86efac' },
              { val: '98%',     label: 'AI Match Accuracy', color: '#a3e635' }
            ].map((s, i) => (
              <div key={i} className="text-center px-4">
                <div className="text-3xl md:text-5xl font-black mb-2" style={{ color: s.color, textShadow: `0 0 20px ${s.color}55` }}>{s.val}</div>
                <div className="text-sm font-medium uppercase tracking-wider" style={{ color: '#6ee7b7' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6 max-w-7xl mx-auto" style={{ zIndex: 10 }}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight" style={{ color: '#e2fce9' }}>
            Unleashing the Power of{' '}
            <span style={{ background: 'linear-gradient(135deg, #86efac, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Intelligent Coordination
            </span>
          </h2>
          <p className="text-lg" style={{ color: '#6ee7b7' }}>
            A comprehensive suite built to streamline massive-scale volunteer networks, designed for efficiency, resilience, and maximum community impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative rounded-2xl p-6 transition-all duration-500 overflow-hidden cursor-default"
              style={{
                background: 'rgba(5,20,10,0.5)',
                border: '1px solid rgba(34,197,94,0.1)',
                backdropFilter: 'blur(20px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(5,46,22,0.6)';
                e.currentTarget.style.border = '1px solid rgba(34,197,94,0.4)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(34,197,94,0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(5,20,10,0.5)';
                e.currentTarget.style.border = '1px solid rgba(34,197,94,0.1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center text-2xl mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
                style={{
                  background: 'rgba(5,46,22,0.8)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  color: '#4ade80',
                  boxShadow: '0 4px 20px rgba(34,197,94,0.15)',
                }}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#e2fce9' }}>{f.title}</h3>
              <p className="leading-relaxed text-sm" style={{ color: '#6ee7b7' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 w-full" style={{ zIndex: 10 }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent, rgba(5,46,22,0.2))' }}></div>
        <div
          className="max-w-5xl mx-auto px-6 relative text-center rounded-3xl p-12 overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(5,20,10,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(34,197,94,0.2)',
            boxShadow: '0 0 60px rgba(34,197,94,0.08)',
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(to right, #16a34a, #22c55e, #4ade80, #86efac)' }}></div>
          <h2 className="text-4xl font-bold mb-6" style={{ color: '#e2fce9' }}>Ready to Transform Your Community?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#6ee7b7' }}>
            Join the automated, AI-driven revolution in disaster response and community assistance today.
            No more spreadsheets, no more delays.
          </p>
          <Link
            to="/signup"
            className="inline-flex px-10 py-4 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #16a34a, #059669)',
              color: '#fff',
              boxShadow: '0 0 30px rgba(22,163,74,0.4)',
            }}
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm relative" style={{ zIndex: 10, borderTop: '1px solid rgba(34,197,94,0.1)', color: '#4ade80', background: 'rgba(3,13,6,0.8)' }}>
        <p>Built with precision and purpose for Hackathon 2k26.</p>
        <div className="mt-2 flex justify-center gap-4 text-xs font-semibold tracking-widest uppercase">
          <span className="cursor-pointer transition-colors hover:text-green-300">Privacy</span>
          <span className="cursor-pointer transition-colors hover:text-green-300">Terms</span>
          <span className="cursor-pointer transition-colors hover:text-green-300">Contact</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
