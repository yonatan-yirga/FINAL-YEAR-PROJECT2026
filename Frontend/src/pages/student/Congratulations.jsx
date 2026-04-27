/**
 * Congratulations
 * Terminal page shown to students who have been marked completed.
 * Replaces the student dashboard — guard in AppRoutes redirects here.
 * Two-way guard: students WITHOUT a certificate are bounced back to dashboard.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import certificateService from '../../services/certificateService';
import { Trophy, Sparkles, Link2, Settings } from 'lucide-react';

const Congratulations = () => {
  const navigate  = useNavigate();
  const [cert,        setCert]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    certificateService.getMyCertificate().then(res => {
      if (res.success && res.data) {
        setCert(res.data);
      } else {
        // No certificate → bounce back to dashboard
        navigate('/student/dashboard', { replace: true });
      }
    }).catch(() => {
      navigate('/student/dashboard', { replace: true });
    }).finally(() => setLoading(false));
  }, [navigate]);

  const handleDownload = async () => {
    if (!cert) return;
    setDownloading(true);
    await certificateService.downloadCertificate(cert.id);
    setDownloading(false);
  };

  const S = {
    root: {
      minHeight: '100vh',
      backgroundColor: '#060B18',
      color: '#cbd5e1',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: '80px',
    },
    hero: {
      background: 'radial-gradient(circle at top right, rgba(245, 158, 11, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 40%)',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '32px',
      padding: '80px 40px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '40px',
      boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
    },
    card: {
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      padding: '32px',
      marginBottom: '32px',
    },
    label: {
      fontSize: '10px',
      fontWeight: '900',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '6px',
    },
    value: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#fff',
    }
  };

  if (loading) return (
    <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '16px', animation: 'pulse 2s infinite', display: 'flex', justifyContent: 'center' }}>
          <Sparkles size={48} color="#f59e0b" />
        </div>
        <div style={{ color: '#64748b', fontWeight: '700' }}>ASSEMBLING SUCCESS DATA...</div>
      </div>
    </div>
  );

  const fmt = (d, opts) => d ? new Date(d).toLocaleDateString('en-US', opts) : '—';
  const monthYear = { month: 'long', year: 'numeric' };
  const fullDate  = { day: 'numeric', month: 'long', year: 'numeric' };

  return (
    <div style={S.root}>
      <Header
        title="Mission Accomplished"
        subtitle="Your internship journey has reached its successful conclusion."
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Elite Hero Section */}
        <div style={S.hero}>
          {/* Decorative Elements */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }}></div>
          
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <Trophy size={72} color="#f59e0b" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: '900', color: '#fff', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Outstanding Achievement, {cert.student_name?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            You have officially completed your professional rotation at <span style={{ color: '#f59e0b', fontWeight: '800' }}>{cert.company_name}</span>. 
            The linkage committee of DMU recognizes your performance and has issued the following credentials.
          </p>

          {cert.is_generated ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="elite-button-primary"
              style={{
                padding: '18px 48px',
                backgroundColor: '#f59e0b',
                color: '#060B18',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: downloading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 30px rgba(245, 158, 11, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {downloading ? 'Decrypting PDF...' : 'Download Official Certificate'}
            </button>
          ) : (
            <div style={{ padding: '16px 32px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
              <Settings size={16} className="spin-animation" />
              ENCRYPTING CERTIFICATE ASSETS...
            </div>
          )}
        </div>

        {/* Credentials Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
          <div>
            <div style={S.card}>
              <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div> Verification Metadata
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div>
                  <div style={S.label}>Credential ID</div>
                  <div style={S.value}>{cert.certificate_id}</div>
                </div>
                <div>
                  <div style={S.label}>Performance Grade</div>
                  <div style={{ ...S.value, color: '#10b981' }}>Grade {cert.performance_grade || 'A'}</div>
                </div>
                <div>
                  <div style={S.label}>Issuance Node</div>
                  <div style={S.value}>{cert.department_name}</div>
                </div>
                <div>
                  <div style={S.label}>Verification Code</div>
                  <div style={{ ...S.value, fontFamily: 'monospace', letterSpacing: '2px', color: '#f59e0b' }}>{cert.verification_code}</div>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#64748b', marginBottom: '16px', textTransform: 'uppercase' }}>Internship Record</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Duration Period</span>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: '700' }}>{fmt(cert.start_date, monthYear)} — {fmt(cert.end_date, monthYear)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Academic Advisor</span>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: '700' }}>{cert.advisor_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Corporate Node</span>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: '700' }}>{cert.company_name}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ ...S.card, textAlign: 'center', backgroundColor: '#f59e0b', backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)', color: '#060B18' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                <Link2 size={32} strokeWidth={2} />
              </div>
              <h4 style={{ fontWeight: '900', marginBottom: '8px' }}>Global Verification</h4>
              <p style={{ fontSize: '12px', fontWeight: '700', marginBottom: '24px', opacity: 0.8 }}>Share your verification node with potential employers.</p>
              <button 
                onClick={() => window.open(`/verify-certificate/${cert.verification_code}`, '_blank')}
                style={{ width: '100%', padding: '12px', backgroundColor: '#060B18', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Launch Validator
              </button>
            </div>
            
            <p style={{ fontSize: '11px', color: '#475569', textAlign: 'center', lineHeight: '1.6' }}>
              DMU System Linkage v4.0 — All certificates are cryptographically signed and stored in the system registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Congratulations;