import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ChevronLeft, 
  ArrowRight,
  Download,
  MessageSquare,
  BarChart3,
  Search,
  Maximize2
} from 'lucide-react';
import reportService from '../../services/reportService';
import Header from '../../components/common/Header';
import { API_URL } from '../../services/api';

const WorkflowStepper = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Artifact Review', icon: Search },
    { id: 2, label: 'Security Approval', icon: CheckCircle },
    { id: 3, label: 'Academic Scoring', icon: BarChart3 },
    { id: 4, label: 'Dept. Submission', icon: ArrowRight },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '16px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: currentStep >= s.id ? 1 : 0.3, transition: 'all 0.3s' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', 
              backgroundColor: currentStep >= s.id ? (currentStep === s.id ? '#f59e0b' : '#10b981') : 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', color: '#fff'
            }}>
              {currentStep > s.id ? <CheckCircle size={14} /> : s.id}
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: currentStep === s.id ? '#fff' : '#64748b' }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 12px' }}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

const EvaluationNode = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const scoringRef = React.useRef(null);
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('review');
  
  const [scores, setScores] = useState({
    technical: 0,
    academic: 0,
    quality: 0,
    growth: 0,
    soft_skills: 0
  });

  const [comments, setComments] = useState('');
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [studentMonthlyReports, setStudentMonthlyReports] = useState([]);

  // Elite Styles Node (Obsidian Theme)
  const S = {
    root: {
      minHeight: '100vh',
      backgroundColor: '#060B18',
      color: '#cbd5e1',
      fontFamily: "'Inter', sans-serif",
    },
    topBar: {
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '16px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    },
    container: {
      maxWidth: '1800px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badge: (bg, color) => ({
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      backgroundColor: bg,
      color: color,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }),
    card: {
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      overflow: 'hidden',
    },
    scoreBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      padding: '8px 24px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    workspace: {
      height: '800px',
      display: 'flex',
      flexDirection: 'column',
    },
    tabBtn: (active) => ({
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      backgroundColor: active ? '#f59e0b' : 'transparent',
      color: active ? '#fff' : '#64748b',
      transition: 'all 0.3s',
      boxShadow: active ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: '32px',
      padding: '32px',
    },
    input: {
      width: '100%',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      color: '#fff',
      fontSize: '14px',
      lineHeight: '1.6',
    }
  };

  useEffect(() => {
    fetchReportDetail();
  }, [id]);

  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      const res = await reportService.getFinalReportDetail(id);
      if (res.success && res.data) {
        setReport(res.data);
        if (res.data.criteria_scores) {
          setScores(res.data.criteria_scores);
        }
        setComments(res.data.advisor_evaluation || '');
        
        // Use either assignment_id or advisor_assignment_id based on API response
        const assignId = res.data.advisor_assignment_id || res.data.assignment_id;
        if (assignId) {
          fetchMonthlyReports(assignId);
        }
      } else {
        setError(res.error || 'Report data not found.');
      }
    } catch (err) {
      setError('An error occurred while fetching report details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReports = async (assignmentId) => {
    try {
      const [companyRes, studentRes] = await Promise.all([
        reportService.getAdvisorReports(assignmentId),
        reportService.getAdvisorStudentReports(assignmentId)
      ]);
      
      if (companyRes.success) {
        setMonthlyReports(companyRes.data.results || []);
      }
      if (studentRes.success) {
        setStudentMonthlyReports(studentRes.data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch monthly reports:', err);
    }
  };

  const handleScoreChange = (criteria, value) => {
    setScores(prev => ({ ...prev, [criteria]: parseInt(value) }));
  };

  const calculateAdvisorTotal = () => {
    return Object.values(scores).reduce((a, b) => a + b, 0);
  };

  const calculateFinalProjected = () => {
    if (!report) return 0;
    
    // Backend uses 40/30/30 weight:
    // Monthly Reports (40%) + Company Evaluation (30%) + Advisor Evaluation (30%)
    
    // 1. Calculate Monthly Average (placeholder until we have actual scores in monthly reports)
    // For now, if we have reports, we can average them or use a mock if they don't have scores yet.
    // However, the backend calculates this from the database.
    // For UI projection, we'll try to estimate or show the weights clearly.
    
    const monthly40 = (report?.avg_monthly_score || 0) * 0.4;
    const company30 = (report?.company_score || 0) * 0.3;
    const advisor30 = calculateAdvisorTotal() * 0.3;
    
    return monthly40 + company30 + advisor30;
  };

  const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const handleReviewAction = async (action) => {
    try {
      setSubmitting(true);
      const res = await reportService.advisorReviewStudentFinalReport(
        report.student_report.id, 
        action, 
        action === 'REQUEST_REVISIONS' ? revisionFeedback : ''
      );
      
      if (res.success) {
        await fetchReportDetail();
        if (action === 'REQUEST_REVISIONS') {
          setShowRevisionModal(false);
        } else {
          // Scroll to scoring section on approval
          setTimeout(() => {
            scoringRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Failed to process review action.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        advisor_evaluation: comments,
        advisor_score: calculateAdvisorTotal(),
        criteria_scores: scores
      };
      
      const res = await reportService.completeFinalReport(id, payload);
      if (res.success) {
        alert('Evaluation successfully committed and transmitted to Department Head.');
        navigate('/advisor/final-reports');
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Failed to submit final evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ ...S.root, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
        <div className="elite-loader"></div>
        <style>{`
          .elite-loader {
            width: 48px; height: 48px; border: 4px solid rgba(255,255,255,0.1);
            border-top-color: #f59e0b; border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ ...S.root, padding: '40px' }}>
        <div style={{ ...S.card, maxWidth: '600px', margin: '0 auto', padding: '40px', textAlign: 'center', border: '1px solid #dc2626' }}>
          <AlertCircle size={48} color="#dc2626" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Logic Node Failure</h2>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{error || 'The requested evaluation could not be synchronized.'}</p>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', color: '#fff', textDecoration: 'underline', fontWeight: '700' }}>
            Return to Strategic Overview
          </button>
        </div>
      </div>
    );
  }

  const studentReport = report?.student_report;

  return (
    <div style={S.root}>
      <style>{`
        .range-input {
          width: 100%; height: 6px; background: #1e293b; border-radius: 10px;
          appearance: none; outline: none; cursor: pointer;
        }
        .range-input::-webkit-slider-thumb {
          appearance: none; width: 18px; height: 18px; background: #f59e0b;
          border-radius: 50%; transition: scale 0.2s;
        }
        .range-input::-webkit-slider-thumb:hover { scale: 1.2; }
        
        @media (max-width: 1200px) {
          .strategic-grid { grid-template-columns: 1fr !important; }
          .side-col { grid-column: span 12 !important; }
        }
      `}</style>

      {/* Top Bar Navigation */}
      <div style={S.topBar}>
        <div style={S.container}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate(-1)} style={{ padding: '8px', background: 'transparent' }}>
              <ChevronLeft size={24} color="#94a3b8" />
            </button>
            <div style={{ height: '32px', width: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Strategic Evaluation Node</div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{report.student_name} <span style={{ color: '#475569', fontSize: '14px' }}>#{id}</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={S.scoreBox}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Company (50%)</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#f59e0b' }}>{report.company_score}/100</div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Advisor (50%)</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#3b82f6' }}>{calculateAdvisorTotal()}/100</div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ textAlign: 'center', minWidth: '40px' }}>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Weighted Total</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{calculateFinalProjected().toFixed(1)}%</div>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
              <div style={{ textAlign: 'center', minWidth: '40px' }}>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Grade</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{getLetterGrade(calculateFinalProjected())}</div>
              </div>
            </div>

            {studentReport?.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowRevisionModal(true)}
                  style={{ height: '48px', padding: '0 20px', borderRadius: '12px', background: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', border: '1px solid rgba(220, 38, 38, 0.2)', fontWeight: '700', fontSize: '13px' }}
                >
                  Request Revisions
                </button>
                <button 
                  onClick={() => handleReviewAction('APPROVE')}
                  style={{ height: '48px', padding: '0 24px', borderRadius: '12px', background: '#10b981', color: '#fff', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckCircle size={18} /> Approve Artifact
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ ...S.grid, className: 'strategic-grid' }} className="strategic-grid">
        
        {/* Left Column: Workspace (7/12) */}
        <div style={{ gridColumn: 'span 7' }} className="side-col">
          <div style={{ ...S.card, ...S.workspace }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setActiveTab('review')} style={S.tabBtn(activeTab === 'review')}>Student Report</button>
                <button onClick={() => setActiveTab('monthly')} style={S.tabBtn(activeTab === 'monthly')}>Monthly Progress</button>
              </div>
              <button style={{ background: 'transparent', color: '#64748b' }}><Maximize2 size={18} /></button>
            </div>

            <div style={{ flex: 1, backgroundColor: '#020617', overflow: 'hidden', position: 'relative' }}>
              {activeTab === 'review' ? (
                studentReport ? (
                  <div style={{ height: '100%', width: '100%' }}>
                    <iframe 
                      src={studentReport?.report_file ? `${studentReport.report_file.startsWith('http') ? '' : API_URL.replace('/api', '')}${studentReport.report_file}#toolbar=0` : ''} 
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      title="Student Report"
                    />
                    <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
                      <div style={{ color: '#f59e0b', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MessageSquare size={14} /> Student Executive Summary
                      </div>
                      <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>"{studentReport.summary}"</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                    <FileText size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Report Not Uploaded</h4>
                  </div>
                )
              ) : (
                <div style={{ height: '100%', padding: '32px', overflowY: 'auto' }}>
                  {monthlyReports.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                      <BarChart3 size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
                      <p>No monthly progress logs found for this assignment cycle.</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <BarChart3 color="#f59e0b" size={20} /> Performance Velocity Chart
                          </h4>
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                              <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div> Performance
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
                              <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div> Attendance
                            </div>
                          </div>
                        </div>

                        {/* Custom CSS Bar Chart */}
                        <div style={{ 
                          height: '240px', 
                          borderBottom: '2px solid rgba(255,255,255,0.05)', 
                          borderLeft: '2px solid rgba(255,255,255,0.05)',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-around',
                          padding: '0 20px 0 10px',
                          marginBottom: '40px'
                        }}>
                          {/* Y-Axis Labels */}
                          <div style={{ position: 'absolute', left: '-35px', top: '0', bottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px', color: '#475569', textAlign: 'right', width: '30px' }}>
                            <span>100%</span>
                            <span>75%</span>
                            <span>50%</span>
                            <span>25%</span>
                            <span>0%</span>
                          </div>

                          {monthlyReports.map((r, i) => {
                            const perfRatingMap = { 'EXCELLENT': 100, 'VERY_GOOD': 80, 'GOOD': 60, 'NEEDS_IMPROVEMENT': 40 };
                            const perfScore = perfRatingMap[r.performance_rating] || 0;
                            const attendScore = parseFloat(r.attendance_rate) || 0;

                            return (
                              <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '80px' }}>
                                <div style={{ display: 'flex', gap: '4px', height: '200px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                                  {/* Performance Bar */}
                                  <div style={{ 
                                    width: '12px', 
                                    height: `${perfScore}%`, 
                                    background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)', 
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 1s ease-out',
                                    position: 'relative'
                                  }}>
                                    {perfScore > 0 && <div className="chart-tooltip" style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{perfScore}%</div>}
                                  </div>
                                  {/* Attendance Bar */}
                                  <div style={{ 
                                    width: '12px', 
                                    height: `${attendScore}%`, 
                                    background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)', 
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 1s ease-out 0.2s',
                                    position: 'relative'
                                  }}>
                                    {attendScore > 0 && <div className="chart-tooltip" style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '900', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>{attendScore}%</div>}
                                  </div>
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>Month {r.report_month}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Summary Table */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Company Section */}
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Company Evaluation Logs</span>
                          </div>
                          {monthlyReports.map((r, i) => (
                            <div key={r.id} style={{ padding: '16px 20px', borderBottom: i === monthlyReports.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '20px' }}>
                              <div style={{ minWidth: '80px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#f59e0b', textTransform: 'uppercase' }}>Month {r.report_month}</div>
                                <div style={{ fontSize: '12px', color: '#fff', fontWeight: '700' }}>{parseFloat(r.attendance_rate)}% Att.</div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>{r.performance_label}</div>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{r.comments || 'No specific qualitative logs recorded.'}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Student Section */}
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase' }}>Student Self-Reports</span>
                          </div>
                          {studentMonthlyReports.map((r, i) => (
                            <div key={r.id} style={{ padding: '16px 20px', borderBottom: i === studentMonthlyReports.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '20px' }}>
                              <div style={{ minWidth: '80px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '900', color: '#3b82f6', textTransform: 'uppercase' }}>Month {r.report_month}</div>
                                <div style={{ fontSize: '12px', color: '#fff', fontWeight: '700' }}>{r.hours_worked} Hrs.</div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', color: '#fff', fontWeight: '600', marginBottom: '4px' }}>Tasks Performed</div>
                                <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineClamp: 2, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{r.tasks_performed}</p>
                                {r.report_file && (
                                  <a 
                                    href={`${r.report_file.startsWith('http') ? '' : API_URL.replace('/api', '')}${r.report_file}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '11px', color: '#3b82f6', textDecoration: 'underline', marginTop: '8px', display: 'block' }}
                                  >
                                    View Attachment
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Scoring (5/12) */}
        <div style={{ gridColumn: 'span 5' }} className="side-col" ref={scoringRef}>
          <div style={{ ...S.card, padding: '32px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)' }}></div>
            
            <WorkflowStepper currentStep={studentReport?.status === 'APPROVED' ? 3 : 2} />

            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChart3 color="#f59e0b" /> Digital Grading Infrastructure
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '32px' }}>
              Academic evaluation constitutes 50% of the aggregate result. Scoring is enabled upon artifact approval.
            </p>

            {(!studentReport || studentReport.status !== 'APPROVED') && (
              <div style={{ padding: '20px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', marginBottom: '32px', display: 'flex', gap: '12px' }}>
                <AlertCircle size={20} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Protocol Override</div>
                  <p style={{ fontSize: '11px', color: '#94a3b8' }}>The student artifact is missing or pending approval. You may override this requirement and finalize scoring based on available metrics.</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px', transition: 'all 0.4s' }}>
              {[
                { id: 'technical', label: 'Technical Proficiency', desc: 'Implementation depth and tech stack usage.' },
                { id: 'academic', label: 'Academic Alignment', desc: 'Application of academic theory to tasks.' },
                { id: 'quality', label: 'Document Standards', desc: 'Report structure and professional tone.' },
                { id: 'growth', label: 'Professional Orbit', desc: 'Observed progress across the duration.' },
                { id: 'soft_skills', label: 'Collaboration', desc: 'Communication and workspace autonomy.' }
              ].map(c => (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>{c.label}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{c.desc}</div>
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '18px', fontWeight: '900' }}>{scores[c.id]}<span style={{ fontSize: '10px', color: '#475569' }}>/20</span></div>
                  </div>
                  <input 
                    type="range" min="0" max="20" 
                    value={scores[c.id]} 
                    onChange={(e) => handleScoreChange(c.id, e.target.value)}
                    className="range-input"
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.1em' }}>Qualitative Assessment</div>
              <textarea 
                style={S.input}
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Declare professional findings regarding student performance..."
              />
            </div>

            <div style={{ padding: '24px', backgroundColor: 'rgba(245, 158, 11, 0.03)', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <div style={{ color: '#f59e0b', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>Total Weight</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Advisor contribution (50%)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontSize: '28px', fontWeight: '900' }}>{calculateFinalProjected().toFixed(1)}%</div>
                  <div style={{ color: '#475569', fontSize: '10px', fontWeight: '800' }}>AGGREGATE (40/30/30)</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm('This will finalize the grade and transmit the report to the Department Head for graduation processing. Proceed?')) {
                    handleFinalSubmit();
                  }
                }}
                disabled={submitting}
                style={{ width: '100%', height: '56px', backgroundColor: '#fff', color: '#060B18', borderRadius: '14px', fontWeight: '900', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? 'Transmitting to Dept...' : 'Commit & Send to Dept Head'}
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

          <div style={{ ...S.card, padding: '32px', marginTop: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={18} color="#3b82f6" /> Industry Context
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Company Assessment</div>
                <p style={{ fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic' }}>"{report.company_performance_assessment || 'No assessment provided.'}"</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Recommendation</div>
                  <div style={{ fontWeight: '800', color: '#10b981' }}>{report.company_recommendation || '—'}</div>
                </div>
                <div style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Industry Score</div>
                  <div style={{ fontWeight: '800', color: '#3b82f6' }}>{(report?.company_score || 0)}/100</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setShowRevisionModal(false)}></div>
          <div style={{ position: 'relative', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', width: '100%', maxWidth: '600px', padding: '40px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', backgroundColor: '#ef4444' }}></div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '16px' }}>Request Revisions</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>Declare the necessary tactical adjustments for the student report.</p>
            <textarea 
              style={{ ...S.input, marginBottom: '32px' }}
              rows={5}
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              placeholder="e.g. Expand on the architectural decisions and resolve nomenclature inconsistencies on page 10..."
            />
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setShowRevisionModal(false)} style={{ flex: 1, height: '56px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontWeight: '700' }}>Cancel</button>
              <button 
                onClick={() => handleReviewAction('REQUEST_REVISIONS')}
                style={{ flex: 1, height: '56px', borderRadius: '14px', background: '#dc2626', color: '#fff', fontWeight: '900', boxShadow: '0 8px 24px rgba(220, 38, 38, 0.3)' }}
              >
                Transmit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationNode;
