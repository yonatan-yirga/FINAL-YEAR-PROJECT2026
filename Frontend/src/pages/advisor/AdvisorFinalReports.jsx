/**
 * AdvisorFinalReports 
 * Workspace for advisors to view pending and completed final evaluations.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import reportService from '../../services/reportService';

const AdvisorFinalReports = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const C = {
    navy: '#0F2D5E',
    purple: '#667EEA',
    gold: '#C9A84C',
    border: '#E2E8F0',
    bg: '#F8FAFC',
    white: '#FFFFFF',
    text: '#1A202C',
    muted: '#718096',
    error: '#C53030',
  };

  const card = {
    background: C.white,
    borderRadius: '12px',
    border: `1px solid ${C.border}`,
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  };

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await reportService.getAdvisorFinalReports();
      if (res.success) {
        setPending(res.data.pending || []);
        setCompleted(res.data.completed || []);
      } else {
        setError(res.error || 'Failed to load final reports.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const statusBadge = (s) => {
    const conf = {
      PENDING_ADVISOR: { label: 'Awaiting Review', bg: '#FEF3C7', color: '#92400E' },
      SUBMITTED_TO_DEPARTMENT: { label: 'Completed', bg: '#ECFDF5', color: '#065F46' },
      COMPLETED: { label: 'Finalized', bg: '#EFF6FF', color: '#1E40AF' },
    };
    const c = conf[s] || { label: s, bg: '#F1F5F9', color: '#475569' };
    return (
      <span style={{ 
        padding: '4px 12px', borderRadius: '20px', fontSize: '11px',
        fontWeight: '700', background: c.bg, color: c.color,
        textTransform: 'uppercase', letterSpacing: '0.02em'
      }}>
        {c.label}
      </span>
    );
  };

  const handleInitiate = async (assignmentId) => {
    if (!window.confirm('The company hasn\'t submitted their evaluation yet. Initiating now will use placeholder values for the company section. Continue?')) return;
    try {
      setLoading(true);
      const res = await reportService.advisorInitiateFinalReport(assignmentId);
      if (res.success) {
        navigate(`/advisor/evaluation/${res.data.final_report_id}`);
      } else {
        alert(res.error || 'Failed to initiate report.');
      }
    } catch (err) {
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const ReportCard = ({ r }) => (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              background: `linear-gradient(135deg, ${C.navy}, ${C.purple})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '18px', fontWeight: '800'
            }}>
              {r.student_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div style={{ fontWeight: '800', color: C.navy, fontSize: '18px', marginBottom: '2px' }}>
                {r.student_name}
              </div>
              <div style={{ color: C.muted, fontSize: '13px', fontWeight: '500' }}>
                📍 {r.company_name}
              </div>
            </div>
            {statusBadge(r.status)}
          </div>
          
          {/* Progress Pipeline */}
          <div style={{ 
            background: '#F8FAFC', borderRadius: '12px', padding: '16px',
            border: '1px solid #E2E8F0', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '12px', textTransform: 'uppercase' }}>
              Evaluation Pipeline Status
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {/* Student Report Status */}
              <div style={{ 
                flex: 1, padding: '8px 12px', borderRadius: '8px',
                background: r.student_submission_status === 'APPROVED' ? '#ECFDF5' : 
                           r.student_submission_status === 'PENDING' ? '#FEF3C7' : '#FEF2F2',
                border: `1px solid ${r.student_submission_status === 'APPROVED' ? '#6EE7B7' : 
                                   r.student_submission_status === 'PENDING' ? '#FCD34D' : '#FCA5A5'}`
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: C.muted, marginBottom: '2px' }}>
                  STUDENT REPORT
                </div>
                <div style={{ 
                  fontSize: '11px', fontWeight: '800',
                  color: r.student_submission_status === 'APPROVED' ? '#059669' : 
                         r.student_submission_status === 'PENDING' ? '#D97706' : '#DC2626'
                }}>
                  {r.student_submission_status === 'NOT_SUBMITTED' ? '⏳ Missing' : 
                   r.student_submission_status === 'APPROVED' ? '✅ Approved' :
                   r.student_submission_status === 'PENDING' ? '📋 Under Review' : r.student_submission_status}
                </div>
              </div>

              {/* Company Evaluation Status */}
              <div style={{ 
                flex: 1, padding: '8px 12px', borderRadius: '8px',
                background: r.company_evaluation_status === 'SUBMITTED' ? '#ECFDF5' : '#FEF3C7',
                border: `1px solid ${r.company_evaluation_status === 'SUBMITTED' ? '#6EE7B7' : '#FCD34D'}`
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: C.muted, marginBottom: '2px' }}>
                  COMPANY EVALUATION
                </div>
                <div style={{ 
                  fontSize: '11px', fontWeight: '800',
                  color: r.company_evaluation_status === 'SUBMITTED' ? '#059669' : '#D97706'
                }}>
                  {r.company_evaluation_status === 'SUBMITTED' ? '✅ Completed' : '⏳ Pending'}
                </div>
              </div>

              {/* Advisor Status */}
              <div style={{ 
                flex: 1, padding: '8px 12px', borderRadius: '8px',
                background: r.advisor_evaluation_status === 'SUBMITTED' ? '#ECFDF5' : '#EFF6FF',
                border: `1px solid ${r.advisor_evaluation_status === 'SUBMITTED' ? '#6EE7B7' : '#BFDBFE'}`
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: C.muted, marginBottom: '2px' }}>
                  YOUR EVALUATION
                </div>
                <div style={{ 
                  fontSize: '11px', fontWeight: '800',
                  color: r.advisor_evaluation_status === 'SUBMITTED' ? '#059669' : '#2563EB'
                }}>
                  {r.advisor_evaluation_status === 'SUBMITTED' ? '✅ Submitted' : '📝 Required'}
                </div>
              </div>
            </div>

            {/* Current Grade Display */}
            {r.grade && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px', background: '#F0FDF4', borderRadius: '8px',
                border: '1px solid #BBF7D0'
              }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#059669' }}>CURRENT GRADE:</span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#059669' }}>{r.grade}</span>
                <span style={{ fontSize: '10px', color: '#16A34A' }}>({r.total_score}/100)</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
          {r.id ? (
            <button 
              onClick={() => navigate(`/advisor/evaluation/${r.id}`)}
              style={{
                padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '800',
                background: r.advisor_evaluation_status === 'SUBMITTED' 
                  ? `linear-gradient(135deg, ${C.green}, #16A34A)` 
                  : `linear-gradient(135deg, ${C.navy}, ${C.purple})`,
                color: '#fff', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(15, 45, 94, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {r.advisor_evaluation_status === 'SUBMITTED' ? (
                <>
                  <span>📊</span>
                  <span>View Results</span>
                </>
              ) : (
                <>
                  <span>📝</span>
                  <span>Complete Evaluation</span>
                </>
              )}
            </button>
          ) : r.student_submission_status !== 'NOT_SUBMITTED' || r.company_evaluation_status === 'SUBMITTED' ? (
            <button 
              onClick={() => handleInitiate(r.assignment_id)}
              style={{
                padding: '14px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '800',
                background: `linear-gradient(135deg, ${C.gold}, #D97706)`,
                color: '#fff', border: 'none', cursor: 'pointer',
                transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(201, 168, 76, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <span>⚡</span>
              <span>Initiate Evaluation</span>
            </button>
          ) : (
            <div style={{ 
              padding: '14px 16px', background: '#FEF2F2', color: '#991B1B', 
              borderRadius: '12px', fontSize: '12px', fontWeight: '700', textAlign: 'center',
              border: '1px solid #FECACA', lineHeight: '1.4'
            }}>
              <div style={{ marginBottom: '4px' }}>⏳ Waiting for Prerequisites</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                Student report or company evaluation required
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div style={{ 
            fontSize: '11px', color: C.muted, textAlign: 'center',
            padding: '8px', background: '#F9FAFB', borderRadius: '8px'
          }}>
            Assignment ID: {r.assignment_id}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <Header title="Final Evaluations" subtitle="Strategic Review & Assessment Sector" />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '100px', color: C.muted }}>
            <div style={{ 
              width: '40px', height: '40px', border: '3px solid #E2E8F0', 
              borderTopColor: C.navy, borderRadius: '50%', margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Scanning for final reports...
          </div>
        )}

        {error && (
          <div style={{ 
            background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px',
            padding: '20px 24px', color: C.error, marginBottom: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span style={{ fontWeight: '600' }}>{error}</span>
            </div>
            <button onClick={fetchReports} style={{ 
              background: C.error, color: '#fff', border: 'none', 
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700'
            }}>Retry Scan</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Instructions Panel */}
            <div style={{ 
              background: `linear-gradient(135deg, ${C.navy}, ${C.purple})`,
              borderRadius: '20px', padding: '24px', marginBottom: '32px',
              color: '#fff', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', top: '-20px', right: '-20px',
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)', opacity: 0.5
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                  📋 Final Evaluation Workflow
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9 }}>
                  Complete your academic evaluation for students who have finished their internships. 
                  Your assessment (30% weight) combines with company evaluation (30%) and monthly progress (40%) 
                  to determine the final grade. Once submitted, reports are sent to the Department Head for approval and certificate generation.
                </div>
                <div style={{ 
                  marginTop: '16px', padding: '12px 16px', background: 'rgba(255,255,255,0.15)',
                  borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                }}>
                  💡 <strong>Tip:</strong> You can initiate evaluations even if the company hasn't submitted their assessment yet.
                </div>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
              {[
                { label: 'Pending Review', value: pending.length, color: '#D97706', bg: '#FFFBEB' },
                { label: 'Completed', value: completed.length, color: '#059669', bg: '#ECFDF5' },
                { label: 'Total Managed', value: pending.length + completed.length, color: C.navy, bg: '#EEF2FF' },
              ].map(s => (
                <div key={s.label} style={{ 
                  background: s.bg, borderRadius: '20px', padding: '24px', 
                  border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: s.color, marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: C.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Navigation Tabs */}
            <div style={{ 
              display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.03)', 
              borderRadius: '14px', padding: '6px', marginBottom: '24px', width: 'fit-content' 
            }}>
              {[
                { key: 'pending', label: `Pending (${pending.length})` },
                { key: 'completed', label: `Completed (${completed.length})` },
              ].map(t => (
                <button 
                  key={t.key} 
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: '10px 24px', borderRadius: '10px', border: 'none',
                    cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                    background: activeTab === t.key ? C.white : 'transparent',
                    color: activeTab === t.key ? C.navy : C.muted,
                    boxShadow: activeTab === t.key ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div style={{ minHeight: '400px' }}>
              {activeTab === 'pending' && (
                pending.length === 0
                  ? <div style={{ textAlign: 'center', padding: '80px 20px', color: C.muted }}>
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>✨</div>
                      <div style={{ fontWeight: '800', color: C.navy, fontSize: '20px', marginBottom: '8px' }}>Sector Clear</div>
                      <p>All student final reports have been processed.</p>
                    </div>
                  : pending.map(r => <ReportCard key={r.id} r={r} />)
              )}

              {activeTab === 'completed' && (
                completed.length === 0
                  ? <div style={{ textAlign: 'center', padding: '80px 20px', color: C.muted }}>
                      <p>No completed evaluations found in current cycle.</p>
                    </div>
                  : completed.map(r => <ReportCard key={r.id} r={r} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdvisorFinalReports;