/**
 * Certificate Verification Result
 * Page for viewing verified certificate details.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import certificateService from '../../services/certificateService';

const VerifyCertificate = () => {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const [input, setInput]   = useState(urlCode || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Elite G-Tokens
  const G = {
    glass: 'rgba(255, 255, 255, 0.03)',
    blur: 'backdrop-filter: blur(24px) saturate(180%);',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    grad: 'linear-gradient(135deg, #0F2D5E 0%, #1A4B8F 100%)',
  };

  // Elite T-Tokens
  const T = {
    navy: '#0F2D5E',
    gold: '#C9A84C',
    white: '#FFFFFF',
    muted: '#B0C4DE',
    green: '#10B981',
    red: '#EF4444',
  };

  // Auto-search if code came from URL
  useEffect(() => {
    if (urlCode && urlCode.trim()) {
      handleVerify(urlCode.trim());
    }
  }, []);

  const handleVerify = async (code) => {
    const q = (code || input).trim();
    if (!q) return;
    setLoading(true); setResult(null); setSearched(true);
    const res = await certificateService.verifyCertificate(q);
    setResult(res);
    setLoading(false);
  };

  const renderResult = () => {
    if (!searched) return null;
    if (loading) return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="si-spinner" style={{ margin: '0 auto 24px', borderTopColor: T.gold }} />
        <p style={{ color: T.muted, fontSize: '15px' }}>Verifying...</p>
      </div>
    );

    if (result?.success) {
      const cert = result.data?.certificate || result.data;
      return (
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: '24px', overflow: 'hidden',
          border: `2px solid ${T.green}`, animation: 'fadeInUp 0.5s ease-out'
        }}>
          {/* Elite Verified Header */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)', padding: '32px',
            display: 'flex', alignItems: 'center', gap: '20px',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{
              width: '64px', height: '64px', background: T.green, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', color: T.white, flexShrink: 0,
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
            }}>✓</div>
            <div>
              <h2 style={{ color: T.green, fontSize: '24px', fontWeight: 800, margin: 0 }}>
                Certificate Verified
              </h2>
              <p style={{ color: T.muted, fontSize: '14px', margin: '4px 0 0' }}>
                Official DMU record checked at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Credentials Display */}
          <div style={{ padding: '40px' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              {[
                { label: 'Student Name', value: cert.student_name },
                { label: 'University ID', value: cert.student_university_id },
                { label: 'Certificate ID', value: cert.certificate_id },
                { label: 'Issue Date', value: cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                { label: 'Company', value: cert.company_name },
                { label: 'Internship Title', value: cert.internship_title },
                { label: 'Department', value: cert.department_name },
                { label: 'Advisor', value: cert.advisor_name },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px'
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 700, color: T.gold,
                    textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px'
                  }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: T.white }}>
                    {value || 'DATA_NOT_FOUND'}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              marginTop: '40px', padding: '20px', background: 'rgba(201, 168, 76, 0.05)',
              borderRadius: '16px', border: `1px dashed ${T.gold}`, textAlign: 'center'
            }}>
              <p style={{ color: T.gold, fontSize: '13px', fontWeight: 600, margin: 0 }}>
                Verification System — Secure Registry
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (searched && !result?.success) {
      return (
        <div style={{
          background: 'rgba(239, 68, 68, 0.05)', borderRadius: '24px',
          padding: '48px', border: `1.5px solid ${T.red}`, textAlign: 'center',
          animation: 'fadeInUp 0.4s ease-out'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
          <h2 style={{ color: T.red, fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>
            Verification Failed
          </h2>
          <p style={{ color: T.muted, fontSize: '15px', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto' }}>
            The provided ID does not match any record in our registry. 
            Please check the ID and try again.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="db-root" style={{
      minHeight: '100vh', background: T.navy, display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif", position: 'relative', overflow: 'hidden'
    }}>
      {/* Background Ambience */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: `radial-gradient(circle at 10% 10%, rgba(201, 168, 76, 0.1) 0%, transparent 40%),
                    radial-gradient(circle at 90% 90%, rgba(79, 209, 197, 0.08) 0%, transparent 40%)`,
        zIndex: 0
      }} />

      {/* Header */}
      <nav style={{
        padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', zIndex: 2, background: 'rgba(15, 45, 94, 0.4)',
        backdropFilter: 'blur(10px)', borderBottom: G.border
      }}>
        <div onClick={() => navigate('/verify')} style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
          <div style={{
            width: '40px', height: '40px', background: T.gold, borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>🎓</div>
          <div>
            <div style={{ color: T.white, fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px' }}>
              DMU TRUST
            </div>
            <div style={{ color: T.muted, fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>
              Registry
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/verify')} style={{
          background: 'transparent', color: T.gold, fontSize: '14px', fontWeight: 700,
          border: 'none', cursor: 'pointer'
        }}>← New Verification</button>
      </nav>

      {/* Console Area */}
      <main style={{
        flex: 1, padding: '60px 24px', zIndex: 1, maxWidth: '900px', width: '100%', margin: '0 auto'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="Search Certificate ID..."
              style={{
                flex: 1, padding: '18px 24px', background: 'rgba(255,255,255,0.03)',
                border: G.border, borderRadius: '16px', color: T.white, fontSize: '16px',
                outline: 'none', transition: '0.3s'
              }}
            />
            <button onClick={() => handleVerify()} disabled={loading} style={{
              padding: '0 32px', background: T.gold, color: T.navy, border: 'none',
              borderRadius: '16px', fontWeight: 800, cursor: 'pointer'
            }}>
              Verify
            </button>
          </div>
        </div>

        {renderResult()}
      </main>

      <footer style={{
        padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)',
        fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)', zIndex: 1
      }}>
        DMU UNIVERSITY INDUSTRY LINKAGE OFFICE — OFFICIAL VERIFICATION PORTAL — 2026
      </footer>
    </div>
  );
};

export default VerifyCertificate;