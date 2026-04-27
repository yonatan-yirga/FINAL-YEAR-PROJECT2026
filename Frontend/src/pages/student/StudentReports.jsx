import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import reportService from '../../services/reportService';
import applicationService from '../../services/applicationService';
import './StudentReports.css';

/**
 * StudentReports Page (Real Design Implementation)
 */
const StudentReports = () => {
  const [activeInternship, setActiveInternship] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  
  const [formData, setFormData] = useState({
    report_month: '',
    tasks_performed: '',
    skills_learned: '',
    challenges_faced: '',
    solutions_applied: '',
    hours_worked: '',
    report_file: null
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Get active internship
      const appResult = await applicationService.getMyApplications('ACCEPTED');
      if (appResult.success && appResult.data) {
        const apps = appResult.data.results || appResult.data;
        if (apps.length > 0) {
          setActiveInternship(apps[0]);
        }
      }

      // 2. Get existing reports
      const reportsResult = await reportService.getStudentPersonalReports();
      if (reportsResult.success) {
        setReports(reportsResult.data.results || []);
      }
    } catch (error) {
      console.error('Data fetch failed:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'report_file') {
      setFormData(prev => ({ ...prev, report_file: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeInternship?.assignment_id) {
      setFeedback({ type: 'error', message: 'No active assignment found. Please ensure your internship is fully registered.' });
      return;
    }

    if (!formData.report_month) {
      setFeedback({ type: 'error', message: 'Please select a reporting month from the list above.' });
      return;
    }

    // Check if already submitted for this month
    if (reports.some(r => r.report_month === parseInt(formData.report_month))) {
      setFeedback({ type: 'error', message: `Report for Month ${formData.report_month} has already been submitted.` });
      return;
    }

    setSubmitting(true);
    
    // Validate that hours_worked is a valid number
    const hours = parseInt(formData.hours_worked);
    if (isNaN(hours) || hours <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid number for hours worked.' });
      setSubmitting(false);
      return;
    }

    const monthNum = parseInt(formData.report_month);
    const assignmentId = parseInt(activeInternship.assignment_id);

    if (isNaN(monthNum)) {
      setFeedback({ type: 'error', message: 'Invalid month selected.' });
      setSubmitting(false);
      return;
    }

    // Prepare submission data with explicit type casting
    const submissionData = {
      ...formData,
      report_month: monthNum,
      hours_worked: hours,
      assignment_id: assignmentId
    };

    const result = await reportService.submitStudentMonthlyReport(submissionData);

    if (result.success) {
      setFeedback({ type: 'success', message: 'Report submitted successfully! Your advisor has been notified.' });
      setFormData({
        report_month: '',
        tasks_performed: '',
        skills_learned: '',
        challenges_faced: '',
        solutions_applied: '',
        hours_worked: '',
        report_file: null
      });
      // Reset file input manually if needed
      const fileInput = document.getElementById('report_file');
      if (fileInput) fileInput.value = '';
      
      fetchInitialData(); // Refresh list and progress
    } else {
      setFeedback({ type: 'error', message: result.error });
    }
    setSubmitting(false);
  };

  // Progress Calculation (Option 1: Submitted / Total Required)
  const totalMonthsRequired = parseInt(activeInternship?.internship_duration) || 3;
  const reportsSubmittedCount = reports.length;
  const progressPercent = Math.min(100, Math.round((reportsSubmittedCount / totalMonthsRequired) * 100));

  // Status Logic
  const getStatus = () => {
    if (progressPercent >= 100) return { label: 'Completed', class: 'status-on-track' };
    if (progressPercent >= 70) return { label: 'On Track', class: 'status-on-track' };
    if (progressPercent >= 30) return { label: 'In Progress', class: 'status-in-progress' };
    return { label: 'Behind', class: 'status-behind' };
  };

  const status = getStatus();

  if (loading) {
    return (
      <div className="sr-root">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="si-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar title="Learning Progress & Reporting" />
        
        <main className="sr-root">
          <div className="sr-container">
            
            {/* 1. Progress Overview Section */}
            <div className="sr-progress-grid">
              <div className="sr-glass-card">
                <div className="sr-progress-header">
                  <span className="sr-progress-label">Internship Progress</span>
                  <span className="sr-progress-value">{progressPercent}%</span>
                </div>
                <div className="sr-progress-bar-bg">
                  <div className="sr-progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={ `sr-status-badge ${status.class}` }>{status.label}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {reportsSubmittedCount} of {totalMonthsRequired} Reports
                  </span>
                </div>
              </div>

              <div className="sr-glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '8px', fontSize: '20px' }}>🎯</div>
                <div>
                  <div className="sr-progress-label">Next Deadline</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>End of Month {reportsSubmittedCount + 1}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Required for certification</div>
                </div>
              </div>
            </div>

            {feedback.message && (
              <div className={`sr-glass-card`} style={{ 
                marginBottom: '20px', 
                background: feedback.type === 'success' ? '#e8f5e9' : '#fee',
                border: feedback.type === 'success' ? '1px solid #14a800' : '1px solid #ef4444',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px'
              }}>
                <span style={{ color: feedback.type === 'success' ? '#14a800' : '#ef4444', fontWeight: '600', fontSize: '14px' }}>
                  {feedback.type === 'success' ? '✓ ' : '✕ '}{feedback.message}
                </span>
                <button onClick={() => setFeedback({ type: '', message: '' })} style={{ background: 'none', border: 'none', color: feedback.type === 'success' ? '#14a800' : '#ef4444', cursor: 'pointer', fontSize: '20px', padding: '0 4px' }}>×</button>
              </div>
            )}

            {!activeInternship ? (
              <div className="sr-glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🚫</div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No Active Internship Found</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', fontSize: '14px' }}>
                  You need an approved internship and an assigned advisor to submit monthly reports.
                  Please check your application status.
                </p>
              </div>
            ) : (
              <div className="sr-main-grid">
                
                {/* 2. Report Form Section */}
                <section>
                  <div className="sr-glass-card">
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Submit Monthly Log</h3>
                    <form className="sr-form-section" onSubmit={handleSubmit}>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="sr-field-group" style={{ gridColumn: 'span 2' }}>
                          <label className="sr-label">Reporting Month (Select from available list)</label>
                          <div className="sr-month-selector-grid">
                            {[...Array(totalMonthsRequired)].map((_, i) => {
                              const m = i + 1;
                              const isSubmitted = reports.some(r => r.report_month === m);
                              const isSelected = parseInt(formData.report_month) === m;
                              
                              return (
                                <div 
                                  key={m}
                                  className={`sr-month-option ${isSubmitted ? 'submitted' : ''} ${isSelected ? 'selected' : ''}`}
                                  onClick={() => !isSubmitted && setFormData(prev => ({ ...prev, report_month: m }))}
                                >
                                  <div className="sr-month-num">{m}</div>
                                  <div className="sr-month-status">
                                    {isSubmitted ? 'SUBMITTED' : isSelected ? 'SELECTED' : 'AVAILABLE'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {/* Hidden input for validation */}
                          <input type="hidden" name="report_month" value={formData.report_month} required />
                        </div>
                        <div className="sr-field-group">
                          <label className="sr-label">Total Hours Worked</label>
                          <input 
                            type="number" 
                            name="hours_worked"
                            className="sr-input"
                            placeholder="e.g. 160"
                            value={formData.hours_worked}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="sr-field-group">
                        <label className="sr-label">1. Tasks Performed (Required)</label>
                        <textarea 
                          name="tasks_performed"
                          className="sr-textarea"
                          placeholder="Detail the technical tasks and responsibilities you handled..."
                          value={formData.tasks_performed}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="sr-field-group">
                        <label className="sr-label">2. Skills Gained (Required)</label>
                        <textarea 
                          name="skills_learned"
                          className="sr-textarea"
                          placeholder="What new tools, languages, or soft skills did you acquire?"
                          value={formData.skills_learned}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="sr-field-group">
                        <label className="sr-label">3. Challenges Faced (Required)</label>
                        <textarea 
                          name="challenges_faced"
                          className="sr-textarea"
                          placeholder="What obstacles did you encounter in your workflow?"
                          value={formData.challenges_faced}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="sr-field-group">
                        <label className="sr-label">4. Solutions Applied (Required)</label>
                        <textarea 
                          name="solutions_applied"
                          className="sr-textarea"
                          placeholder="How did you resolve the challenges mentioned above?"
                          value={formData.solutions_applied}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="sr-field-group">
                        <label className="sr-label">5. Supplemental Document (Optional)</label>
                        <div className="sr-file-upload" onClick={() => document.getElementById('report_file').click()}>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{formData.report_file ? formData.report_file.name : 'Click to upload PDF/DOC'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Max size 5MB</div>
                          <input 
                            type="file" 
                            id="report_file"
                            name="report_file"
                            hidden 
                            onChange={handleInputChange}
                            accept=".pdf,.doc,.docx"
                          />
                        </div>
                      </div>

                      <button type="submit" className="sr-submit-btn" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                    </form>
                  </div>
                </section>

                {/* 3. History Section */}
                <section>
                  <div className="sr-glass-card sr-history-card">
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Submission History</h3>
                    
                    {reports.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>📋</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No reports submitted yet.</p>
                      </div>
                    ) : (
                      <div className="sr-table-container">
                        <table className="sr-table">
                          <thead>
                            <tr>
                              <th>Month</th>
                              <th>Status</th>
                              <th>Score</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.map((report) => (
                              <tr key={report.id}>
                                <td style={{ fontWeight: '600' }}>Month {report.report_month}</td>
                                <td>
                                  <span className="sr-status-badge status-on-track">Submitted</span>
                                </td>
                                <td style={{ fontWeight: '600', color: '#6b7177' }}>Pending</td>
                                <td>
                                  <button className="sr-action-btn" title="View Details">👁️</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div style={{ marginTop: '20px', padding: '16px', background: '#f7f8f9', borderRadius: '8px' }}>
                      <div className="sr-progress-label" style={{ marginBottom: '8px' }}>Submission Tips</div>
                      <ul style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: '1.6', margin: 0 }}>
                        <li>Be specific about technical tasks.</li>
                        <li>Link challenges to the solutions you used.</li>
                        <li>Submissions cannot be edited after advisor review.</li>
                      </ul>
                    </div>
                  </div>
                </section>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentReports;
