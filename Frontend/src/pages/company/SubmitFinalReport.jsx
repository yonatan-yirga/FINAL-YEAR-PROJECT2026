/**
 * SubmitFinalReport
 * Company submits their final evaluation (Stage 1 of two-stage workflow).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import reportService from '../../services/reportService';

const RECOMMENDATIONS = [
  { value: 'YES',         label: 'Yes — Recommend',       icon: '✅', color: '#059669', bg: '#ECFDF5', border: '#6EE7B7' },
  { value: 'CONDITIONAL', label: 'Conditional',           icon: '⚠️', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  { value: 'NO',          label: 'No — Do Not Recommend', icon: '❌', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
];

const SubmitFinalReport = () => {
  const navigate = useNavigate();
  const [interns,    setInterns]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  const [form, setForm] = useState({
    assignment_id:                  '',
    internship_duration:            '',
    company_performance_assessment: '',
    skills_developed:               '',
    key_achievements:               '',
    company_recommendation:         '',
    company_comments:               '',
  });

  const selectedIntern = interns.find(i => String(i.id) === String(form.assignment_id)) || null;
  
  // Separate interns by status
  const eligibleInterns = interns.filter(i => !i.has_final_report);
  const completedInterns = interns.filter(i => i.has_final_report);

  useEffect(() => {
    (async () => {
      const res = await reportService.getActiveInterns();
      if (res.success) {
        // Show all interns, we'll organize them by status
        setInterns(res.data.results || []);
      }
      setLoading(false);
    })();
  }, []);

  const set = (field, value) => { setForm(p => ({ ...p, [field]: value })); setError(''); };

  const validate = () => {
    if (!form.assignment_id)                       return 'Select a student.';
    if (!form.internship_duration.trim())          return 'Specify the internship duration.';
    if (!form.company_performance_assessment.trim()) return 'Provide a performance assessment.';
    if (!form.skills_developed.trim())             return 'List the skills developed.';
    if (!form.key_achievements.trim())             return 'Describe key achievements.';
    if (!form.company_recommendation)             return 'Select your recommendation.';
    if (!form.company_comments.trim())             return 'Provide final comments.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true);
    const payload = { ...form, assignment_id: Number(form.assignment_id) };
    const res = await reportService.submitFinalReport(payload);
    setSubmitting(false);
    if (res.success) {
      setSuccess('Final report submitted. Your advisor has been notified to complete their section.');
      // Re-fetch to update the lists
      const r2 = await reportService.getActiveInterns();
      if (r2.success) setInterns(r2.data.results || []);
      setForm({ assignment_id: '', internship_duration: '', company_performance_assessment: '',
                skills_developed: '', key_achievements: '', company_recommendation: '', company_comments: '' });
    } else {
      setError(res.error);
    }
  };

  // ── Design tokens ────────────────────────────────────────────────────────────
  const C = {
    navy: '#0F2D5E', purple: '#667EEA', gold: '#C9A84C',
    border: '#E2E8F0', bg: '#F8FAFC', white: '#FFFFFF',
    text: '#1A202C', muted: '#718096', error: '#C53030', success: '#276749',
  };

  const inp = (extra = {}) => ({
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${C.border}`, borderRadius: '8px',
    fontSize: '14px', color: C.text, outline: 'none',
    boxSizing: 'border-box', background: C.white,
    fontFamily: 'inherit',
    ...extra,
  });

  const card = { background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`,
                  padding: '24px', marginBottom: '20px' };
  const label = { display: 'block', fontSize: '12px', fontWeight: '600',
                   color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' };
  const required = <span style={{ color: '#E53E3E', marginLeft: '2px' }}>*</span>;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Submit Final Report" subtitle="Final internship evaluation — Stage 1" />
      <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading active interns…</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Submit Final Report" subtitle="Final internship evaluation — Stage 1 of 2" />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Stage indicator */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          {[
            { n: 1, label: 'Company Section', active: true,  done: false },
            { n: 2, label: 'Advisor Section', active: false, done: false },
          ].map(s => (
            <div key={s.n} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '10px',
              background: s.active ? C.navy : C.bg,
              border: `1.5px solid ${s.active ? C.navy : C.border}`,
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                background: s.active ? C.gold : C.border,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700',
                color: s.active ? C.navy : C.muted,
              }}>{s.n}</div>
              <span style={{ fontSize: '13px', fontWeight: '600',
                             color: s.active ? C.white : C.muted }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Success banner */}
        {success && (
          <div style={{ background: '#F0FFF4', border: '1.5px solid #68D391', borderRadius: '10px',
                        padding: '16px 20px', marginBottom: '20px', display: 'flex',
                        alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <div>
              <div style={{ fontWeight: '700', color: '#276749', marginBottom: '4px' }}>
                Final Report Submitted!
              </div>
              <div style={{ color: '#276749', fontSize: '14px' }}>{success}</div>
              <button
                onClick={() => navigate('/company/dashboard')}
                style={{ marginTop: '10px', padding: '6px 16px', borderRadius: '6px',
                         background: '#276749', color: '#fff', border: 'none',
                         fontSize: '13px', cursor: 'pointer' }}>
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ background: '#FFF5F5', border: '1.5px solid #FCA5A5', borderRadius: '10px',
                        padding: '14px 18px', marginBottom: '20px', color: C.error,
                        fontSize: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* No interns at all */}
        {interns.length === 0 && !loading && (
          <div style={{ ...card, textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontWeight: '700', color: C.text, marginBottom: '8px' }}>
              No Active Internships
            </div>
            <div style={{ color: C.muted, fontSize: '14px' }}>
              You don't have any active internships at the moment.
            </div>
          </div>
        )}

        {/* Show eligible interns for submission */}
        {eligibleInterns.length > 0 && (
          <>
            {/* Student selection */}
            <div style={card}>
              <div style={{ fontWeight: '700', color: C.navy, fontSize: '16px', marginBottom: '16px',
                            display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👤</span> Select Intern for Final Evaluation
              </div>
              <div>
                <label style={label}>Student {required}</label>
                <select value={form.assignment_id} onChange={e => set('assignment_id', e.target.value)}
                        style={{ ...inp(), cursor: 'pointer' }}>
                  <option value="">— Select a student —</option>
                  {eligibleInterns.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.student_name} · {i.internship_title} · {i.months_elapsed} mo. elapsed
                    </option>
                  ))}
                </select>
              </div>

              {selectedIntern && (
                <div style={{ marginTop: '14px', background: '#EFF6FF', borderRadius: '8px',
                              padding: '12px 14px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {[
                    { l: 'Name',           v: selectedIntern.student_name },
                    { l: 'Position',       v: selectedIntern.internship_title },
                    { l: 'Duration',       v: `${selectedIntern.months_elapsed} months elapsed` },
                    { l: 'Monthly Reports', v: `${selectedIntern.reports_submitted?.length || 0} submitted` },
                  ].map(({ l, v }) => (
                    <div key={l} style={{ minWidth: '140px' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#2563EB',
                                    textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                      <div style={{ fontSize: '13px', color: C.text, fontWeight: '600' }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Evaluation form — only show once intern selected */}
            {form.assignment_id && (
              <>
                {/* Duration + recommendation */}
                <div style={card}>
                  <div style={{ fontWeight: '700', color: C.navy, fontSize: '16px', marginBottom: '16px',
                                display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📊</span> Evaluation Overview
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={label}>Internship Duration (as stated) {required}</label>
                    <input
                      value={form.internship_duration}
                      onChange={e => set('internship_duration', e.target.value)}
                      placeholder='e.g. "3 months" or "January – March 2026"'
                      style={inp()}
                    />
                  </div>

                  <label style={{ ...label, marginBottom: '10px' }}>Your Recommendation {required}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {RECOMMENDATIONS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => set('company_recommendation', r.value)}
                        style={{
                          padding: '14px 10px', borderRadius: '10px', cursor: 'pointer',
                          border: `2px solid ${form.company_recommendation === r.value ? r.border : C.border}`,
                          background: form.company_recommendation === r.value ? r.bg : C.white,
                          transition: 'all 0.15s',
                        }}>
                        <div style={{ fontSize: '20px', marginBottom: '6px' }}>{r.icon}</div>
                        <div style={{ fontSize: '12px', fontWeight: '700',
                                      color: form.company_recommendation === r.value ? r.color : C.text }}>
                          {r.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed assessment */}
                <div style={card}>
                  <div style={{ fontWeight: '700', color: C.navy, fontSize: '16px', marginBottom: '16px',
                                display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📝</span> Detailed Assessment
                  </div>

                  {[
                    { field: 'company_performance_assessment', label: 'Performance Assessment',
                      placeholder: 'Describe the student\'s overall performance and work quality…', rows: 4 },
                    { field: 'skills_developed', label: 'Skills Developed',
                      placeholder: 'List skills gained during the internship (technical, soft skills)…', rows: 3 },
                    { field: 'key_achievements', label: 'Key Achievements',
                      placeholder: 'Describe notable accomplishments and contributions…', rows: 3 },
                    { field: 'company_comments', label: 'Final Comments',
                      placeholder: 'Any additional observations, suggestions, or remarks…', rows: 3 },
                  ].map(({ field, label: lbl, placeholder, rows }) => (
                    <div key={field} style={{ marginBottom: '18px' }}>
                      <label style={label}>{lbl} {required}</label>
                      <textarea
                        rows={rows}
                        value={form[field]}
                        onChange={e => set(field, e.target.value)}
                        placeholder={placeholder}
                        style={{ ...inp(), resize: 'vertical', minHeight: `${rows * 28}px` }}
                      />
                      <div style={{ fontSize: '11px', color: C.muted, marginTop: '4px', textAlign: 'right' }}>
                        {form[field].trim().length} characters
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <div style={{ ...card, textAlign: 'center', background: '#EFF6FF',
                              border: `1.5px solid #BFDBFE` }}>
                  <div style={{ fontSize: '13px', color: '#1E40AF', marginBottom: '16px' }}>
                    ⚠️ Once submitted, your section cannot be edited. Your advisor will be notified to complete their evaluation.
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                      padding: '14px 40px', borderRadius: '10px', fontSize: '15px',
                      fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer',
                      background: submitting ? '#A0AEC0' : C.navy,
                      color: '#fff', border: 'none', transition: 'all 0.2s',
                    }}>
                    {submitting ? '⏳ Submitting…' : '📤 Submit Final Report'}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Show completed reports */}
        {completedInterns.length > 0 && (
          <div style={card}>
            <div style={{ fontWeight: '700', color: C.navy, fontSize: '16px', marginBottom: '16px',
                          display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✅</span> Submitted Final Reports ({completedInterns.length})
            </div>
            <div style={{ color: C.muted, fontSize: '13px', marginBottom: '16px' }}>
              These interns already have final reports submitted. The reports are now with advisors for completion.
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {completedInterns.map(intern => (
                <div key={intern.id} style={{
                  background: '#F9FAFB',
                  border: `1px solid ${C.border}`,
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: C.text, marginBottom: '4px' }}>
                      {intern.student_name}
                    </div>
                    <div style={{ fontSize: '13px', color: C.muted }}>
                      {intern.internship_title} · {intern.months_elapsed} months
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    background: '#ECFDF5',
                    color: '#059669',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    ✓ Submitted
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No eligible interns message */}
        {eligibleInterns.length === 0 && completedInterns.length === 0 && interns.length > 0 && (
          <div style={{ ...card, textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontWeight: '700', color: C.text, marginBottom: '8px' }}>
              No Eligible Interns
            </div>
            <div style={{ color: C.muted, fontSize: '14px' }}>
              All active interns either have a final report already submitted, or there are no active internships.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitFinalReport;