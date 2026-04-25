import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import AnimatedBG from './components/AnimatedBG';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VolunteerDashboard from './pages/VolunteerDashboard';
import NGODashboard from './pages/NGODashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', color: '#4ade80', position: 'relative', zIndex: 10,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>⚡</div>
          <p style={{ color: '#6ee7b7', fontWeight: 600, letterSpacing: '0.1em' }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/volunteer'} />;
  }

  return children;
};

function AppContent() {
  return (
    /* Root: transparent so the fixed canvas shows through everywhere */
    <div style={{ minHeight: '100vh', background: 'transparent', position: 'relative' }}>
      {/* Global animated canvas — fixed, z=0, behind everything */}
      <AnimatedBG />

      {/* Navbar sits on z=50 */}
      <Navbar />

      {/* Pages — each must have transparent/semi-transparent backgrounds */}
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/signup"   element={<Signup />} />
        <Route path="/volunteer" element={
          <ProtectedRoute roles={['volunteer']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/ngo" element={
          <ProtectedRoute roles={['ngo']}>
            <NGODashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <ChatbotWidget />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
