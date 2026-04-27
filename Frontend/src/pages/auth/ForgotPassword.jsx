/**
 * Forgot Password Page
 * Secure password recovery gateway.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // Elite G-Tokens (Glassmorphism & Gradients)
  const G = {
    glass: 'rgba(255, 255, 255, 0.08)',
    blur: 'backdrop-filter: blur(24px) saturate(180%);',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    grad: 'linear-gradient(135deg, #0F2D5E 0%, #1A4B8F 100%)',
    shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
  };

  // Elite T-Tokens (Typography & Theme)
  const T = {
    navy: '#0F2D5E',
    gold: '#C9A84C',
    white: '#FFFFFF',
    muted: '#B0C4DE',
    accent: '#4FD1C5',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email required'); return; }
    setLoading(true); setError('');
    const res = await authService.forgotPassword(email.trim());
    setLoading(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.error || 'Request failed.');
    }
  };

  return (
    <div className="db-root" style={{
      minHeight: '100vh',
      background: T.navy,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Background Ambience */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(circle at 20% 30%, rgba(201, 168, 76, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 80% 70%, rgba(79, 209, 197, 0.1) 0%, transparent 40%)`,
        zIndex: 0
      }} />

      <div style={{
        width: '100%',
        maxWidth: '1000px',
        display: 'grid',
        gridTemplateColumns: 'minmax(400px, 1fr) 1fr',
        background: 'rgba(15, 45, 94, 0.6)',
        borderRadius: '32px',
        overflow: 'hidden',
        border: G.border,
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        zIndex: 1,
        backdropFilter: 'blur(10px)'
      }}>
        
        {/* Branding Panel */}
        <div style={{
          padding: '60px',
          background: G.grad,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: T.gold,
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginBottom: '32px',
              boxShadow: '0 8px 24px rgba(201, 168, 76, 0.3)'
            }}>🛡️</div>
            <h2 style={{ color: T.white, fontSize: '36px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
              Reset <br />Password
            </h2>
            <p style={{ color: T.muted, fontSize: '16px', lineHeight: 1.6, maxWidth: '280px' }}>
              Reset your password securely. Our system ensures multi-layer protection for your account.
            </p>
          </div>
          <div style={{
            position: 'absolute', bottom: -50, right: -50,
            width: '300px', height: '300px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)'
          }} />
        </div>

        {/* Access Module */}
        <div style={{
          padding: '60px',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {!submitted ? (
            <>
              <div style={{ marginBottom: '40px' }}>
                <h1 style={{ color: T.white, fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
                  Forgot Password?
                </h1>
                <p style={{ color: T.muted, fontSize: '15px' }}>
                  Enter your registered email to receive a secure password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label htmlFor="email" style={{
                    display: 'block', color: T.white, fontSize: '13px', fontWeight: 600,
                    marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px'
                  }}>
                    Email
                  </label>
                  <input
                    id="email" type="email"
                    placeholder="identifier@university.edu"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    style={{
                      width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.05)',
                      border: `1.5px solid ${error ? '#ff4d4d' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '14px', color: T.white, fontSize: '15px', outline: 'none',
                      transition: 'all 0.3s ease', boxSizing: 'border-box'
                    }}
                    autoFocus
                  />
                  {error && <div style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '8px', fontWeight: 500 }}>{error}</div>}
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '18px', background: T.gold, color: T.navy,
                  border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 15px rgba(201, 168, 76, 0.2)', marginBottom: '32px'
                }}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" style={{
                    color: T.gold, fontSize: '14px', textDecoration: 'none', fontWeight: 600,
                    transition: 'opacity 0.2s'
                  }}>
                    ← Back to Login
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px', height: '80px', background: 'rgba(79, 209, 197, 0.1)',
                borderRadius: '50%', border: '2px solid #4FD1C5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', margin: '0 auto 32px', color: '#4FD1C5'
              }}>✓</div>
              <h2 style={{ color: T.white, fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
                Email Sent
              </h2>
              <p style={{ color: T.muted, fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
                If an account matches <strong>{email}</strong>, a reset link has been sent to your inbox.
              </p>
              <Link to="/login" style={{
                display: 'block', padding: '16px', background: 'rgba(255,255,255,0.05)',
                color: T.white, borderRadius: '12px', textDecoration: 'none', fontWeight: 600,
                border: G.border
              }}>
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;