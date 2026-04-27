/**
 * ActiveInternship Page
 * Student's live internship view — company info, advisor, feedback timeline
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import applicationService from '../../services/applicationService';
import advisorService from '../../services/advisorService';
import reportService from '../../services/reportService';
import certificateService from '../../services/certificateService';
import { 
  GraduationCap, ClipboardList, Building2, UserCheck, 
  MessageSquare, Bell, FileText, Award, Link2, Download,
  Mail, Phone, MapPin, Calendar, TrendingUp, Search,
  ArrowRight, Plus, RefreshCw, Eye
} from 'lucide-react';
import './ActiveInternship.css';

const ActiveInternship = () => {
  const navigate = useNavigate();

  const [internshipData, setInternshipData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [reports, setReports] = useState([]);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [error, setError] = useState('');

  // ── Load active internship ─────────────────────────────────────────────────
  const fetchActiveInternship = useCallback(async () => {
    try {
      setLoading(true);
      const result = await applicationService.getMyApplications('ACCEPTED');

      if (result.success) {
        const data = result.data.results || result.data;
        const accepted = Array.isArray(data) ? data : [];

        if (accepted.length > 0) {
          const application = accepted[0];
          setInternshipData(application);

          // Fetch feedback and reports
          fetchFeedbacks();
          fetchReports();
        }
      } else {
        setError(result.error || 'Failed to load internship data');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load feedbacks for this student (student-accessible endpoint) ──────────
  const fetchFeedbacks = async () => {
    try {
      setFeedbackLoading(true);
      const result = await advisorService.getMyFeedback();
      if (result.success) {
        const data = result.data.results || result.data;
        setFeedbacks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await reportService.getStudentPersonalReports();
      if (res.success) {
        const data = res.data?.results || res.data || [];
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch reports", e);
    }
  };

  // ── Load certificate (if available) ────────────────────────────────────────
  const fetchCertificate = async () => {
    try {
      setCertificateLoading(true);
      const result = await certificateService.getMyCertificate();
      if (result.success && result.data) {
        setCertificate(result.data);
      }
    } catch (err) {
      console.error('Failed to load certificate:', err);
    } finally {
      setCertificateLoading(false);
    }
  };

  // ── Download certificate ───────────────────────────────────────────────────
  const handleDownloadCertificate = async () => {
    if (!certificate) return;
    try {
      setDownloadingCert(true);
      await certificateService.downloadCertificate(certificate.id);
    } catch (err) {
      console.error('Failed to download certificate:', err);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingCert(false);
    }
  };

  useEffect(() => {
    fetchActiveInternship();
    fetchCertificate(); // Check for certificate
  }, [fetchActiveInternship]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getDaysElapsed = (startDate) => {
    if (!startDate) return 0;
    try {
      const start = new Date(startDate);
      const now = new Date();
      
      // Calculate difference in calendar days using UTC to avoid DST/timezone issues
      const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diffDays = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (e) {
      console.error("Date parsing error:", e);
      return 0;
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="ai-page">
        <Header title="Active Internship" subtitle="Loading your internship details..." />
        <div className="ai-loading">
          <div className="ai-spinner" />
          <p>Loading internship details...</p>
        </div>
      </div>
    );
  }

  // ── No active internship ──────────────────────────────────────────────────
  if (error || !internshipData) {
    return (
      <div className="ai-page">
        <Header title="Active Internship" />
        <div className="ai-content">
          <div className="ai-empty-state">
            <div className="ai-empty-illustration">
              <div className="ai-empty-icon-container">
                <GraduationCap size={64} strokeWidth={1.5} />
              </div>
              <div className="ai-empty-particles">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
              </div>
            </div>
            
            <div className="ai-empty-content">
              <h2>No Active Internship</h2>
              <p>You don't have an active internship yet. Apply to internships to get started on your professional journey!</p>
              
              <div className="ai-empty-actions">
                <button
                  className="ai-cta-btn primary"
                  onClick={() => navigate('/student/search-internships')}
                >
                  <Search size={18} />
                  <span>Browse Internships</span>
                  <ArrowRight size={16} />
                </button>
                
                <button
                  className="ai-cta-btn secondary"
                  onClick={() => navigate('/student/applications')}
                >
                  <Eye size={18} />
                  <span>View Applications</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let daysElapsed = getDaysElapsed(internshipData.start_date);
  const durationMonths = parseInt(internshipData.internship_duration) || 1;
  let totalDays = durationMonths * 30;
  
  // Progress calculation
  const reportsSubmittedCount = Array.isArray(reports) ? reports.length : 0;
  const isReportsFinished = reportsSubmittedCount >= durationMonths && durationMonths > 0;

  let progressPct = 0;
  if (internshipData.student_internship_status === 'COMPLETED' || isReportsFinished) {
    progressPct = 100;
    daysElapsed = totalDays; // Show full duration as elapsed
  } else if (totalDays > 0) {
    const timeProgress = Math.round((daysElapsed / totalDays) * 100);
    const reportProgress = Math.round((reportsSubmittedCount / durationMonths) * 100);
    progressPct = Math.min(100, Math.max(timeProgress, reportProgress));

    // If it started today, show at least 1% for visual feedback
    if (daysElapsed === 0 && new Date(internshipData.start_date).toDateString() === new Date().toDateString()) {
      progressPct = Math.max(progressPct, 1);
    }
  }
  progressPct = Math.min(100, Math.max(0, progressPct));

  const monthsElapsed = isReportsFinished ? durationMonths : Math.min(durationMonths, Math.max(reportsSubmittedCount, Math.floor(daysElapsed / 30)));
  const remainingMonths = Math.max(0, durationMonths - monthsElapsed);
  const currentMonth = Math.min(durationMonths, monthsElapsed + 1);
  const daysInCurrentMonth = daysElapsed % 30;

  const advisorName = internshipData.advisor_name;
  const advisorEmail = internshipData.advisor_email;

  return (
    <div className="ai-page">
      <Header
        title="Active Internship"
        subtitle={`${internshipData.internship_title} @ ${internshipData.company_name}`}
      />

      <div className="ai-content">

        {/* Status Banner */}
        <div className="ai-status-banner">
          <div className="ai-status-left">
            <span className="ai-status-dot" />
            <span className="ai-status-text">
              {internshipData.student_internship_status === 'COMPLETED' 
                ? 'Internship Completed' 
                : `Month ${currentMonth} of ${durationMonths} In Progress`}
            </span>
          </div>
          <span className="ai-days-badge">{daysElapsed} days total</span>
        </div>

        {/* Progress Bar */}
        <div className="ai-progress-card">
          <div className="ai-progress-header">
            <span className="ai-progress-label">Overall Progress</span>
            <span className="ai-progress-pct">{progressPct}%</span>
          </div>
          <div className="ai-progress-track">
            <div className="ai-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="ai-progress-meta">
            <div className="ai-progress-stat">
              <span className="ai-stat-val">{monthsElapsed}</span>
              <span className="ai-stat-label">Months Completed</span>
            </div>
            <div className="ai-progress-stat">
              <span className="ai-stat-val">{remainingMonths}</span>
              <span className="ai-stat-label">Months Remaining</span>
            </div>
            <div className="ai-progress-stat">
              <span className="ai-stat-val">{daysElapsed}</span>
              <span className="ai-stat-label">Total Days</span>
            </div>
          </div>
        </div>

        <div className="ai-grid">

          {/* ── Left column ── */}
          <div className="ai-left">

            {/* Internship Details */}
            <div className="ai-card">
              <h3 className="ai-card-title">
                <ClipboardList size={20} />
                Internship Details
              </h3>
              <div className="ai-info-grid">
                <InfoRow label="Position"  value={internshipData.internship_title} />
                <InfoRow label="Company"   value={internshipData.company_name} />
                <InfoRow label="Location"  value={internshipData.internship_location || '—'} />
                <InfoRow label="Duration"  value={`${internshipData.internship_duration} months`} />
                <InfoRow label="Start Date" value={formatDate(internshipData.start_date)} />
                <InfoRow label="End Date"   value={formatDate(internshipData.end_date)} />
                <InfoRow label="Status"     value="Active" highlight />
              </div>
            </div>

            {/* Feedback Timeline */}
            <div className="ai-card">
              <div className="ai-card-title-row">
                <h3 className="ai-card-title">
                  <MessageSquare size={20} />
                  Advisor Feedback
                </h3>
                <span className="ai-badge-count">
                  {feedbackLoading ? '…' : `${feedbacks.length} messages`}
                </span>
              </div>

              {feedbackLoading ? (
                <div className="ai-no-feedback">
                  <p>Loading feedback...</p>
                </div>
              ) : feedbacks.length > 0 ? (
                <div className="ai-timeline">
                  {feedbacks.map((fb, idx) => (
                    <div key={fb.id || idx} className="ai-timeline-item">
                      <div className="ai-timeline-dot" />
                      <div className="ai-timeline-content">
                        <div className="ai-timeline-meta">
                          <span className="ai-timeline-author">
                            {fb.advisor_name || advisorName || 'Your Advisor'}
                          </span>
                          <span className="ai-timeline-date">
                            {formatDate(fb.created_at)}
                          </span>
                        </div>
                        <p className="ai-timeline-text">{fb.feedback_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ai-no-feedback">
                  <p>
                    {advisorName
                      ? 'No feedback yet. Your advisor will send feedback during your internship.'
                      : 'Your advisor will be assigned soon and can then send feedback.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="ai-right">

            {/* Advisor Card */}
            <div className="ai-card ai-card-highlight">
              <h3 className="ai-card-title">
                <UserCheck size={20} />
                Your Advisor
              </h3>
              {advisorName ? (
                <div className="ai-advisor-info">
                  <div className="ai-advisor-avatar">
                    {advisorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="ai-advisor-name">{advisorName}</div>
                    {advisorEmail && (
                      <a href={`mailto:${advisorEmail}`} className="ai-advisor-email">
                        <Mail size={14} style={{ marginRight: '6px' }} />
                        {advisorEmail}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="ai-no-feedback">
                  <p>Advisor not assigned yet. Your department will assign one soon.</p>
                </div>
              )}
            </div>

            {/* Company Contact */}
            <div className="ai-card">
              <h3 className="ai-card-title">
                <Building2 size={20} />
                Company Contact
              </h3>
              <div className="ai-info-grid">
                {internshipData.company_contact_name && (
                  <InfoRow label="Contact" value={internshipData.company_contact_name} />
                )}
                {internshipData.company_email && (
                  <InfoRow label="Email" value={internshipData.company_email} />
                )}
                {internshipData.company_phone && (
                  <InfoRow label="Phone" value={internshipData.company_phone} />
                )}
                {internshipData.company_address && (
                  <InfoRow label="Address" value={internshipData.company_address} />
                )}
              </div>
              <div className="ai-company-note">
                <MapPin size={16} />
                <span>Visit the company physically to report for your internship.</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="ai-card">
              <h3 className="ai-card-title">
                <TrendingUp size={20} />
                Quick Actions
              </h3>
              <div className="ai-actions">
                <button
                  className="ai-action-btn"
                  onClick={() => navigate('/student/applications')}
                >
                  <ClipboardList size={18} />
                  <span>View Application</span>
                </button>
                <button
                  className="ai-action-btn"
                  onClick={() => navigate('/student/reports')}
                >
                  <FileText size={18} />
                  <span>Monthly Reports</span>
                </button>
                <button
                  className="ai-action-btn ai-action-btn-secondary"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                </button>
              </div>
            </div>

            {/* Certificate Card (if available) */}
            {certificate && (
              <div className="ai-card ai-certificate-card">
                <div className="ai-certificate-header">
                  <div className="ai-certificate-icon">
                    <Award size={32} color="#15803D" />
                  </div>
                  <div>
                    <h3 className="ai-card-title" style={{ marginBottom: '4px' }}>
                      Your Certificate
                    </h3>
                    <p className="ai-certificate-subtitle">
                      Internship completion certificate
                    </p>
                  </div>
                </div>

                <div className="ai-certificate-details">
                  <div className="ai-certificate-info-row">
                    <span className="ai-certificate-label">Certificate ID</span>
                    <span className="ai-certificate-value">{certificate.certificate_id}</span>
                  </div>
                  <div className="ai-certificate-info-row">
                    <span className="ai-certificate-label">Issue Date</span>
                    <span className="ai-certificate-value">{formatDate(certificate.issue_date)}</span>
                  </div>
                  {certificate.performance_grade && (
                    <div className="ai-certificate-info-row">
                      <span className="ai-certificate-label">Grade</span>
                      <span className="ai-certificate-value ai-certificate-grade">
                        {certificate.performance_grade}
                      </span>
                    </div>
                  )}
                  <div className="ai-certificate-info-row">
                    <span className="ai-certificate-label">Status</span>
                    <span className="ai-certificate-status">
                      {certificate.is_generated ? '✓ Ready' : '⏳ Generating...'}
                    </span>
                  </div>
                </div>

                {certificate.is_generated ? (
                  <button
                    className="ai-certificate-download-btn"
                    onClick={handleDownloadCertificate}
                    disabled={downloadingCert}
                  >
                    {downloadingCert ? (
                      <>
                        <span className="ai-spinner-small"></span>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        <span>Download Certificate</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="ai-certificate-generating">
                    <span className="ai-spinner-small"></span>
                    Certificate is being generated...
                  </div>
                )}

                <button
                  className="ai-certificate-verify-btn"
                  onClick={() => window.open(`/verify-certificate/${certificate.verification_code}`, '_blank')}
                >
                  <Link2 size={18} />
                  <span>Verify Certificate Online</span>
                </button>
              </div>
            )}

            {/* Certificate Loading State */}
            {certificateLoading && !certificate && (
              <div className="ai-card">
                <div className="ai-no-feedback">
                  <p>Checking for certificate...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, highlight }) => (
  <div className="ai-info-row">
    <span className="ai-info-label">{label}</span>
    <span className={`ai-info-value ${highlight ? 'ai-info-highlight' : ''}`}>{value}</span>
  </div>
);

export default ActiveInternship;