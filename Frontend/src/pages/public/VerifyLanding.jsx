/**
 * Verify Certificate Landing
 * Page for checking university certificates.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Award, Key } from 'lucide-react';

const VerifyLanding = () => {
  const navigate = useNavigate();
  const [code, setCode]     = useState('');
  const [error, setError]   = useState('');

  // Elite G-Tokens (Glassmorphism & Gradients)
  const G = {
    glass: 'rgba(255, 255, 255, 0.03)',
    blur: 'backdrop-filter: blur(20px) saturate(180%);',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    grad: 'linear-gradient(135deg, #0F2D5E 0%, #1A4B8F 100%)',
  };

  // Elite T-Tokens (Typography & Theme)
  const T = {
    navy: '#0F2D5E',
    gold: '#C9A84C',
    white: '#FFFFFF',
    muted: '#B0C4DE',
    accent: '#4FD1C5',
  };

  const handleVerify = () => {
    const q = code.trim();
    if (!q) { setError('Please enter a certificate ID or verification code.'); return; }
    navigate(`/verify-certificate/${encodeURIComponent(q)}`);
  };

  return (
    <div className="db-root" style={{
      minHeight: '100vh',
      background: T.navy,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Ambience */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(circle at 10% 10%, rgba(201, 168, 76, 0.1) 0%, transparent 40%),
                    radial-gradient(circle at 90% 90%, rgba(79, 209, 197, 0.08) 0%, transparent 40%)`,
        zIndex: 0
      }} />

      {/* Modern Transparent Nav */}
      <nav style={{
        padding: '24px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
        background: 'rgba(15, 45, 94, 0.4)',
        backdropFilter: 'blur(10px)',
        borderBottom: G.border
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px', height: '40px', background: T.gold, borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <GraduationCap size={24} color={T.navy} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ color: T.white, fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px' }}>
              DMU LINKAGE
            </div>
            <div style={{ color: T.muted, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
              Verify
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/login')}
          style={{
            background: 'transparent', color: T.gold, border: `1.5px solid ${T.gold}`,
            padding: '10px 24px', borderRadius: '12px', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.3s'
          }}>
          Sign In
        </button>
      </nav>

      {/* Main Hub Content */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '60px 24px', position: 'relative', zIndex: 1
      }}>
        <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
          
          {/* Header Section */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{
              width: '80px', height: '80px', background: 'rgba(201, 168, 76, 0.1)',
              borderRadius: '50%', border: `2px solid ${T.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
              boxShadow: '0 0 40px rgba(201, 168, 76, 0.15)'
            }}>
              <Award size={40} color={T.gold} strokeWidth={2} />
            </div>
            <h1 style={{
              color: T.white, fontSize: '42px', fontWeight: 800, marginBottom: '20px',
              letterSpacing: '-1px', lineHeight: 1.1
            }}>
              Verify Certificate
            </h1>
            <p style={{ color: T.muted, fontSize: '17px', lineHeight: 1.7 }}>
              Validate the authenticity of official DMU Internship Certificates. 
              Our verification system ensures institutional validity.
            </p>
          </div>

          {/* Verification Console */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '24px',
            padding: '40px',
            border: G.border,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ textAlign: 'left', marginBottom: '12px' }}>
              <label style={{
                color: T.white, fontSize: '12px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1px', marginLeft: '4px'
              }}>
                Certificate ID
              </label>
            </div>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <input
                value={code}
                onChange={e => { setCode(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
                placeholder="e.g. CERT-2024-DMU-..."
                autoFocus
                style={{
                  width: '100%', padding: '20px 24px', background: 'rgba(0,0,0,0.2)',
                  border: `1.5px solid ${error ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '16px', color: T.white, fontSize: '16px', outline: 'none',
                  transition: 'all 0.3s', boxSizing: 'border-box'
                }}
              />
              <div style={{
                position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.2)'
              }}>
                <Key size={20} />
              </div>
            </div>
            
            {error && <div style={{ color: '#EF4444', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>{error}</div>}

            <button
              onClick={handleVerify}
              style={{
                width: '100%', padding: '20px', background: T.gold, color: T.navy,
                border: 'none', borderRadius: '16px', fontSize: '17px', fontWeight: 800,
                cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 30px rgba(201, 168, 76, 0.3)',
                textTransform: 'uppercase', letterSpacing: '1px'
              }}>
              Verify Now
            </button>
          </div>

          {/* Support Info */}
          <footer style={{ marginTop: '40px' }}>
            <p style={{ color: T.muted, fontSize: '13px', lineHeight: 1.6 }}>
              The ID is printed on the header of your certificate.<br />
              DMU Registry & Linkage Office &nbsp;•&nbsp; Institutional Validity Verified
            </p>
          </footer>
        </div>
      </main>

      {/* Global Footer */}
      <footer style={{
        padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)',
        fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.1)'
      }}>
        DEBRE MARKOS UNIVERSITY — UNIVERSITY INDUSTRY LINKAGE OFFICE — © 2026
      </footer>
    </div>
  );
};

export default VerifyLanding;