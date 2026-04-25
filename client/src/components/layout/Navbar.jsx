import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import {
  FiMenu, FiX, FiBell, FiLogOut, FiUser, FiHome, FiActivity,
  FiEdit2, FiTrash2, FiCheck, FiAlertTriangle, FiChevronDown
} from 'react-icons/fi';
import { updateProfile, deleteAccount } from '../../services/api';

/* ── Popup overlay styles (inline to avoid Tailwind purge issues) ── */
const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 200,
  display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
};
const backdropStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
  backdropFilter: 'blur(4px)',
};

/* ── Profile Popup Component ── */
const ProfilePopup = ({ user, onClose, onUpdateName, onDeleteAccount }) => {
  const [view, setView] = useState('menu'); // 'menu' | 'rename' | 'delete'
  const [newName, setNewName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const popupRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === user.name) return onClose();
    setLoading(true); setError('');
    try {
      const res = await updateProfile({ name: newName.trim() });
      onUpdateName(res.data.name || newName.trim());
      onClose();
    } catch {
      setError('Failed to update name. Try again.');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true); setError('');
    try {
      await deleteAccount();
      onDeleteAccount();
    } catch {
      setError('Failed to delete account. Try again.');
      setLoading(false);
    }
  };

  const roleColor = user?.role === 'admin'
    ? { bg: 'rgba(239,68,68,0.15)', text: '#fca5a5', border: 'rgba(239,68,68,0.3)' }
    : user?.role === 'ngo'
    ? { bg: 'rgba(34,197,94,0.15)', text: '#86efac', border: 'rgba(34,197,94,0.3)' }
    : { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.25)' };

  return (
    <div style={overlayStyle}>
      <div style={backdropStyle} onClick={onClose} />
      <div
        ref={popupRef}
        style={{
          position: 'relative', zIndex: 201,
          marginTop: '72px', marginRight: '24px',
          width: '300px',
          background: 'linear-gradient(145deg, #071a0e, #0a2212)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(34,197,94,0.08)',
          overflow: 'hidden',
          animation: 'popup-in 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: '3px', background: 'linear-gradient(to right, #16a34a, #22c55e, #4ade80)' }} />

        {/* === MENU VIEW === */}
        {view === 'menu' && (
          <div>
            {/* User info header */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px', height: '46px', borderRadius: '12px',
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#4ade80', fontSize: '20px',
                }}>
                  <FiUser />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#e2fce9', fontSize: '15px' }}>{user?.name}</div>
                  <div style={{ fontSize: '11px', color: '#6ee7b7', marginTop: '2px' }}>{user?.email}</div>
                </div>
              </div>
              <div style={{
                display: 'inline-flex', marginTop: '12px',
                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}`,
              }}>
                {user?.role}
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: '8px' }}>
              <button
                onClick={() => { setView('rename'); setNewName(user?.name || ''); setError(''); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px', border: 'none',
                  background: 'transparent', color: '#86efac', fontSize: '14px',
                  fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '16px', color: '#4ade80' }}><FiEdit2 /></span>
                Change Name
              </button>

              <div style={{ height: '1px', background: 'rgba(34,197,94,0.08)', margin: '4px 8px' }} />

              <button
                onClick={() => { setView('delete'); setError(''); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px', border: 'none',
                  background: 'transparent', color: '#fca5a5', fontSize: '14px',
                  fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '16px' }}><FiTrash2 /></span>
                Delete Account
              </button>
            </div>
          </div>
        )}

        {/* === RENAME VIEW === */}
        {view === 'rename' && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ color: '#4ade80', fontSize: '18px' }}><FiEdit2 /></span>
              <span style={{ color: '#e2fce9', fontWeight: 700, fontSize: '15px' }}>Change Name</span>
            </div>

            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              placeholder="Enter new name..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(5,46,22,0.5)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#e2fce9', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                marginBottom: error ? '8px' : '16px',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(74,222,128,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(34,197,94,0.3)'}
            />

            {error && (
              <div style={{ color: '#fca5a5', fontSize: '12px', marginBottom: '12px' }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRename} disabled={loading || !newName.trim()}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#16a34a,#059669)',
                  color: '#fff', fontWeight: 600, fontSize: '13px',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <FiCheck /> {loading ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setView('menu')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  background: 'rgba(5,46,22,0.4)', border: '1px solid rgba(34,197,94,0.15)',
                  color: '#86efac', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* === DELETE CONFIRM VIEW === */}
        {view === 'delete' && (
          <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
              <div style={{ color: '#e2fce9', fontWeight: 700, fontSize: '15px', marginBottom: '6px' }}>
                Delete Account?
              </div>
              <div style={{ color: '#6ee7b7', fontSize: '13px', lineHeight: '1.5' }}>
                This will permanently delete your account and all associated data. This action <strong style={{ color: '#fca5a5' }}>cannot be undone</strong>.
              </div>
            </div>

            {error && (
              <div style={{ color: '#fca5a5', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{error}</div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleDelete} disabled={loading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                  color: '#fff', fontWeight: 600, fontSize: '13px',
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <FiTrash2 /> {loading ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setView('menu')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px',
                  background: 'rgba(5,46,22,0.4)', border: '1px solid rgba(34,197,94,0.15)',
                  color: '#86efac', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keyframe for popup entry animation */}
      <style>{`
        @keyframes popup-in {
          from { opacity: 0; transform: scale(0.92) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ── Main Navbar ── */
const Navbar = () => {
  const { user, logout, setUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'ngo':   return '/ngo';
      default:      return '/volunteer';
    }
  };

  const handleUpdateName = (newName) => {
    setUser(prev => ({ ...prev, name: newName }));
  };

  const handleDeleteAccount = () => {
    logout();
    navigate('/login');
  };

  const roleColor =
    user?.role === 'admin' ? { bg: 'rgba(239,68,68,0.15)', text: '#fca5a5', border: 'rgba(239,68,68,0.25)' }
    : user?.role === 'ngo' ? { bg: 'rgba(34,197,94,0.15)', text: '#86efac', border: 'rgba(34,197,94,0.25)' }
    : { bg: 'rgba(34,197,94,0.12)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'py-3' : 'py-5'
        }`}
        style={scrolled ? {
          background: 'rgba(3,13,6,0.85)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(34,197,94,0.1)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
        } : { background: 'transparent' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group no-underline">
            <div
              className="relative flex items-center justify-center w-10 h-10 rounded-xl group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', boxShadow: '0 0 15px rgba(34,197,94,0.4)' }}
            >
              <FiActivity className="text-white text-xl animate-pulse" />
            </div>
            <span className="text-2xl font-black tracking-tight" style={{ color: '#e2fce9' }}>
              VolunteerAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
                  style={
                    location.pathname === getDashboardLink()
                      ? { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }
                      : { color: '#86efac' }
                  }
                >
                  <FiHome className="text-lg" /> Dashboard
                </Link>

                <Link to="/notifications" className="relative p-2 transition-colors" style={{ color: '#6ee7b7' }}>
                  <FiBell className="text-xl" />
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
                </Link>

                {/* ── Profile Block (clickable) ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', borderLeft: '1px solid rgba(34,197,94,0.15)' }}>
                  <button
                    id="profile-trigger"
                    onClick={() => setProfileOpen(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '7px 12px', borderRadius: '10px', border: 'none',
                      background: profileOpen ? 'rgba(34,197,94,0.15)' : 'rgba(5,46,22,0.6)',
                      borderWidth: '1px', borderStyle: 'solid',
                      borderColor: profileOpen ? 'rgba(74,222,128,0.4)' : 'rgba(34,197,94,0.2)',
                      color: '#e2fce9', cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: profileOpen ? '0 0 20px rgba(34,197,94,0.15)' : 'none',
                    }}
                  >
                    <FiUser style={{ color: '#4ade80', fontSize: '15px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', padding: '2px 8px', borderRadius: '20px',
                      background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}`,
                    }}>
                      {user.role}
                    </span>
                    <FiChevronDown style={{
                      color: '#4ade80', fontSize: '13px',
                      transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }} />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg transition-all"
                    style={{ color: '#6ee7b7' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6ee7b7'; e.currentTarget.style.background = 'transparent'; }}
                    title="Logout"
                  >
                    <FiLogOut className="text-xl" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: '#86efac' }} className="px-4 py-2 transition-colors hover:text-white">Sign In</Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', color: '#fff', boxShadow: '0 0 15px rgba(34,197,94,0.3)' }}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 transition-colors" style={{ color: '#86efac' }} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="md:hidden absolute top-full left-0 w-full p-6 flex flex-col gap-4 shadow-2xl animate-slide-up"
            style={{ background: 'rgba(3,13,6,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(34,197,94,0.1)' }}
          >
            {user ? (
              <>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-3 p-4 rounded-xl mb-2 text-left w-full"
                  style={{ background: 'rgba(5,46,22,0.5)', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                    <FiUser />
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: '#e2fce9' }}>{user.name}</div>
                    <div className="text-xs uppercase tracking-widest" style={{ color: '#4ade80' }}>{user.role} · Tap to manage</div>
                  </div>
                </button>
                <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg" style={{ color: '#86efac' }}>
                  <FiHome className="text-xl" /> Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 p-3 rounded-lg mt-2 text-left w-full"
                  style={{ color: '#fca5a5' }}
                >
                  <FiLogOut className="text-xl" /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full py-3 text-center rounded-xl font-bold" style={{ background: 'rgba(5,46,22,0.5)', color: '#e2fce9', border: '1px solid rgba(34,197,94,0.2)' }}>Sign In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="w-full py-3 text-center rounded-xl font-bold" style={{ background: 'linear-gradient(135deg,#16a34a,#059669)', color: '#fff' }}>Join Now</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Profile Popup — rendered at root level so not clipped by nav */}
      {profileOpen && user && (
        <ProfilePopup
          user={user}
          onClose={() => setProfileOpen(false)}
          onUpdateName={handleUpdateName}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </>
  );
};

export default Navbar;
