import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClaimCertificate from './pages/ClaimCertificate';
import LoginForm from './components/LoginForm';
import { getAuthUser, logout } from './lib/auth';
import { LogOut, UserCheck } from 'lucide-react';
import './index.css';

function ProtectedDashboardRoute({ user, onLoginSuccess }) {
  if (!user) {
    return <LoginForm onLoginSuccess={onLoginSuccess} />;
  }
  return <Dashboard />;
}

export default function App() {
  const [authUser, setAuthUser] = useState(() => getAuthUser());

  const handleLogout = () => {
    logout();
    setAuthUser(null);
  };

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
  };

  return (
    <BrowserRouter>
      <div className="app-shell">
        {/* Top Navbar */}
        <nav className="top-navbar">
          <div className="navbar-container">
            <Link to="/dashboard" className="brand-logo">
              <img src="/acm_amtics_logo.png" alt="ACM Logo" className="logo-img" />
              <div className="brand-text">
                <span className="brand-title">Certificate Generator</span>
                <span className="brand-subtitle">Official ACM Portal</span>
              </div>
            </Link>

            {authUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <UserCheck size={14} />
                  <span>{authUser.role} ({authUser.name})</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  title="Sign out of Dashboard"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="app-body">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedDashboardRoute
                  user={authUser}
                  onLoginSuccess={handleLoginSuccess}
                />
              }
            />
            <Route
              path="/dashboard/:eventId"
              element={
                <ProtectedDashboardRoute
                  user={authUser}
                  onLoginSuccess={handleLoginSuccess}
                />
              }
            />
            <Route path="/claim/:eventId" element={<ClaimCertificate />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} ACM Student Chapter. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
