/**
 * Security Command Center (ChangePassword)
 * High-performance password management for all stakeholders.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import Header from '../../components/common/Header';
import { G, T } from '../Dashboards';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.old_password)    e.old_password    = 'Current password is required.';
    if (!form.new_password)    e.new_password    = 'New password is required.';
    else if (form.new_password.length < 8) e.new_password = 'Must be at least 8 characters.';
    if (!form.confirm_password) e.confirm_password = 'Please confirm your new password.';
    else if (form.new_password !== form.confirm_password) e.confirm_password = 'Passwords do not match.';
    if (form.old_password && form.new_password && form.old_password === form.new_password)
      e.new_password = 'New password must be different from current.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setErrors({});
    
    try {
      const res = await authService.changePassword(form.old_password, form.new_password, form.confirm_password);
      if (res.success) {
        if (res.data?.token) localStorage.setItem('authToken', res.data.token);
        setSuccess(true);
      } else {
        setErrors({ general: res.error || 'Identity verification failed.' });
      }
    } catch (err) {
      setErrors({ general: 'Internal security protocol error.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="db-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{G}</style>
        <div className="db-card" style={{ maxWidth: 420, width: '100%', padding: '48px 40px', textAlign: 'center', animation: 'cardEnter 0.5s ease-out' }}>
          <div style={{ 
            width: 72, height: 72, borderRadius: '50%', background: 'var(--status-success)', 
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 32, margin: '0 auto 24px', boxShadow: '0 8px 16px rgba(21,128,61,0.2)' 
          }}>✓</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-bright)', marginBottom: 12 }}>Security Updated</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 32 }}>Your credentials have been encrypted and updated successfully.</p>
          <button onClick={() => navigate(-1)} className="db-nav" style={{ textAlign: 'center', background: 'var(--accent-navy)', color: '#fff', border: 'none', fontWeight: 700 }}>Return to Terminal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="db-root">
      <style>{G}</style>
      <Header title="Security & Access" subtitle="Credential Management Profile" />
      
      <div className="db-body" style={{ gridTemplateColumns: 'minmax(0,1fr)', maxWidth: 600, padding: '40px 24px' }}>
        <div style={{ animation: 'cardEnter 0.6s ease-out' }}>
          
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--accent-navy)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
             ← Exit to Dashboard
          </button>

          <div className="db-card" style={{ padding: '40px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-bright)', marginBottom: 8 }}>Change Password</h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>Enter your current credentials and provide a new secure password.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {errors.general && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--status-error)', borderRadius: 12, padding: '14px 18px', color: 'var(--status-error)', fontSize: 13, fontWeight: 600 }}>
                  {errors.general}
                </div>
              )}

              {[
                { id: 'old_password', label: 'Current Password', placeholder: '••••••••' },
                { id: 'new_password', label: 'New Password', placeholder: 'Min. 8 characters' },
                { id: 'confirm_password', label: 'Verify Password', placeholder: 'Repeat new password' },
              ].map(({ id, label, placeholder }) => (
                <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</label>
                  <input
                    type="password"
                    placeholder={placeholder}
                    value={form[id]}
                    onChange={e => { setForm(f => ({ ...f, [id]: e.target.value })); setErrors(ev => ({ ...ev, [id]: '' })); }}
                    style={{
                      width: '100%', padding: '14px 16px', fontSize: 14, borderRadius: 12, outline: 'none',
                      background: 'var(--bg-root)', border: `1.5px solid ${errors[id] ? 'var(--status-error)' : 'var(--border-subtle)'}`,
                      color: 'var(--text-bright)', transition: 'var(--transition)'
                    }}
                  />
                  {errors[id] && <div style={{ fontSize: 12, color: 'var(--status-error)', fontWeight: 600 }}>{errors[id]}</div>}
                </div>
              ))}

              <button
                type="submit"
                className="db-nav"
                disabled={loading}
                style={{
                  marginTop: 12, padding: '16px', background: 'var(--accent-navy)', color: '#fff',
                  border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10,
                }}>
                {loading ? <div className="db-skel" style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff' }} /> : 'Commit Security Update'}
              </button>
            </form>
          </div>

          <div style={{ marginTop: 32, padding: '20px', borderRadius: 18, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', gap: 16 }}>
             <div style={{ fontSize: 20 }}>💡</div>
             <div style={{ fontSize: 13, color: 'rgba(15, 45, 94, 0.7)', lineHeight: 1.6 }}>
               <strong>Security Best Practice:</strong> Use a combination of uppercase, lowercase, numbers, and symbols to ensure your account remains protected against unauthorized access.
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;