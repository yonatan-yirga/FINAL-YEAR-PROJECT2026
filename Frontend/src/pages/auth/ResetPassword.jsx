/**
 * Reset Password Page
 * Update your account password.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';

const ResetPassword = () => {
  const { token }                   = useParams();
  const navigate                    = useNavigate();
  const [tokenValid, setTokenValid] = useState(null); // null=checking, true, false
  const [tokenError, setTokenError] = useState('');
  const [form, setForm]             = useState({ new_password: '', confirm_password: '' });
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [done, setDone]             = useState(false);

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

  /* Validate token on mount */
  useEffect(() => {
    if (!token) { setTokenValid(false); setTokenError('Invalid reset link.'); return; }
    authService.validateResetToken(token).then(res => {
      if (res.success && res.data.valid) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setTokenError(res.data?.error || 'This reset link is invalid or has expired.');
      }
    });
  }, [token]);

  const validate = () => {
    const e = {};
    if (!form.new_password)          e.new_password = 'Password required.';
    else if (form.new_password.length < 8) e.new_password = 'Password requires 8+ characters.';
    if (!form.confirm_password)      e.confirm_password = 'Password confirmation required.';
    else if (form.new_password !== form.confirm_password) e.confirm_password = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setErrors({});
    const res = await authService.resetPassword(token, form.new_password, form.confirm_password);
    setLoading(false);
    if (res.success) {
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setErrors({ general: res.error || 'Something went wrong. Please try again.' });
    }
  };

  const renderContent = () => {
    /* ── Checking token ── */
    if (tokenValid === null) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="si-spinner" style={{ margin: '0 auto 24px', borderTopColor: T.gold }} />
          <p style={{ color: T.muted, fontSize: '15px' }}>Verifying reset link...</p>
        </div>
      );
    }

    /* ── Invalid token ── */
    if (!tokenValid) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '50%', border: '2px solid #EF4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', margin: '0 auto 32px', color: '#EF4444'
          }}>✕</div>
          <h2 style={{ color: T.white, fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Invalid Link
          </h2>
          <p style={{ color: T.muted, fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
            {tokenError}
          </p>
          <Link to="/forgot-password" style={{
            display: 'block', padding: '16px', background: T.gold,
            color: T.navy, borderRadius: '12px', textDecoration: 'none', fontWeight: 700,
            marginBottom: '16px'
          }}>
            Request New Link
          </Link>
          <Link to="/login" style={{ color: T.gold, fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>
            Back to Login
          </Link>
        </div>
      );
    }

    /* ── Success ── */
    if (done) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', background: 'rgba(79, 209, 197, 0.1)',
            borderRadius: '50%', border: '2px solid #10B981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', margin: '0 auto 32px', color: '#10B981'
          }}>✓</div>
          <h2 style={{ color: T.white, fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            Password Updated
          </h2>
          <p style={{ color: T.muted, fontSize: '15px', lineHeight: 1.7 }}>
            Your password has been successfully updated.<br />
            Redirecting to login page...
          </p>
        </div>
      );
    }

    /* ── Reset form ── */
    return (
      <>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ color: T.white, fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
            Create New Password
          </h1>
          <p style={{ color: T.muted, fontSize: '15px' }}>
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div style={{
              padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444', borderRadius: '10px',
              color: '#ef4444', fontSize: '14px', marginBottom: '24px'
            }}>{errors.general}</div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', color: T.white, fontSize: '13px', fontWeight: 600,
              marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px'
            }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.new_password}
              onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
              style={{
                width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${errors.new_password ? '#ff4d4d' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '14px', color: T.white, fontSize: '15px', outline: 'none',
                transition: 'all 0.3s ease', boxSizing: 'border-box'
              }}
              autoFocus
            />
            {errors.new_password && <div style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '8px' }}>{errors.new_password}</div>}
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block', color: T.white, fontSize: '13px', fontWeight: 600,
              marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px'
            }}>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirm_password}
              onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
              style={{
                width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${errors.confirm_password ? '#ff4d4d' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '14px', color: T.white, fontSize: '15px', outline: 'none',
                transition: 'all 0.3s ease', boxSizing: 'border-box'
              }}
            />
            {errors.confirm_password && <div style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '8px' }}>{errors.confirm_password}</div>}
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '18px', background: T.gold, color: T.navy,
            border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 15px rgba(201, 168, 76, 0.2)', marginBottom: '32px'
          }}>
            {loading ? 'Processing...' : 'Update Password'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: T.gold, fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>
              Cancel
            </Link>
          </div>
        </form>
      </>
    );
  };

  return (
    <div className="db-root" style={{
      minHeight: '100vh', background: T.navy, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
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
        width: '100%', maxWidth: '1000px', display: 'grid',
        gridTemplateColumns: 'minmax(400px, 1fr) 1fr', background: 'rgba(15, 45, 94, 0.6)',
        borderRadius: '32px', overflow: 'hidden', border: G.border,
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)', zIndex: 1, backdropFilter: 'blur(10px)'
      }}>
        
        {/* Branding Panel */}
        <div style={{
          padding: '60px', background: G.grad, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              width: '64px', height: '64px', background: T.gold, borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', marginBottom: '32px', boxShadow: '0 8px 24px rgba(201, 168, 76, 0.3)'
            }}>🔒</div>
            <h2 style={{ color: T.white, fontSize: '36px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
              Reset <br />Password
            </h2>
            <p style={{ color: T.muted, fontSize: '16px', lineHeight: 1.6, maxWidth: '280px' }}>
              Password reset in progress. Please complete the form to access your account.
            </p>
          </div>
          <div style={{
            position: 'absolute', bottom: -50, right: -50, width: '300px', height: '300px',
            background: 'rgba(255,255,255,0.03)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)'
          }} />
        </div>

        {/* Access Module */}
        <div style={{
          padding: '60px', background: 'rgba(255,255,255,0.02)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center'
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;