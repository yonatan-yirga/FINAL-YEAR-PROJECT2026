/**
 * StudentsCompletion - Upwork-Inspired Design
 * Department head page: shows students with completed final reports,
 * allows "Mark as Completed" to issue certificate.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/common/Header';
import certificateService from '../../services/certificateService';
import reportService from '../../services/reportService';
import {
  Award, CheckCircle, AlertTriangle, Search, TrendingUp,
  FileCheck, Users, Shield, RefreshCw
} from 'lucide-react';
import './StudentsCompletion.css';

const StudentsCompletion = () => {
  const [reports, setReports] = useState([]);
  const [certs, setCerts] = useState({});   // keyed by student_name
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(null); // report id being processed
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [rRes, cRes] = await Promise.all([
      // Load all final reports that are submitted to department or completed
      reportService.getDepartmentFinalReports('SUBMITTED_TO_DEPARTMENT'),
      certificateService.getDepartmentCertificates(),
    ]);
    if (rRes.success) setReports(rRes.data.results || rRes.data || []);
    if (cRes.success) {
      const map = {};
      (cRes.data.results || cRes.data || []).forEach(c => {
        map[c.student_name] = c;
      });
      setCerts(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleMarkCompleted = async (report) => {
    if (!window.confirm(`Are you sure you want to issue the official certificate for ${report.student_name}? This action is permanent.`)) {
      return;
    }
    setIssuing(report.id);
    setError(''); 
    setSuccess('');
    const res = await certificateService.markStudentCompleted(report.id);
    if (res.success) {
      const certId = res.data?.certificate?.certificate_id || '✓';
      setSuccess(`Certificate issued: ${certId} for ${report.student_name}`);
      load();
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(res.error || 'Failed to issue certificate.');
    }
    setIssuing(null);
  };

  const alreadyCertified = (r) => !!certs[r.student_name];

  const filtered = reports.filter(r =>
    search.trim() === '' ||
    r.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = reports.filter(r => !alreadyCertified(r)).length;

  return (
    <div className="sc-page">
      <Header
        title="Student Completion & Certification"
        subtitle="Issue official certificates to students who have completed their internships"
      />
      
      <div className="sc-content">
        
        {/* Success Alert */}
        {success && (
          <div className="sc-alert sc-alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="sc-alert sc-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button 
              className="sc-retry-btn"
              onClick={load}
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="sc-stats-grid">
          <div className="sc-stat-card sc-stat-primary">
            <div className="sc-stat-icon sc-icon-green">
              <FileCheck size={18} />
            </div>
            <div className="sc-stat-body">
              <span className="sc-stat-label">Validated Candidates</span>
              <span className="sc-stat-value">{reports.length}</span>
            </div>
            <div className="sc-stat-trend">
              <TrendingUp size={14} />
            </div>
          </div>

          <div className="sc-stat-card">
            <div className="sc-stat-icon sc-icon-blue">
              <Award size={18} />
            </div>
            <div className="sc-stat-body">
              <span className="sc-stat-label">Credentialed</span>
              <span className="sc-stat-value">{Object.keys(certs).length}</span>
            </div>
          </div>

          <div className="sc-stat-card">
            <div className="sc-stat-icon sc-icon-yellow">
              <Users size={18} />
            </div>
            <div className="sc-stat-body">
              <span className="sc-stat-label">Pending Certification</span>
              <span className="sc-stat-value">{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="sc-filter-container">
          <div className="sc-filter-header">
            <h3 className="sc-filter-title">
              <Shield size={16} />
              Certificate Management
            </h3>
            <div className="sc-filter-actions">
              <button 
                onClick={load} 
                className="sc-refresh-btn"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>

          <div className="sc-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by student name or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sc-search-input"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="sc-loading">
            <div className="sc-spinner" />
            <p>Loading students...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="sc-empty">
            <div className="sc-empty-icon">
              <Award size={48} />
            </div>
            <h3>No Students Ready for Certification</h3>
            <p>
              Students appear here once their final report is fully completed by the advisor.
            </p>
          </div>
        )}

        {/* Student Cards */}
        {!loading && filtered.length > 0 && (
          <div className="sc-cards-grid">
            {filtered.map(r => {
              const certified = alreadyCertified(r);
              const certObj = certs[r.student_name];
              
              return (
                <div key={r.id} className={`sc-card ${certified ? 'certified' : ''}`}>
                  <div className="sc-card-header">
                    <div className="sc-student-info">
                      <h3 className="sc-student-name">{r.student_name}</h3>
                      <span className="sc-company-badge">{r.company_name}</span>
                    </div>
                    {certified && (
                      <div className="sc-certified-badge">
                        <CheckCircle size={14} />
                        Certified
                      </div>
                    )}
                  </div>

                  <div className="sc-card-meta">
                    <div className="sc-meta-item">
                      <span className="sc-meta-label">Grade:</span>
                      <span className="sc-meta-value">{r.grade_label || r.overall_grade || 'N/A'}</span>
                    </div>
                    <div className="sc-meta-item">
                      <span className="sc-meta-label">Advisor Submitted:</span>
                      <span className="sc-meta-value">
                        {r.advisor_submitted_at ? new Date(r.advisor_submitted_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {certified && certObj && (
                      <div className="sc-meta-item">
                        <span className="sc-meta-label">Certificate ID:</span>
                        <span className="sc-meta-value sc-cert-id">{certObj.certificate_id}</span>
                      </div>
                    )}
                  </div>

                  <div className="sc-card-footer">
                    {certified ? (
                      <div className="sc-status-complete">
                        <CheckCircle size={14} />
                        Certificate Issued
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkCompleted(r)}
                        disabled={issuing === r.id}
                        className="sc-issue-btn"
                      >
                        {issuing === r.id ? (
                          <>
                            <RefreshCw size={14} className="spinning" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Award size={14} />
                            Issue Certificate
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsCompletion;
