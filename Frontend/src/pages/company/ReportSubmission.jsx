/**
 * ReportSubmission 
 * Company submits monthly progress reports for active interns.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, Award, CheckCircle } from 'lucide-react';
import Header from '../../components/common/Header';
import reportService from '../../services/reportService';

const PERF = [
  { value: 'EXCELLENT',         label: 'Excellent',          icon: <Award size={18} />, color: '#14a800', bg: '#e8f5e9', border: '#d5e0d5' },
  { value: 'VERY_GOOD',         label: 'Very Good',          icon: <TrendingUp size={18} />, color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD' },
  { value: 'GOOD',              label: 'Good',               icon: <CheckCircle size={18} />, color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  { value: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement',  icon: <Users size={18} />, color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
];

const ReportSubmission = () => {
  const navigate = useNavigate();
  const [interns,    setInterns]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [form, setForm] = useState({
    assignment_id: '', report_month: '',
    attendance_rate: '', performance_rating: '',
    tasks_completed: '', comments: '',
    task_completion_score: 0,
    skill_development_score: 0,
    problem_solving_score: 0,
    professionalism_score: 0,
  });

  const selectedIntern   = interns.find(i => String(i.id) === String(form.assignment_id)) || null;
  const submittedMonths  = selectedIntern?.reports_submitted || [];

  useEffect(() => {
    (async () => {
      const res = await reportService.getActiveInterns();
      if (res.success) setInterns(res.data.results || []);
      setLoading(false);
    })();
  }, []);

  const set = (field, value) => { setForm(p => ({ ...p, [field]: value })); setError(''); };

  const isSubmitted = (m) => submittedMonths.includes(m);

  const validate = () => {
    if (!form.assignment_id)      return 'Select a student.';
    if (!form.report_month)       return 'Select a report month.';
    if (isSubmitted(Number(form.report_month))) return `Month ${form.report_month} already submitted.`;
    if (!form.attendance_rate)    return 'Enter the attendance rate.';
    const a = parseFloat(form.attendance_rate);
    if (isNaN(a) || a < 0 || a > 100) return 'Attendance must be 0–100.';
    if (!form.performance_rating) return 'Select a performance rating.';
    if (!form.tasks_completed.trim()) return 'Describe the tasks completed.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSubmitting(true);
    const res = await reportService.submitMonthlyReport({
      assignment_id:      Number(form.assignment_id),
      report_month:       Number(form.report_month),
      attendance_rate:    parseFloat(form.attendance_rate),
      performance_rating: form.performance_rating,
      tasks_completed:    form.tasks_completed.trim(),
      comments:           form.comments.trim(),
      task_completion_score: parseInt(form.task_completion_score),
      skill_development_score: parseInt(form.skill_development_score),
      problem_solving_score: parseInt(form.problem_solving_score),
      professionalism_score: parseInt(form.professionalism_score),
    });
    setSubmitting(false);
    if (res.success) {
      setSuccess(`Month ${form.report_month} report submitted. PDF generated and advisor notified.`);
      setForm(p => ({ ...p, report_month: '', attendance_rate: '', performance_rating: '', tasks_completed: '', comments: '' }));
      // Refresh submitted months
      const r2 = await reportService.getActiveInterns();
      if (r2.success) setInterns(r2.data.results || []);
    } else {
      setError(res.error);
    }
  };

  // ── Design tokens (Upwork Theme) ────────────────────────────────────────────
  const C = { 
    green: '#14a800',
    greenLight: '#e8f5e9',
    greenBorder: '#d5e0d5',
    border: '#e4e5e7', 
    bg: '#f7f8f9', 
    white: '#ffffff', 
    text: '#1f2d3d', 
    muted: '#6b7177', 
    error: '#c53030', 
    success: '#14a800' 
  };

  const inp = (extra = {}) => ({
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${C.border}`, borderRadius: '8px',
    fontSize: '14px', color: C.text, outline: 'none',
    boxSizing: 'border-box', background: C.white,
    transition: 'border-color 0.15s',
    ...extra,
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Submit Monthly Report" subtitle="Track intern progress each month" />
      <div style={{ padding: '60px', textAlign: 'center', color: C.muted }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <Header title="Submit Monthly Report" subtitle="Track intern progress each month" />

      <div style={{ padding: '0 40px 48px', maxWidth: '1080px', margin: '0 auto' }}>

        {/* Back nav */}
        <div style={{ paddingTop: '22px', marginBottom: '6px' }}>
          <button onClick={() => navigate('/company/dashboard')}
            style={{ padding: '8px 18px', background: 'transparent', color: C.green, border: `1.5px solid ${C.green}`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            Dashboard
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', borderRadius: '10px', padding: '13px 18px', color: C.error, fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#F0FFF4', border: '1px solid #9AE6B4', borderRadius: '10px', padding: '13px 18px', color: C.success, fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✅ {success}
          </div>
        )}

        {interns.length === 0 ? (
          <div style={{ background: C.white, borderRadius: '12px', padding: '64px 48px', textAlign: 'center', border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ width: 80, height: 80, margin: '0 auto 20px', background: C.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={40} color={C.muted} strokeWidth={1.5} />
            </div>
            <h3 style={{ color: C.text, marginBottom: '8px', fontSize: '18px', fontWeight: '700' }}>No Active Interns</h3>
            <p style={{ color: C.muted, fontSize: '14px', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>Reports can only be submitted for students with an active advisor assignment.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>

            {/* ── Left: form card ── */}
            <div style={{ background: C.white, borderRadius: '14px', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

              {/* Card header */}
              <div style={{ padding: '22px 28px 18px', borderBottom: `1px solid ${C.border}`, background: C.green }}>
                <h2 style={{ margin: 0, color: 'white', fontSize: '17px', fontWeight: '700' }}>Report Details</h2>
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>Fill in the monthly progress information below</p>
              </div>

              <div style={{ padding: '28px' }}>

                {/* Student selector */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Student *
                  </label>
                  <select style={{ ...inp(), appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23718096\' d=\'M1 1l5 5 5-5\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px' }}
                    value={form.assignment_id} onChange={e => set('assignment_id', e.target.value)}>
                    <option value="">— Choose an intern —</option>
                    {interns.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.student_name} ({i.university_id}) — {i.internship_title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Two columns: month + attendance */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Report Month *
                    </label>
                    <select style={{ ...inp(), appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23718096\' d=\'M1 1l5 5 5-5\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px' }}
                      value={form.report_month}
                      onChange={e => set('report_month', e.target.value)}
                      disabled={!form.assignment_id}>
                      <option value="">— Select —</option>
                      {[1,2,3,4,5,6].map(m => {
                        const done = isSubmitted(m);
                        return <option key={m} value={m} disabled={done}>Month {m}{done ? '  ✓' : ''}</option>;
                      })}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Attendance Rate (%) *
                    </label>
                    <input style={inp()} type="number" min="0" max="100" step="0.1" placeholder="e.g. 95.5"
                      value={form.attendance_rate} onChange={e => set('attendance_rate', e.target.value)} />
                  </div>
                </div>

                {/* Performance rating */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Performance Rating *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {PERF.map(opt => {
                      const sel = form.performance_rating === opt.value;
                      return (
                        <button key={opt.value} onClick={() => set('performance_rating', opt.value)}
                          style={{ padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', border: `2px solid ${sel ? opt.color : C.border}`, background: sel ? opt.bg : C.white, transition: 'all 0.15s' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', color: sel ? opt.color : C.muted }}>{opt.icon}</span>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: sel ? opt.color : C.text }}>{opt.label}</div>
                            </div>
                            {sel && <span style={{ marginLeft: 'auto', width: '18px', height: '18px', borderRadius: '50%', background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'white' }}>✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Structured Scoring (0-10) */}
                <div style={{ marginBottom: '22px', background: C.greenLight, padding: '20px', borderRadius: '12px', border: `1px solid ${C.greenBorder}` }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: C.green, marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📈 Structured Performance Evaluation (0-100)
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {[
                      { field: 'task_completion_score', label: 'Task Completion' },
                      { field: 'skill_development_score', label: 'Skill Development' },
                      { field: 'problem_solving_score', label: 'Problem Solving' },
                      { field: 'professionalism_score', label: 'Professionalism' }
                    ].map(item => (
                      <div key={item.field}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: C.muted, marginBottom: '6px' }}>{item.label}</label>
                        <input 
                          style={inp({ textAlign: 'center', fontWeight: '700' })} 
                          type="number" min="0" max="100" 
                          value={form[item.field]} 
                          onChange={e => set(item.field, e.target.value)} 
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '11px', color: C.muted, fontStyle: 'italic' }}>
                    * These scores contribute 40% to the student's final internship grade.
                  </div>
                </div>

                {/* Tasks */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tasks Completed This Month *
                  </label>
                  <textarea
                    style={{ ...inp(), minHeight: '120px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
                    placeholder="Describe the tasks, projects, and responsibilities completed by the intern this month…"
                    value={form.tasks_completed} onChange={e => set('tasks_completed', e.target.value)} />
                  <div style={{ fontSize: '12px', color: form.tasks_completed.length < 20 ? '#E53E3E' : C.muted, marginTop: '4px', textAlign: 'right' }}>
                    {form.tasks_completed.length} characters
                  </div>
                </div>

                {/* Comments */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Comments & Feedback
                    <span style={{ fontSize: '11px', fontWeight: '400', color: '#A0AEC0', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <textarea
                    style={{ ...inp(), minHeight: '90px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6' }}
                    placeholder="Additional observations, recommendations, or feedback…"
                    value={form.comments} onChange={e => set('comments', e.target.value)} />
                </div>

                {/* Submit button */}
                <button onClick={handleSubmit} disabled={submitting}
                  style={{ width: '100%', padding: '14px', background: submitting ? '#A0AEC0' : C.green, color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s', letterSpacing: '0.02em' }}
                  onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = '#108a00')}
                  onMouseLeave={(e) => !submitting && (e.currentTarget.style.background = C.green)}>
                  {submitting ? '⏳  Submitting…' : '✓  Submit Report'}
                </button>
              </div>
            </div>

            {/* ── Right: info sidebar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Selected intern card */}
              {selectedIntern ? (
                <div style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', background: C.green }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Selected Intern</div>
                  </div>
                  <div style={{ padding: '18px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: C.text, marginBottom: '4px' }}>{selectedIntern.student_name}</div>
                    <div style={{ fontSize: '12px', color: C.muted, marginBottom: '2px' }}>ID: {selectedIntern.university_id}</div>
                    <div style={{ fontSize: '12px', color: C.muted, marginBottom: '14px' }}>{selectedIntern.internship_title}</div>

                    <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                      <div style={{ flex: 1, background: C.bg, borderRadius: '8px', padding: '10px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: C.green }}>{selectedIntern.months_elapsed}</div>
                        <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Month{selectedIntern.months_elapsed !== 1 ? 's' : ''} in</div>
                      </div>
                      <div style={{ flex: 1, background: C.bg, borderRadius: '8px', padding: '10px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: C.green }}>{submittedMonths.length}</div>
                        <div style={{ fontSize: '10px', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Submitted</div>
                      </div>
                    </div>

                    {submittedMonths.length > 0 && (
                      <>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Submitted months</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {submittedMonths.map(m => (
                            <span key={m} style={{ padding: '3px 10px', background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: C.green }}>
                              Month {m} ✓
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '32px 24px', textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, margin: '0 auto 12px', background: C.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={28} color={C.muted} strokeWidth={1.5} />
                  </div>
                  <p style={{ color: C.muted, fontSize: '13px', margin: 0 }}>Select a student to see their details.</p>
                </div>
              )}

              {/* Info card */}
              <div style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>How it works</div>
                {[
                  ['📋', 'One report per month per intern'],
                  ['📄', 'Official PDF auto-generated instantly'],
                  ['🔔', 'Advisor notified automatically'],
                  ['📊', 'Progress tracked over full internship'],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '15px', flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: '13px', color: '#4A5568', lineHeight: '1.4' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ReportSubmission;