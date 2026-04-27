/**
 * SystemOverview
 * UIL: system-wide statistics dashboard.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import uilService from '../../services/uilService';

const ROLE_COLORS = {
  STUDENT:         { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  COMPANY:         { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
  ADVISOR:         { bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B' },
  DEPARTMENT_HEAD: { bg: '#F5F3FF', color: '#6D28D9', dot: '#8B5CF6' },
};

/* ─── Metric Card ─────────────────────────────────────────────────────── */
const Metric = ({ label, value, sub, accent }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '18px 20px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'box-shadow 0.15s ease',
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
  >
    {accent && (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: accent, borderRadius: '12px 12px 0 0',
      }} />
    )}
    <div style={{
      fontSize: 11, fontWeight: 600,
      color: '#9CA3AF',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 8,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: 28, fontWeight: 700,
      color: '#111827', lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {value ?? '—'}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6, fontWeight: 500 }}>
        {sub}
      </div>
    )}
  </div>
);

/* ─── Section Label ───────────────────────────────────────────────────── */
const SectionLabel = ({ children, top = 28 }) => (
  <div style={{
    fontSize: 11, fontWeight: 700,
    color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: '0.09em',
    marginTop: top, marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 8,
  }}>
    <span style={{
      display: 'inline-block', width: 16, height: 1.5,
      background: '#D1D5DB', borderRadius: 2,
    }} />
    {children}
  </div>
);

/* ─── Divider ─────────────────────────────────────────────────────────── */
const Divider = ({ top = 28 }) => (
  <div style={{
    height: 1, background: '#F3F4F6',
    marginTop: top, marginBottom: 0,
  }} />
);

const grid2 = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 };
const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10 };

/* ─── Quick Action Button ─────────────────────────────────────────────── */
const QuickAction = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: '11px 16px',
      background: '#fff',
      border: '1px solid #E5E7EB',
      borderRadius: 10,
      color: '#374151',
      fontSize: 13, fontWeight: 500,
      cursor: 'pointer', textAlign: 'left',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.15s ease',
      width: '100%',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = '#6366F1';
      e.currentTarget.style.color = '#6366F1';
      e.currentTarget.style.background = '#F5F3FF';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#E5E7EB';
      e.currentTarget.style.color = '#374151';
      e.currentTarget.style.background = '#fff';
    }}
  >
    <span>{children}</span>
    <span style={{ opacity: 0.5, fontSize: 14 }}>↗</span>
  </button>
);

/* ─── Main Component ──────────────────────────────────────────────────── */
const SystemOverview = () => {
  const navigate  = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    uilService.getSystemStats()
      .then(res => {
        if (res.success) setStats(res.data);
        else setError(res.error || 'Failed to load system statistics.');
      })
      .catch(() => setError('Failed to load system statistics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      <Header title="System overview" subtitle="System-wide statistics and activity" />
      <div style={{
        padding: '80px', textAlign: 'center',
        color: '#9CA3AF', fontSize: 14, fontWeight: 500,
      }}>
        <div style={{
          display: 'inline-flex', gap: 6, alignItems: 'center',
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#6366F1',
            animation: 'pulse 1.2s ease-in-out infinite',
          }} />
          Loading statistics…
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'inherit' }}>
      <Header title="System overview" subtitle="System-wide statistics and activity" />

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 24px' }}>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 10,
            padding: '12px 16px',
            color: '#DC2626',
            fontSize: 13, fontWeight: 500,
            marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        {stats && <>

          {/* ── Top KPIs ── */}
          <div style={grid4}>
            <Metric
              label="Total users"
              value={stats.users?.total}
              sub={`+${stats.new_users_this_month ?? 0} this month`}
              accent="linear-gradient(90deg, #6366F1, #8B5CF6)"
            />
            <Metric
              label="Active internships"
              value={stats.active_internships}
              sub="Students currently placed"
              accent="#22C55E"
            />
            <Metric
              label="Open positions"
              value={stats.internships?.open}
              sub="Accepting applications"
              accent="#F59E0B"
            />
            <Metric
              label="Pending registrations"
              value={stats.pending_registrations}
              sub="Awaiting UIL approval"
              accent="#EF4444"
            />
          </div>

          {/* ── Users by role ── */}
          <SectionLabel>Users by role</SectionLabel>
          <div style={grid4}>
            <Metric label="Students"   value={stats.users?.students} />
            <Metric label="Companies"  value={stats.users?.companies} />
            <Metric label="Advisors"   value={stats.users?.advisors} />
            <Metric label="Dept heads" value={stats.users?.department_heads} />
          </div>

          <Divider top={28} />

          {/* ── Two-column middle section ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
            gap: 32, marginTop: 28, alignItems: 'start',
          }}>

            {/* Left column */}
            <div>
              <SectionLabel top={0}>Internships</SectionLabel>
              <div style={grid2}>
                <Metric label="Total posted" value={stats.internships?.total} />
                <Metric label="Filled"       value={stats.internships?.filled} />
                <Metric label="Closed"       value={stats.internships?.closed} />
                <Metric label="Open"         value={stats.internships?.open} />
              </div>

              <SectionLabel>Applications</SectionLabel>
              <div style={grid2}>
                <Metric label="Total"    value={stats.applications?.total} />
                <Metric label="Pending"  value={stats.applications?.pending} />
                <Metric label="Accepted" value={stats.applications?.accepted} />
                <Metric label="Rejected" value={stats.applications?.rejected} />
              </div>
            </div>

            {/* Right column */}
            <div>
              <SectionLabel top={0}>Reports &amp; certificates</SectionLabel>
              <div style={grid2}>
                <Metric label="Monthly reports" value={stats.reports?.monthly_total} />
                <Metric label="Final — done"    value={stats.reports?.final_completed} />
                <Metric label="Final — pending" value={stats.reports?.final_pending} />
                <Metric
                  label="Certificates"
                  value={stats.certificates?.issued}
                  sub={`${stats.certificates?.generated ?? 0} PDFs generated`}
                />
              </div>

              <SectionLabel>Quick actions</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <QuickAction onClick={() => navigate('/uil/pending-registrations')}>
                  Review pending registrations ({stats.pending_registrations})
                </QuickAction>
                <QuickAction onClick={() => navigate('/uil/manage-users')}>
                  Manage users ({stats.users?.total})
                </QuickAction>
              </div>
            </div>
          </div>

          <Divider top={32} />

          {/* ── Recently joined ── */}
          {stats.recent_users?.length > 0 && (
            <>
              <SectionLabel top={28}>Recently joined</SectionLabel>
              <div style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                {stats.recent_users.map((u, idx) => {
                  const badge = ROLE_COLORS[u.role] || ROLE_COLORS.STUDENT;
                  const roleLabel = u.role.replace('_', ' ')
                    .toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
                  const isLast = idx === stats.recent_users.length - 1;
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 20px',
                        borderBottom: !isLast ? '1px solid #F3F4F6' : 'none',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Avatar + info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: badge.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: badge.color,
                          flexShrink: 0,
                        }}>
                          {u.email?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                            {u.email}
                          </div>
                          {u.department && u.department !== '—' && (
                            <div style={{ fontSize: 11, marginTop: 1, color: '#9CA3AF' }}>
                              {u.department}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Badge + date */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          background: badge.bg, color: badge.color,
                          borderRadius: 20, padding: '3px 10px',
                          fontSize: 11, fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: badge.dot, flexShrink: 0,
                          }} />
                          {roleLabel}
                        </span>
                        <span style={{
                          fontSize: 11, minWidth: 76, textAlign: 'right',
                          color: '#9CA3AF', fontWeight: 500,
                          fontVariantNumeric: 'tabular-nums',
                        }}>
                          {u.created_at}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </>}
      </div>
    </div>
  );
};

export default SystemOverview;