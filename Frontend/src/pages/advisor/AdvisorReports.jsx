/**
 * AdvisorReports Page - Modern UI/UX Design
 * Beautiful interface for reviewing student reports
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import reportService from '../../services/reportService';
import advisorService from '../../services/advisorService';
import { 
  Users, FileText, Search, Filter, Download, Calendar,
  TrendingUp, Clock, CheckCircle, AlertCircle, Star,
  BarChart3, Eye, RefreshCw, ArrowLeft, User, Building2,
  Award, Target, Zap, BookOpen, MessageSquare
} from 'lucide-react';
import './AdvisorReports.css';

const PERFORMANCE_RATINGS = {
  EXCELLENT:         { color: '#15803D', bg: '#DCFCE7', label: 'Excellent', icon: Star },
  VERY_GOOD:         { color: '#0284C7', bg: '#E0F2FE', label: 'Very Good', icon: TrendingUp },
  GOOD:              { color: '#D97706', bg: '#FEF3C7', label: 'Good', icon: CheckCircle },
  NEEDS_IMPROVEMENT: { color: '#DC2626', bg: '#FEE2E2', label: 'Needs Improvement', icon: AlertCircle },
};

const AdvisorReports = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [studentReports, setStudentReports] = useState([]);
  const [activeTab, setActiveTab] = useState('company');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // Fetch students with retry logic
  const fetchStudents = useCallback(async (attempt = 0) => {
    setLoadingStudents(true);
    setError('');
    
    try {
      const response = await advisorService.getMyStudents({ active: 'true' });
      
      if (response.success) {
        const studentsData = response.data.results || response.data || [];
        setStudents(studentsData);
        setError('');
      } else {
        if (attempt < 2) {
          setTimeout(() => fetchStudents(attempt + 1), 700 * (attempt + 1));
          return;
        }
        setError(response.error || 'Failed to load students.');
      }
    } catch (err) {
      if (attempt < 2) {
        setTimeout(() => fetchStudents(attempt + 1), 700 * (attempt + 1));
        return;
      }
      setError('Failed to load students.');
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  // Fetch reports for selected student
  const fetchReports = useCallback(async () => {
    if (!selectedStudent) return;
    
    setLoadingReports(true);
    setReports([]);
    setStudentReports([]);
    
    try {
      const [companyRes, studentRes] = await Promise.all([
        reportService.getAdvisorReports(selectedStudent.id),
        reportService.getAdvisorStudentReports(selectedStudent.id)
      ]);

      if (companyRes.success) {
        setReports(companyRes.data.results || companyRes.data || []);
      }
      
      if (studentRes.success) {
        setStudentReports(studentRes.data.results || studentRes.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoadingReports(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    fetchStudents(0);
  }, [fetchStudents, retryKey]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.internship_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentReports = activeTab === 'company' ? reports : studentReports;
  const getPerformanceData = (rating) => PERFORMANCE_RATINGS[rating] || { 
    color: '#64748B', bg: '#F1F5F9', label: rating, icon: AlertCircle 
  };

  const handleDownloadAll = async () => {
    if (!selectedStudent) return;
    try {
      await reportService.downloadConsolidatedReports(
        selectedStudent.id, 
        `Reports_${selectedStudent.student_name.replace(/ /g, '_')}.pdf`
      );
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div className="ar-page">
      <Header 
        title="Student Reports" 
        subtitle="Review and monitor internship progress reports" 
      />

      <div className="ar-content">
        
        {/* Navigation Bar */}
        <div className="ar-nav-bar">
          <button 
            className="ar-back-btn"
            onClick={() => navigate('/advisor/dashboard')}
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
          
          {students.length > 0 && (
            <div className="ar-student-count">
              <Users size={16} />
              <span>{students.length} active student{students.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="ar-alert ar-alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button 
              className="ar-retry-btn"
              onClick={() => setRetryKey(k => k + 1)}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Main Layout */}
        <div className="ar-layout">
          
          {/* Students Sidebar */}
          <div className="ar-sidebar">
            <div className="ar-sidebar-header">
              <h3 className="ar-sidebar-title">
                <Users size={20} />
                My Students
              </h3>
              
              <div className="ar-search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ar-search-input"
                />
              </div>
            </div>

            <div className="ar-student-list">
              {loadingStudents ? (
                <div className="ar-loading-sidebar">
                  <div className="ar-spinner-small" />
                  <span>Loading students...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="ar-empty-sidebar">
                  <User size={32} />
                  <p>{searchTerm ? 'No matches found' : 'No active students'}</p>
                </div>
              ) : (
                filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className={`ar-student-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="ar-student-avatar">
                      {student.student_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    
                    <div className="ar-student-info">
                      <h4 className="ar-student-name">{student.student_name}</h4>
                      <p className="ar-student-role">{student.internship_title}</p>
                      <p className="ar-student-company">{student.company_name}</p>
                    </div>
                    
                    <div className="ar-student-indicator">
                      <div className="ar-status-dot" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="ar-main">
            {!selectedStudent ? (
              <div className="ar-empty-state">
                <div className="ar-empty-illustration">
                  <FileText size={64} />
                </div>
                <h2>Select a Student</h2>
                <p>Choose a student from the sidebar to view their internship reports and progress.</p>
              </div>
            ) : (
              <>
                {/* Student Header */}
                <div className="ar-student-header">
                  <div className="ar-student-details">
                    <div className="ar-student-avatar-large">
                      {selectedStudent.student_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    
                    <div className="ar-student-meta">
                      <h2 className="ar-student-title">{selectedStudent.student_name}</h2>
                      <div className="ar-student-subtitle">
                        <Building2 size={16} />
                        <span>{selectedStudent.internship_title} at {selectedStudent.company_name}</span>
                      </div>
                      
                      <div className="ar-student-stats">
                        <div className="ar-stat-item">
                          <Calendar size={14} />
                          <span>Started {new Date(selectedStudent.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="ar-stat-item">
                          <Clock size={14} />
                          <span>{selectedStudent.duration_days} days duration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ar-header-actions">
                    <button 
                      className="ar-download-btn"
                      onClick={handleDownloadAll}
                      disabled={loadingReports}
                    >
                      <Download size={18} />
                      <span>Download All Reports</span>
                    </button>
                  </div>
                </div>

                {/* Report Tabs */}
                <div className="ar-tabs">
                  <button
                    className={`ar-tab ${activeTab === 'company' ? 'active' : ''}`}
                    onClick={() => setActiveTab('company')}
                  >
                    <Building2 size={18} />
                    <span>Company Evaluations</span>
                    <span className="ar-tab-count">{reports.length}</span>
                  </button>
                  
                  <button
                    className={`ar-tab ${activeTab === 'student' ? 'active' : ''}`}
                    onClick={() => setActiveTab('student')}
                  >
                    <User size={18} />
                    <span>Student Reports</span>
                    <span className="ar-tab-count">{studentReports.length}</span>
                  </button>
                </div>

                {/* Reports Content */}
                <div className="ar-reports-content">
                  {loadingReports ? (
                    <div className="ar-loading-reports">
                      <div className="ar-spinner" />
                      <p>Loading reports...</p>
                    </div>
                  ) : currentReports.length === 0 ? (
                    <div className="ar-empty-reports">
                      <div className="ar-empty-icon">
                        {activeTab === 'company' ? <Building2 size={48} /> : <FileText size={48} />}
                      </div>
                      <h3>No Reports Available</h3>
                      <p>
                        No {activeTab === 'company' ? 'company evaluations' : 'student reports'} have been submitted yet.
                      </p>
                    </div>
                  ) : activeTab === 'company' ? (
                    <div className="ar-reports-grid">
                      {reports.map(report => {
                        const perfData = getPerformanceData(report.performance_rating);
                        const IconComponent = perfData.icon;
                        
                        return (
                          <div key={report.id} className="ar-report-card">
                            <div className="ar-report-header">
                              <div className="ar-report-title">
                                <h4>Month {report.report_month}</h4>
                                <div 
                                  className="ar-performance-badge"
                                  style={{ 
                                    color: perfData.color, 
                                    backgroundColor: perfData.bg 
                                  }}
                                >
                                  <IconComponent size={14} />
                                  <span>{perfData.label}</span>
                                </div>
                              </div>
                              
                              {report.pdf_url && (
                                <a 
                                  href={report.pdf_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="ar-pdf-btn"
                                >
                                  <Eye size={16} />
                                  <span>View PDF</span>
                                </a>
                              )}
                            </div>

                            <div className="ar-report-stats">
                              <div className="ar-stat-card">
                                <div className="ar-stat-value">{parseFloat(report.attendance_rate).toFixed(1)}%</div>
                                <div className="ar-stat-label">Attendance</div>
                              </div>
                              
                              <div className="ar-stat-card">
                                <div className="ar-stat-value">#{report.report_month}</div>
                                <div className="ar-stat-label">Report No.</div>
                              </div>
                              
                              <div className="ar-stat-card">
                                <div 
                                  className="ar-stat-value"
                                  style={{ color: perfData.color }}
                                >
                                  {perfData.label}
                                </div>
                                <div className="ar-stat-label">Performance</div>
                              </div>
                            </div>

                            <div className="ar-report-content">
                              <div className="ar-content-section">
                                <h5>
                                  <Target size={16} />
                                  Tasks Completed
                                </h5>
                                <p>{report.tasks_completed}</p>
                              </div>

                              {report.comments && (
                                <div className="ar-content-section">
                                  <h5>
                                    <MessageSquare size={16} />
                                    Company Comments
                                  </h5>
                                  <p>{report.comments}</p>
                                </div>
                              )}
                            </div>

                            <div className="ar-report-footer">
                              <div className="ar-report-date">
                                <Calendar size={14} />
                                <span>
                                  Submitted {new Date(report.submitted_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ar-reports-grid">
                      {studentReports.map(report => (
                        <div key={report.id} className="ar-report-card ar-student-report">
                          <div className="ar-report-header">
                            <div className="ar-report-title">
                              <h4>Month {report.report_month}</h4>
                              <div className="ar-student-badge">
                                <User size={14} />
                                <span>Student Submission</span>
                              </div>
                            </div>
                            
                            {report.report_file && (
                              <a 
                                href={report.report_file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ar-pdf-btn"
                              >
                                <Eye size={16} />
                                <span>View File</span>
                              </a>
                            )}
                          </div>

                          <div className="ar-report-content">
                            <div className="ar-content-section">
                              <h5>
                                <Target size={16} />
                                Tasks Performed
                              </h5>
                              <p>{report.tasks_performed}</p>
                            </div>

                            <div className="ar-content-grid">
                              <div className="ar-content-section">
                                <h5>
                                  <Zap size={16} />
                                  Skills Learned
                                </h5>
                                <p>{report.skills_learned}</p>
                              </div>
                              
                              <div className="ar-content-section">
                                <h5>
                                  <AlertCircle size={16} />
                                  Challenges Faced
                                </h5>
                                <p>{report.challenges_faced}</p>
                              </div>
                            </div>

                            {report.solutions_applied && (
                              <div className="ar-content-section">
                                <h5>
                                  <BookOpen size={16} />
                                  Solutions Applied
                                </h5>
                                <p>{report.solutions_applied}</p>
                              </div>
                            )}
                          </div>

                          <div className="ar-report-footer">
                            <div className="ar-report-date">
                              <Calendar size={14} />
                              <span>
                                Submitted {new Date(report.submitted_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            
                            {report.hours_worked && (
                              <div className="ar-hours-worked">
                                <Clock size={14} />
                                <span>{report.hours_worked} hours worked</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorReports;