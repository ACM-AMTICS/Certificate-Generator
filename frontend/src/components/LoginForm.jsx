import React, { useState } from 'react';
import { login } from '../lib/auth';
import { Mail, Lock, ShieldCheck, AlertCircle, LogIn } from 'lucide-react';

export default function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (onLoginSuccess) onLoginSuccess(result.user);
    } else {
      setError(result.error || 'Authentication failed.');
    }
  };

  return (
    <div className="center-content">
      <div className="loading-card glass-card" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div className="acm-badge" style={{ marginBottom: '12px' }}>
            <ShieldCheck size={16} />
            <span>Authorized ACM Officers Only</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800 }}>
            Dashboard Login
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Access restricted to authorized Webmaster & Secretary portal managers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="certificate-form" style={{ width: '100%' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="e.g. name@domain.com"
                value={email}
                onChange={(e) => {
                  setError('');
                  setEmail(e.target.value);
                }}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setError('');
                  setPassword(e.target.value);
                }}
                required
              />
            </div>
          </div>

          {error && (
            <div className="form-error-banner" role="alert">
              <AlertCircle size={18} className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting || !email.trim() || !password.trim()}
          >
            <LogIn size={18} />
            <span>{submitting ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
