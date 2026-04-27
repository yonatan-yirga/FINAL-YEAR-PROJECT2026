/**
 * AdvisorEvaluationForm
 * Complete final evaluation form for advisors to assess students and send to department head
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import reportService from '../../services/reportService';

const AdvisorEvaluationForm = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    advisor_score: '',
    advisor_evaluation: '',
    criteria_scores: {
      technical_competency: '',
      professional_behavior: '',
      learning_attitude: '',
      communication_skills: '',
      problem_solving: ''
    }
  });

  const C = {
    navy: '#0F2D5E',
    purple: '#667EEA', 
    gold: '#C9A84C',
    green: '#059669',
    red: '#DC2626',
    border: '#E2E8F0',
    bg: '#F8FAFC',
    white: '#FFFFFF',
    text: '#1A202C',
    muted: '#718096',
  };

  const card = {
    background: C.white,
    borderRadius: '16px',
    border: `1px solid ${C.border}`,
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  };

  // Fetch report details
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await reportService.getFinalReportDetail(reportId);
        if (res.success) {
          setReport(res.data);
          // Pre-fill form if already submitted
          if (res.data.advisor_submitted_at) {
            setFormData({
              advisor_score: res.data.advisor_score || '',
              advisor_evaluation: res.data.advisor_evaluation || '',
              criteria_scores: res.data.criteria_scores || {
                technical_competency: '',
                professional_behavior: '',
                learning_attitude: '',
                communication_skills: '',
                problem_solving: ''
              }
            });
          }
        } else {
          setError(res.error || 'Failed to load report details.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  // Calculate total score from criteria
  const calculateTotalScore = () => {
    const scores = Object.values(formData.criteria_scores);
    const validScores = scores.filter(score => score !== '' && !isNaN(score));
    if (validScores.length === 0) return 0;
    
    const sum = validScores.reduce((acc, score) => acc + parseInt(score), 0);
    return Math.round(sum / validScores.length);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCriteriaChange = (criteria, value) => {
    setFormData(prev => ({
      ...prev,
      criteria_scores: {
        ...prev.criteria_scores,
        [criteria]: value
      }
    }));
  };

  // Submit evaluation
  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit this evaluation? This will send the final report to the Department Head for approval.')) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const totalScore = calculateTotalScore();
      const submitData = {
        ...formData,
        advisor_score: totalScore
      };

      const res = await reportService.completeFinalReport(reportId, submitData);
      if (res.success) {
        setSuccess('Evaluation submitted successfully! The report has been sent to the Department Head.');
        setTimeout(() => {
          navigate('/advisor/final-reports');
        }, 2000);
      } else {
        setError(res.error || 'Failed to submit evaluation.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  // Validation
  const isFormValid = () => {
    const hasAllCriteria = Object.values(formData.criteria_scores).every(score => 
      score !== '' && !isNaN(score) && score >= 0 && score <= 100
    );
    const hasEvaluation = formData.advisor_evaluation.trim().length >= 50;
    return hasAllCriteria && hasEvaluation;
  };

  const criteriaLabels = {
    technical_competency: 'Technical Competency & Skill Application',
    professional_behavior: 'Professional Behavior & Work Ethics',
    learning_attitude: 'Learning Attitude & Adaptability',
    communication_skills: 'Communication & Collaboration Skills',
    problem_solving: 'Problem Solving & Critical Thinking'
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        <Header title="Final Evaluation" subtitle="Loading evaluation details..." />
        <div style={{ textAlign: 'center', padding: '100px', color: C.muted }}>
          <div style={{ 
            width: '40px', height: '40px', border: '3px solid #E2E8F0', 
            borderTopColor: C.navy, borderRadius: '50%', margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading evaluation form...
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg }}>
        <Header title="Final Evaluation" subtitle="Error loading evaluation" />
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ 
            background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px',
            padding: '20px 24px', color: C.red, textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontWeight: '700', marginBottom: '8px' }}>Failed to Load Evaluation</div>
            <div style={{ marginBottom: '20px' }}>{error}</div>
            <button 
              onClick={() => navigate('/advisor/final-reports')}
              style={{
                background: C.navy, color: '#fff', border: 'none',
                padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700'
              }}
            >
              ← Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Custom Slider Styles */}
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${C.navy};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.2s;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${C.navy};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.2s;
        }
        
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        input[type="range"]:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          background: #9CA3AF;
        }
        
        input[type="range"]:disabled::-moz-range-thumb {
          cursor: not-allowed;
          background: #9CA3AF;
        }
      `}</style>
      
      <Header 
        title="Final Evaluation" 
        subtitle={`Complete evaluation for ${report?.student_name || 'Student'}`} 
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Success Message */}
        {success && (
          <div style={{ 
            background: '#ECFDF5', border: '1px solid #6EE7B7', borderRadius: '16px',
            padding: '20px 24px', color: C.green, marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Evaluation Submitted Successfully!</div>
              <div style={{ fontSize: '14px' }}>{success}</div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px',
            padding: '20px 24px', color: C.red, marginBottom: '24px',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div style={{ fontWeight: '600' }}>{error}</div>
          </div>
        )}

        {/* Student & Internship Overview */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              background: `linear-gradient(135deg, ${C.navy}, ${C.purple})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '24px', fontWeight: '800'
            }}>
              {report?.student_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: C.navy, marginBottom: '4px' }}>
                {report?.student_name}
              </div>
              <div style={{ color: C.muted, fontSize: '14px', marginBottom: '2px' }}>
                📍 {report?.internship_title} at {report?.company_name}
              </div>
              <div style={{ color: C.muted, fontSize: '12px' }}>
                Duration: {report?.internship_duration} | Department: {report?.department_name}
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div style={{ 
            background: '#F0F9FF', borderRadius: '12px', padding: '16px',
            border: '1px solid #BAE6FD', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0369A1', marginBottom: '4px' }}>
                Evaluation Status
              </div>
              <div style={{ fontSize: '12px', color: '#0EA5E9' }}>
                {report?.advisor_submitted_at 
                  ? `Submitted on ${new Date(report.advisor_submitted_at).toLocaleDateString()}`
                  : 'Ready for your evaluation'
                }
              </div>
            </div>
            <div style={{ 
              padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              background: report?.advisor_submitted_at ? '#ECFDF5' : '#FEF3C7',
              color: report?.advisor_submitted_at ? '#059669' : '#92400E'
            }}>
              {report?.advisor_submitted_at ? '✓ COMPLETED' : '⏳ PENDING'}
            </div>
          </div>
        </div>

        {/* Company Evaluation Summary */}
        {report?.company_submitted_at && (
          <div style={card}>
            <div style={{ 
              background: C.navy, borderRadius: '12px', padding: '16px 20px',
              marginBottom: '20px', color: '#fff'
            }}>
              <div style={{ fontWeight: '800', fontSize: '16px', marginBottom: '4px' }}>
                Company Evaluation Summary
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Submitted on {new Date(report.company_submitted_at).toLocaleDateString()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '8px' }}>
                  COMPANY SCORE
                </div>
                <div style={{ 
                  fontSize: '32px', fontWeight: '900', color: C.green,
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  {report.company_score}/100
                  <span style={{ fontSize: '14px', color: C.muted, fontWeight: '600' }}>
                    (30% weight)
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '8px' }}>
                  RECOMMENDATION
                </div>
                <div style={{ 
                  fontSize: '16px', fontWeight: '800',
                  color: report.company_recommendation === 'YES' ? C.green : 
                        report.company_recommendation === 'NO' ? C.red : '#D97706'
                }}>
                  {report.company_recommendation === 'YES' ? '✅ Recommended' :
                   report.company_recommendation === 'NO' ? '❌ Not Recommended' : '⚠️ Conditional'}
                </div>
              </div>
            </div>

            {report.company_performance_assessment && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: C.muted, marginBottom: '8px' }}>
                  COMPANY ASSESSMENT
                </div>
                <div style={{ 
                  background: '#F8FAFC', borderRadius: '8px', padding: '12px',
                  fontSize: '14px', color: C.text, lineHeight: '1.6'
                }}>
                  {report.company_performance_assessment}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advisor Evaluation Form */}
        <div style={card}>
          <div style={{ 
            background: `linear-gradient(135deg, ${C.purple}, ${C.gold})`, 
            borderRadius: '12px', padding: '20px', marginBottom: '24px', color: '#fff'
          }}>
            <div style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px' }}>
              Your Academic Evaluation
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              Assess the student's performance and provide your professional evaluation
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: C.navy, marginBottom: '16px' }}>
              Performance Criteria (0-100 points each)
            </div>
            
            {Object.entries(criteriaLabels).map(([key, label]) => (
              <div key={key} style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ 
                    fontSize: '14px', fontWeight: '700', 
                    color: C.text
                  }}>
                    {label}
                  </label>
                  <div style={{ 
                    fontSize: '18px', fontWeight: '900', 
                    color: formData.criteria_scores[key] >= 70 ? C.green : 
                          formData.criteria_scores[key] >= 50 ? C.gold : C.red,
                    minWidth: '70px', textAlign: 'right'
                  }}>
                    {formData.criteria_scores[key] || 0}/100
                  </div>
                </div>
                
                {/* Interactive Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.criteria_scores[key] || 0}
                  onChange={(e) => handleCriteriaChange(key, e.target.value)}
                  disabled={report?.advisor_submitted_at}
                  style={{
                    width: '100%',
                    height: '12px',
                    borderRadius: '6px',
                    outline: 'none',
                    background: `linear-gradient(to right, 
                      ${C.red} 0%, 
                      ${C.gold} 50%, 
                      ${C.green} 100%)`,
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    cursor: report?.advisor_submitted_at ? 'not-allowed' : 'pointer',
                    opacity: report?.advisor_submitted_at ? 0.5 : 1
                  }}
                />
                
                {/* Score Labels */}
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', 
                  fontSize: '11px', color: C.muted, marginTop: '6px',
                  fontWeight: '600'
                }}>
                  <span>0 - Poor</span>
                  <span>50 - Average</span>
                  <span>100 - Excellent</span>
                </div>
              </div>
            ))}

            {/* Calculated Total Score */}
            <div style={{ 
              background: '#F0FDF4', borderRadius: '12px', padding: '16px',
              border: '2px solid #BBF7D0', marginTop: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#059669' }}>
                    Calculated Advisor Score
                  </div>
                  <div style={{ fontSize: '12px', color: '#16A34A' }}>
                    Average of all criteria (30% of final grade)
                  </div>
                </div>
                <div style={{ 
                  fontSize: '28px', fontWeight: '900', color: '#059669'
                }}>
                  {calculateTotalScore()}/100
                </div>
              </div>
            </div>
          </div>

          {/* Written Evaluation */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block', fontSize: '16px', fontWeight: '800', 
              color: C.navy, marginBottom: '12px'
            }}>
              Comprehensive Academic Evaluation
            </label>
            <div style={{ fontSize: '12px', color: C.muted, marginBottom: '12px' }}>
              Provide a detailed assessment of the student's academic performance, learning outcomes, 
              and professional development during the internship. Minimum 50 characters required.
            </div>
            <textarea
              value={formData.advisor_evaluation}
              onChange={(e) => handleInputChange('advisor_evaluation', e.target.value)}
              placeholder="Enter your comprehensive evaluation of the student's performance, learning outcomes, professional growth, and recommendations..."
              disabled={report?.advisor_submitted_at}
              style={{
                width: '100%', minHeight: '150px', padding: '16px', borderRadius: '12px',
                border: `2px solid ${C.border}`, fontSize: '14px', lineHeight: '1.6',
                outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                background: report?.advisor_submitted_at ? '#F9FAFB' : C.white
              }}
            />
            <div style={{ 
              fontSize: '12px', color: C.muted, marginTop: '8px',
              display: 'flex', justifyContent: 'space-between'
            }}>
              <span>
                {formData.advisor_evaluation.length >= 50 ? '✓' : '⚠️'} 
                {formData.advisor_evaluation.length < 50 ? ` ${50 - formData.advisor_evaluation.length} more characters needed` : ' Sufficient detail provided'}
              </span>
              <span>{formData.advisor_evaluation.length} characters</span>
            </div>
          </div>

          {/* Submit Button */}
          {!report?.advisor_submitted_at && (
            <div style={{ 
              background: '#F8FAFC', borderRadius: '12px', padding: '20px',
              border: '2px dashed #E2E8F0', textAlign: 'center'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: C.navy, marginBottom: '8px' }}>
                Ready to Submit?
              </div>
              <div style={{ fontSize: '14px', color: C.muted, marginBottom: '20px' }}>
                This evaluation will be sent to the Department Head for final approval and certificate generation.
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || submitting}
                style={{
                  padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '800',
                  background: isFormValid() && !submitting ? C.green : '#9CA3AF',
                  color: '#fff', border: 'none', cursor: isFormValid() && !submitting ? 'pointer' : 'not-allowed',
                  boxShadow: isFormValid() && !submitting ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none',
                  transition: 'all 0.2s', minWidth: '200px'
                }}
              >
                {submitting ? '📤 Submitting...' : '📋 Submit Final Evaluation'}
              </button>
              
              {!isFormValid() && (
                <div style={{ 
                  fontSize: '12px', color: C.red, marginTop: '12px', fontWeight: '600'
                }}>
                  Please complete all criteria scores and provide a detailed evaluation (min 50 characters)
                </div>
              )}
            </div>
          )}

          {/* Already Submitted */}
          {report?.advisor_submitted_at && (
            <div style={{ 
              background: '#ECFDF5', borderRadius: '12px', padding: '20px',
              border: '1px solid #6EE7B7', textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: C.green, marginBottom: '8px' }}>
                Evaluation Submitted Successfully
              </div>
              <div style={{ fontSize: '14px', color: '#16A34A', marginBottom: '16px' }}>
                Submitted on {new Date(report.advisor_submitted_at).toLocaleDateString()} - 
                Report sent to Department Head for approval
              </div>
              <button
                onClick={() => navigate('/advisor/final-reports')}
                style={{
                  background: C.navy, color: '#fff', border: 'none',
                  padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700'
                }}
              >
                ← Back to Reports
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorEvaluationForm;