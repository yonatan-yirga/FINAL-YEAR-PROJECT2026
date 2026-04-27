/**
 * DepartmentFinalReports 
 * Department views all final reports in their department.
*/
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/common/Header';
import reportService from '../../services/reportService';
import certificateService from '../../services/certificateService';

const DepartmentFinalReports = () => {
  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [filter,     setFilter]     = useState('all');
  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState(null);
  const [detail,     setDetail]     = useState(null);
  const [loadDetail, setLoadDetail] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadErr, setDownloadErr] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [issueError, setIssueError] = useState('');
  const [issueSuccess, setIssueSuccess] = useState('');
  const [deptReview, setDeptReview] = useState('');
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState('');
  const [approveSuccess, setApproveSuccess] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const C = {
    navy: '#0F2D5E', purple: '#667EEA', gold: '#C9A84C',
    border: '#E2E8F0', bg: '#F8FAFC', white: '#FFFFFF',
    text: '#1A202C', muted: '#718096', error: '#C53030',
  };
  const card = {
    background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`,
    padding: '20px', marginBottom: '14px',
  };

  const fetchReports = useCallback(async () => {
    setLoading(true); setError('');
    const res = await reportService.getDepartmentFinalReports(
      filter !== 'all' ? filter : undefined
    );
    if (res.success) setReports(res.data.results || []);
    else setError(res.error || 'Failed to load final reports.');
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const openDetail = async (report) => {
    setSelected(report);
    setDetail(null);
    setLoadDetail(true);
    setDownloadErr('');
    const res = await reportService.getFinalReportDetail(report.id);
    if (res.success) setDetail(res.data);
    setLoadDetail(false);
  };

  const closeDetail = () => {
    setSelected(null);
    setDetail(null);
    setDownloadErr('');
    setIssueError('');
    setIssueSuccess('');
    setDeptReview('');
    setApproving(false);
    setApproveError('');
    setApproveSuccess('');
    setRejecting(false);
    setRejectReason('');
  };

  /**
   * Authenticated PDF download — uses reportService.downloadFinalReportPdf()
   * which attaches Authorization: Token <token> to the request.
   * The old plain <a href> never sent the header → HTTP 401.
   */
  const handleDownloadPdf = async () => {
    if (!detail) return;
    setDownloading(true);
    setDownloadErr('');
    const res = await reportService.downloadFinalReportPdf(
      detail.id,
      `final_report_${detail.student_name?.replace(/\s+/g, '_') || detail.id}.pdf`
    );
    if (!res.success) {
      setDownloadErr(res.error || 'Download failed. Please try again.');
    }
    setDownloading(false);
  };

  const handleApproveReport = async () => {
    if (!detail) return;
    if (!window.confirm(`Are you sure you want to approve this final report for ${detail.student_name}?`)) {
      return;
    }
    setApproving(true);
    setApproveError('');
    setApproveSuccess('');
    
    const res = await reportService.approveFinalReport(detail.id, {
      action: 'approve',
      review_comments: deptReview
    });
    
    if (res.success) {
      setApproveSuccess('Final report approved successfully! You can now issue the certificate.');
      fetchReports(); // Refresh list
      // Refresh detail
      const updatedDetail = await reportService.getFinalReportDetail(detail.id);
      if (updatedDetail.success) setDetail(updatedDetail.data);
    } else {
      setApproveError(res.error || 'Failed to approve report.');
    }
    setApproving(false);
  };

  const handleRejectReport = async () => {
    if (!detail) return;
    if (!rejectReason.trim()) {
      setApproveError('Please provide a reason for rejection.');
      return;
    }
    if (!window.confirm(`Are you sure you want to reject this report and send it back for revision?`)) {
      return;
    }
    setRejecting(true);
    setApproveError('');
    
    const res = await reportService.approveFinalReport(detail.id, {
      action: 'reject',
      review_comments: rejectReason
    });
    
    if (res.success) {
      setApproveSuccess('Report sent back for revision. The advisor has been notified.');
      fetchReports(); // Refresh list
      // Refresh detail
      const updatedDetail = await reportService.getFinalReportDetail(detail.id);
      if (updatedDetail.success) setDetail(updatedDetail.data);
    } else {
      setApproveError(res.error || 'Failed to reject report.');
    }
    setRejecting(false);
  };

  const handleIssueCertificate = async () => {
    if (!detail) return;
    if (!window.confirm(`Are you sure you want to issue the official certificate for ${detail.student_name}? This action is permanent.`)) {
      return;
    }
    setIssuing(true);
    setIssueError('');
    setIssueSuccess('');
    
    const res = await reportService.issueCertificate(detail.id);
    if (res.success) {
      setIssueSuccess(`Certificate ${res.data?.certificate_id || ''} issued successfully!`);
      fetchReports(); // Refresh list to show 'Certificate Issued' status
      // Refresh detail as well
      const updatedDetail = await reportService.getFinalReportDetail(detail.id);
      if (updatedDetail.success) setDetail(updatedDetail.data);
    } else {
      setIssueError(res.error || 'Failed to issue certificate.');
    }
    setIssuing(false);
  };

  const statusBadge = (s) => {
    const conf = {
      PENDING_ADVISOR:         { label: 'Pending Advisor',  bg: '#FEF3C7', color: '#92400E' },
      SUBMITTED_TO_DEPARTMENT: { label: 'Ready for Review', bg: '#ECFDF5', color: '#065F46' },
      APPROVED_BY_DEPARTMENT:  { label: 'Approved',         bg: '#DBEAFE', color: '#1E40AF' },
      CERTIFICATE_ISSUED:      { label: 'Certificate Issued', bg: '#F3E8FF', color: '#7C3AED' },
      COMPLETED:               { label: 'Completed',        bg: '#DBEAFE', color: '#1E40AF' },
    };
    const c = conf[s] || { label: s, bg: '#F3F4F6', color: '#6B7280' };
    return (
      <span style={{
        padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
        fontWeight: '700', background: c.bg, color: c.color,
      }}>
        {c.label}
      </span>
    );
  };

  const gradeBadge = (g) => {
    if (!g) return null;
    const colors = { A: '#059669', B: '#2563EB', C: '#D97706', D: '#6B7280', F: '#DC2626' };
    return (
      <span style={{
        padding: '3px 12px', borderRadius: '20px', fontSize: '13px',
        fontWeight: '800', background: '#F3F4F6', color: colors[g] || C.navy,
      }}>
        Grade {g}
      </span>
    );
  };

  const filtered = reports.filter(r =>
    search.trim() === '' ||
    r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total:    reports.length,
    pending:  reports.filter(r => r.status === 'PENDING_ADVISOR').length,
    ready:    reports.filter(r => r.status === 'SUBMITTED_TO_DEPARTMENT').length,
    approved: reports.filter(r => r.status === 'APPROVED_BY_DEPARTMENT').length,
    done:     reports.filter(r => ['CERTIFICATE_ISSUED', 'COMPLETED'].includes(r.status)).length,
  };

  // ── Detail slide-in panel ──────────────────────────────────────────────────
  const DetailPanel = () => (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '600px',
      background: C.white, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      overflowY: 'auto', zIndex: 1000,
    }}>
      {/* Panel header */}
      <div style={{
        background: C.navy, padding: '20px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>Final Report Detail</div>
          <div style={{ color: '#A5B4FC', fontSize: '13px', marginTop: '2px' }}>
            {selected?.student_name}
          </div>
        </div>
        <button
          onClick={closeDetail}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '16px',
          }}
        >✕</button>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {loadDetail && (
          <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>Loading…</div>
        )}

        {detail && (
          <>
            {/* Participant info */}
            <div style={{
              background: '#EFF6FF', borderRadius: '10px', padding: '14px 16px',
              marginBottom: '18px', border: '1px solid #BFDBFE',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { l: 'Student',    v: detail.student_name },
                  { l: 'Company',    v: detail.company_name },
                  { l: 'Position',   v: detail.internship_title },
                  { l: 'Advisor',    v: detail.advisor_name },
                  { l: 'Department', v: detail.department_name },
                  { l: 'Status',     v: detail.status_label },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <div style={{
                      fontSize: '10px', fontWeight: '700', color: '#3B82F6',
                      textTransform: 'uppercase',
                    }}>{l}</div>
                    <div style={{ fontSize: '13px', color: C.text, fontWeight: '600' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grade + recommendation */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
              {detail.overall_grade && (
                <div style={{
                  flex: 1, textAlign: 'center', background: '#ECFDF5',
                  borderRadius: '10px', padding: '16px', border: '1px solid #6EE7B7',
                }}>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: '#059669' }}>
                    {detail.overall_grade}
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>
                    {detail.grade_label}
                  </div>
                </div>
              )}
              <div style={{
                flex: 1, textAlign: 'center', background: '#F0FFF4',
                borderRadius: '10px', padding: '16px', border: '1px solid #68D391',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                  {{ YES: '✅', NO: '❌', CONDITIONAL: '⚠️' }[detail.company_recommendation] || '—'}
                </div>
                <div style={{ fontSize: '12px', color: '#276749', fontWeight: '700' }}>
                  {detail.recommendation_label || '—'}
                </div>
              </div>
            </div>

            {/* Company section */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                background: '#2563EB', borderRadius: '8px', padding: '8px 14px',
                marginBottom: '12px', display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ color: '#fff', fontWeight: '700', fontSize: '13px' }}>
                  Stage 1 — Company Evaluation
                </span>
                <span style={{ color: '#BFDBFE', fontSize: '12px' }}>
                  {detail.company_submitted_at
                    ? new Date(detail.company_submitted_at).toLocaleDateString() : '—'}
                </span>
              </div>
              {[
                { l: 'Performance Assessment', v: detail.company_performance_assessment },
                { l: 'Skills Developed',       v: detail.skills_developed },
                { l: 'Key Achievements',       v: detail.key_achievements },
                { l: 'Company Comments',       v: detail.company_comments },
              ].map(({ l, v }) => v && (
                <div key={l} style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700', color: C.muted,
                    textTransform: 'uppercase', marginBottom: '4px',
                  }}>{l}</div>
                  <div style={{
                    background: C.bg, borderRadius: '6px', padding: '10px 12px',
                    fontSize: '13px', color: C.text, lineHeight: '1.5',
                  }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Advisor section */}
            {detail.advisor_submitted_at ? (
              <div style={{ marginBottom: '18px' }}>
                <div style={{
                  background: '#6D28D9', borderRadius: '8px', padding: '8px 14px',
                  marginBottom: '12px', display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '13px' }}>
                    Stage 2 — Advisor Evaluation
                  </span>
                  <span style={{ color: '#DDD6FE', fontSize: '12px' }}>
                    {new Date(detail.advisor_submitted_at).toLocaleDateString()}
                  </span>
                </div>
                {[
                  { l: 'Advisor Evaluation',       v: detail.advisor_evaluation },
                  { l: 'Academic Integration',     v: detail.academic_integration },
                  { l: 'Professional Development', v: detail.professional_development },
                  { l: 'Areas for Improvement',    v: detail.improvement_areas },
                ].map(({ l, v }) => v && (
                  <div key={l} style={{ marginBottom: '12px' }}>
                    <div style={{
                      fontSize: '11px', fontWeight: '700', color: C.muted,
                      textTransform: 'uppercase', marginBottom: '4px',
                    }}>{l}</div>
                    <div style={{
                      background: C.bg, borderRadius: '6px', padding: '10px 12px',
                      fontSize: '13px', color: C.text, lineHeight: '1.5',
                    }}>{v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                background: '#FFFBEB', borderRadius: '10px', padding: '16px',
                border: '1px solid #FCD34D', textAlign: 'center', color: '#92400E',
                marginBottom: '18px',
              }}>
                ⏳ Advisor has not yet completed their evaluation section.
              </div>
            )}

            {/* Monthly Progress Evidence */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{
                background: C.gold, borderRadius: '8px', padding: '8px 14px',
                marginBottom: '12px', display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ color: '#fff', fontWeight: '700', fontSize: '13px' }}>
                  Monthly Progress Evidence
                </span>
                <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }}>
                  {detail.company_monthly_reports?.length || 0} Periods
                </span>
              </div>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {detail.company_monthly_reports?.map((r, i) => (
                  <div key={r.id} style={{ 
                    background: '#FDFDEA', borderRadius: '10px', padding: '12px', 
                    border: '1px solid #FEF08A', fontSize: '12px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '800', color: '#854D0E' }}>MONTH {r.report_month} — COMPANY</span>
                      <span style={{ color: '#A16207', fontWeight: '600' }}>{r.performance_rating}</span>
                    </div>
                    <div style={{ color: '#713F12', lineHeight: '1.4' }}>{r.comments}</div>
                  </div>
                ))}

                {detail.student_monthly_reports?.map((r, i) => (
                  <div key={r.id} style={{ 
                    background: '#F0F9FF', borderRadius: '10px', padding: '12px', 
                    border: '1px solid #BAE6FD', fontSize: '12px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '800', color: '#0369A1' }}>MONTH {r.report_month} — STUDENT</span>
                      <span style={{ color: '#0EA5E9', fontWeight: '600' }}>{r.hours_worked} Hrs</span>
                    </div>
                    <div style={{ color: '#0C4A6E', lineHeight: '1.4' }}>{r.tasks_performed}</div>
                  </div>
                ))}

                {(!detail.company_monthly_reports?.length && !detail.student_monthly_reports?.length) && (
                  <div style={{ textAlign: 'center', padding: '20px', color: C.muted, fontSize: '13px' }}>
                    No monthly reports synchronized for this record.
                  </div>
                )}
              </div>
            </div>

            {/* Department Section */}
            {detail.department_reviewed_at && (
              <div style={{ marginBottom: '18px' }}>
                <div style={{
                  background: C.navy, borderRadius: '8px', padding: '8px 14px',
                  marginBottom: '12px', display: 'flex', justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '13px' }}>
                    Stage 3 — Department Final Review
                  </span>
                  <span style={{ color: '#A5B4FC', fontSize: '12px' }}>
                    {new Date(detail.department_reviewed_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700', color: C.muted,
                    textTransform: 'uppercase', marginBottom: '4px',
                  }}>Academic Performance Review</div>
                  <div style={{
                    background: '#F0F9FF', borderRadius: '6px', padding: '10px 12px',
                    fontSize: '13px', color: C.text, lineHeight: '1.5',
                    border: '1px solid #BAE6FD',
                  }}>{detail.department_review || 'No additional comments provided.'}</div>
                </div>
              </div>
            )}

            {/* PDF Download — authenticated button replacing the bare <a href> */}
            {detail.pdf_url && (
              <div style={{ marginTop: '20px' }}>
                {downloadErr && (
                  <div style={{
                    background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px',
                    padding: '10px 14px', color: C.error, fontSize: '13px', marginBottom: '10px',
                  }}>
                    ⚠️ {downloadErr}
                  </div>
                )}
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  style={{
                    display: 'block', width: '100%', padding: '12px',
                    textAlign: 'center', background: downloading ? '#4A6FA5' : C.navy,
                    color: '#fff', borderRadius: '10px', border: 'none',
                    fontWeight: '700', fontSize: '14px',
                    cursor: downloading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {downloading ? '⏳ Downloading…' : '📥 Download PDF Report'}
                </button>
              </div>
            )}

            {/* Department Approval Actions */}
            {detail.status === 'SUBMITTED_TO_DEPARTMENT' && (
              <div style={{ marginTop: '24px', padding: '20px', border: '2px dashed #E2E8F0', borderRadius: '16px', backgroundColor: '#F8FAFC' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: C.navy, marginBottom: '8px' }}>Department Head Review</div>
                <p style={{ fontSize: '12px', color: C.muted, marginBottom: '16px' }}>
                  Review the final report and either approve it for certificate generation or send it back for revision.
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: C.muted, display: 'block', marginBottom: '6px' }}>
                    DEPARTMENT REVIEW COMMENTS
                  </label>
                  <textarea
                    placeholder="Enter your review comments (required for rejection, optional for approval)..."
                    value={deptReview}
                    onChange={(e) => setDeptReview(e.target.value)}
                    style={{
                      width: '100%', minHeight: '80px', padding: '12px', borderRadius: '8px',
                      border: `1.5px solid ${C.border}`, fontSize: '13px', color: C.text,
                      outline: 'none', background: C.white, resize: 'vertical',
                    }}
                  />
                </div>
                
                {approveError && (
                  <div style={{ padding: '10px', background: '#FEF2F2', color: C.error, borderRadius: '8px', fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
                    ⚠️ {approveError}
                  </div>
                )}
                
                {approveSuccess && (
                  <div style={{ padding: '10px', background: '#ECFDF5', color: '#059669', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', fontWeight: '700' }}>
                    ✅ {approveSuccess}
                  </div>
                )}

                {!approveSuccess && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleApproveReport}
                      disabled={approving}
                      style={{
                        flex: 1, padding: '12px', backgroundColor: '#059669', color: '#fff',
                        borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px',
                        cursor: approving ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {approving ? 'Approving...' : '✓ Approve Report'}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (!rejectReason.trim()) {
                          setRejectReason(deptReview);
                        }
                        handleRejectReport();
                      }}
                      disabled={rejecting}
                      style={{
                        flex: 1, padding: '12px', backgroundColor: '#DC2626', color: '#fff',
                        borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '13px',
                        cursor: rejecting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {rejecting ? 'Rejecting...' : '✗ Send Back for Revision'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Certificate Issuance */}
            {detail.status === 'APPROVED_BY_DEPARTMENT' && !detail.certificate_issued && (
              <div style={{ marginTop: '24px', padding: '20px', border: '2px solid #059669', borderRadius: '16px', backgroundColor: '#ECFDF5' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>Ready for Certificate Issuance</div>
                <p style={{ fontSize: '12px', color: '#065F46', marginBottom: '16px' }}>
                  This report has been approved. Click below to generate and issue the official certificate to the student.
                </p>
                
                {issueError && (
                  <div style={{ padding: '10px', background: '#FEF2F2', color: C.error, borderRadius: '8px', fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
                    ⚠️ {issueError}
                  </div>
                )}
                
                {issueSuccess && (
                  <div style={{ padding: '10px', background: '#ECFDF5', color: '#059669', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', fontWeight: '700' }}>
                    ✅ {issueSuccess}
                  </div>
                )}

                {!issueSuccess && (
                  <button
                    onClick={handleIssueCertificate}
                    disabled={issuing}
                    style={{
                      width: '100%', padding: '14px', backgroundColor: '#059669', color: '#fff',
                      borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '14px',
                      cursor: issuing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    {issuing ? '🎓 Generating Certificate...' : '🎓 Issue Official Certificate'}
                  </button>
                )}
              </div>
            )}

            {(detail.status === 'CERTIFICATE_ISSUED' || detail.certificate_issued) && (
              <div style={{ marginTop: '24px', padding: '16px', background: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🎓</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0369A1' }}>Certificate Issued Successfully</div>
                  <div style={{ fontSize: '11px', color: '#0EA5E9' }}>
                    Official certificate has been generated and sent to the student.
                    {detail.certificate_issued_at && ` Issued on ${new Date(detail.certificate_issued_at).toLocaleDateString()}.`}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Final Reports" subtitle="Final internship evaluations for your department" />

      {selected && <DetailPanel />}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px', marginBottom: '24px',
        }}>
          {[
            { icon: '📊', label: 'Total Reports',   v: stats.total,    color: C.navy,    bg: '#EFF6FF' },
            { icon: '⏳', label: 'Pending Advisor', v: stats.pending,  color: '#D97706', bg: '#FFFBEB' },
            { icon: '📋', label: 'Ready to Review', v: stats.ready,    color: '#059669', bg: '#ECFDF5' },
            { icon: '✅', label: 'Approved',        v: stats.approved, color: '#2563EB', bg: '#DBEAFE' },
            { icon: '🎓', label: 'Completed',       v: stats.done,     color: '#7C3AED', bg: '#F3E8FF' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, borderRadius: '12px',
              padding: '14px 16px', border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.v}</div>
              <div style={{ fontSize: '11px', color: C.muted, fontWeight: '600' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            placeholder="Search by student or company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px',
              border: `1.5px solid ${C.border}`, fontSize: '14px', outline: 'none',
              background: C.white, color: C.text,
            }}
          />
          {[
            { v: 'all',                    l: 'All' },
            { v: 'PENDING_ADVISOR',         l: 'Pending' },
            { v: 'SUBMITTED_TO_DEPARTMENT', l: 'Ready' },
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              style={{
                padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px', fontWeight: '700',
                background: filter === f.v ? C.navy : C.white,
                color: filter === f.v ? '#fff' : C.muted,
                border: `1.5px solid ${filter === f.v ? C.navy : C.border}`,
                transition: 'all 0.15s',
              }}
            >{f.l}</button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: C.muted }}>Loading…</div>
        )}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: '10px',
            padding: '16px', color: C.error, marginBottom: '20px',
          }}>
            ⚠️ {error}
            <button
              onClick={fetchReports}
              style={{
                marginLeft: '12px', padding: '4px 12px', borderRadius: '6px',
                background: C.error, color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: '12px',
              }}
            >Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: C.muted }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontWeight: '700', marginBottom: '6px' }}>No final reports found.</div>
            <div style={{ fontSize: '14px' }}>
              {search
                ? 'Try a different search term.'
                : 'Final reports will appear here once companies submit.'}
            </div>
          </div>
        )}

        {!loading && !error && filtered.map(r => (
          <div
            key={r.id}
            style={{ ...card, cursor: 'pointer' }}
            onClick={() => openDetail(r)}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: C.text, fontSize: '15px', marginBottom: '4px' }}>
                  {r.student_name}
                </div>
                <div style={{ color: C.muted, fontSize: '13px', marginBottom: '6px' }}>
                  {r.company_name}
                </div>
                <div style={{
                  display: 'flex', gap: '14px', flexWrap: 'wrap',
                  fontSize: '12px', color: C.muted,
                }}>
                  <span>📅 {new Date(r.created_at).toLocaleDateString()}</span>
                  {r.overall_grade && <span>🎓 Grade: <strong>{r.overall_grade}</strong></span>}
                  {r.pdf_url && <span style={{ color: '#059669' }}>📄 PDF ready</span>}
                </div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
              }}>
                {statusBadge(r.status)}
                {gradeBadge(r.overall_grade)}
                <span style={{ fontSize: '12px', color: C.purple, fontWeight: '600' }}>
                  View Details →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentFinalReports;