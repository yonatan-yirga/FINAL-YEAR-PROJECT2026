/**
 * ActiveInternship Page
 * Student's live internship view — compact premium layout
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
  ArrowRight, Plus, RefreshCw, Eye, Briefcase
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

  const fetchActiveInternship = useCallback(async () => {
    try {
      setLoading(true);
      const result = await applicationService.getMyApplications('ACCEPTED');

      if (result.success) {
        const data = result.data.results || result.data;
        const accepted = Array.isArray(data) ? data : [];

        if (accepted.length > 0) {
          setInternshipData(accepted[0]);
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
    fetchCertificate();
  }, [fetchActiveInternship]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getDaysElapsed = (startDate) => {
    if (!startDate) return 0;
    try {
      const start = new Date(startDate);
      const now = new Date();
      const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      return Math.max(0, Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24)));
    } catch (e) {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="ai-page">
        <Header title="Active Internship" subtitle="Loading your internship details..." />
        <div className="ai-content">
          <div className="ai-loading-mini">
            <div className="ai-spinner-mini" />
            <span>Loading internship details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !internshipData) {
    return (
      <div className="ai-page">
        <Header title="Active Internship" />
        <div className="ai-content">
          <div className="ai-empty-premium">
            <div className="ai-empty-icon-ring">
              <GraduationCap size={32} strokeWidth={1.5} />
            </div>
            <h2 className="ai-empty-title">No Active Internship</h2>
            <p className="ai-empty-desc">You don't have an active internship yet. Apply to internships to get started on your professional journey!</p>
            <div className="ai-cta-group">
              <button className="ai-cta-btn-premium primary" onClick={() => navigate('/student/search-internships')}>
                <Search size={14} /> Scan Internships <ArrowRight size={14} />
              </button>
              <button className="ai-cta-btn-premium secondary" onClick={() => navigate('/student/applications')}>
                <Eye size={14} /> View Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let daysElapsed = getDaysElapsed(internshipData.start_date);
  const durationMonths = parseInt(internshipData.internship_duration) || 1;
  let totalDays = durationMonths * 30;
  
  const reportsSubmittedCount = Array.isArray(reports) ? reports.length : 0;
  const isReportsFinished = reportsSubmittedCount >= durationMonths && durationMonths > 0;

  let progressPct = 0;
  if (internshipData.student_internship_status === 'COMPLETED' || isReportsFinished) {
    progressPct = 100;
    daysElapsed = totalDays;
  } else if (totalDays > 0) {
    const timeProgress = Math.round((daysElapsed / totalDays) * 100);
    const reportProgress = Math.round((reportsSubmittedCount / durationMonths) * 100);
    progressPct = Math.min(100, Math.max(timeProgress, reportProgress));
    if (daysElapsed === 0 && new Date(internshipData.start_date).toDateString() === new Date().toDateString()) {
      progressPct = Math.max(progressPct, 1);
    }
  }
  progressPct = Math.min(100, Math.max(0, progressPct));

  const monthsElapsed = isReportsFinished ? durationMonths : Math.min(durationMonths, Math.max(reportsSubmittedCount, Math.floor(daysElapsed / 30)));
  const currentMonth = Math.min(durationMonths, monthsElapsed + 1);
  const advisorName = internshipData.advisor_name;
  const advisorEmail = internshipData.advisor_email;

  return (
    <div className="ai-page">
      <Header
        title="Active Internship"
        subtitle={`${internshipData.internship_title} @ ${internshipData.company_name}`}
      />

      <div className="ai-content">
        
        {/* Top Status & Progress Bar (Combined & Slim) */}
        <div className="ai-glass-card ai-top-dashboard">
          <div className="ai-status-widget">
            <div className="ai-status-row">
              <span className="ai-status-dot" />
              <span className="ai-status-text">
                {internshipData.student_internship_status === 'COMPLETED' ? 'Completed' : `Month ${currentMonth} / ${durationMonths}`}
              </span>
            </div>
            <span className="ai-days-badge">{daysElapsed} Days Active</span>
          </div>
          
          <div className="ai-progress-widget">
            <div className="ai-progress-header">
              <span className="ai-progress-label">Completion Progress</span>
              <span className="ai-progress-pct">{progressPct}%</span>
            </div>
            <div className="ai-progress-track">
              <div className="ai-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="ai-progress-stats">
              <span><strong>{monthsElapsed}</strong> mo completed</span>
              <span><strong>{reportsSubmittedCount}</strong> reports</span>
            </div>
          </div>
        </div>

        <div className="ai-layout-grid">
          
          {/* Main Left Column */}
          <div className="ai-main-col">
            
            {/* Combined Details & Contact */}
            <div className="ai-glass-card">
              <h3 className="ai-card-title">
                <div className="ai-premium-icon"><ClipboardList size={20} /></div>
                Sector Details & Contact
              </h3>
              <div className="ai-detail-grid">
                <div className="ai-info-block">
                  <span className="ai-info-label"><Briefcase /> Position</span>
                  <span className="ai-info-value">{internshipData.internship_title}</span>
                </div>
                <div className="ai-info-block">
                  <span className="ai-info-label"><Building2 /> Company</span>
                  <span className="ai-info-value">{internshipData.company_name}</span>
                </div>
                <div className="ai-info-block">
                  <span className="ai-info-label"><MapPin /> Location</span>
                  <span className="ai-info-value">{internshipData.internship_location || '—'}</span>
                </div>
                <div className="ai-info-block">
                  <span className="ai-info-label"><Calendar /> Timeline</span>
                  <span className="ai-info-value">{formatDate(internshipData.start_date)} – {formatDate(internshipData.end_date)}</span>
                </div>
                {internshipData.company_contact_name && (
                  <div className="ai-info-block">
                    <span className="ai-info-label"><UserCheck /> Contact Person</span>
                    <span className="ai-info-value">{internshipData.company_contact_name}</span>
                  </div>
                )}
                {internshipData.company_phone && (
                  <div className="ai-info-block">
                    <span className="ai-info-label"><Phone /> Phone</span>
                    <span className="ai-info-value">{internshipData.company_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Advisor Hub (Profile + Feedback) */}
            <div className="ai-glass-card">
              <h3 className="ai-card-title">
                <div className="ai-premium-icon"><MessageSquare size={20} /></div>
                Advisor Hub
              </h3>
              
              <div className="ai-advisor-header">
                <div className="ai-advisor-avatar">
                  {advisorName ? advisorName.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="ai-advisor-meta">
                  <span className="ai-advisor-name">{advisorName || 'Pending Assignment'}</span>
                  {advisorEmail && (
                    <a href={`mailto:${advisorEmail}`} className="ai-advisor-email">
                      <Mail size={10} /> {advisorEmail}
                    </a>
                  )}
                </div>
              </div>

              {feedbackLoading ? (
                <div className="ai-no-feedback">Loading feedback logs...</div>
              ) : feedbacks.length > 0 ? (
                <div className="ai-timeline">
                  {feedbacks.map((fb, idx) => (
                    <div key={fb.id || idx} className="ai-timeline-item">
                      <div className="ai-timeline-dot" />
                      <div className="ai-timeline-content">
                        <div className="ai-timeline-meta">
                          <span className="ai-timeline-date">{formatDate(fb.created_at)}</span>
                        </div>
                        <p className="ai-timeline-text">{fb.feedback_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ai-no-feedback">
                  No feedback transmissions recorded yet.
                </div>
              )}
            </div>

          </div>

          {/* Right Side Column */}
          <div className="ai-side-col">
            
            {/* Quick Actions */}
            <div className="ai-glass-card">
              <h3 className="ai-card-title">
                <div className="ai-premium-icon"><TrendingUp size={20} /></div>
                Quick Links
              </h3>
              <div className="ai-actions-group">
                <button className="ai-action-btn" onClick={() => navigate('/student/applications')}>
                  <div className="ai-action-icon"><Eye size={16} /></div> View Application Form
                </button>
                <button className="ai-action-btn" onClick={() => navigate('/student/reports')}>
                  <div className="ai-action-icon"><FileText size={16} /></div> Submit Monthly Report
                </button>
                <button className="ai-action-btn" onClick={() => navigate('/notifications')}>
                  <div className="ai-action-icon"><Bell size={16} /></div> Notification Center
                </button>
              </div>
            </div>

            {/* Certificate Ticket */}
            {certificateLoading && !certificate ? (
              <div className="ai-glass-card"><div className="ai-loading-mini"><div className="ai-spinner-mini" /></div></div>
            ) : certificate ? (
              <div className="ai-cert-ticket">
                <div className="ai-cert-header">
                  <div className="ai-cert-icon"><Award size={20} /></div>
                  <div>
                    <h4 className="ai-cert-title">Completion Certificate</h4>
                    <span className="ai-cert-status">{certificate.is_generated ? 'Ready' : 'Generating'}</span>
                  </div>
                </div>
                {certificate.is_generated && (
                  <button className="ai-cert-btn" onClick={handleDownloadCertificate} disabled={downloadingCert}>
                    {downloadingCert ? 'Downloading...' : <><Download size={14} /> Download PDF</>}
                  </button>
                )}
                <a href={`/verify-certificate/${certificate.verification_code}`} target="_blank" rel="noreferrer" className="ai-cert-link">
                  Verify Online →
                </a>
              </div>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveInternship;