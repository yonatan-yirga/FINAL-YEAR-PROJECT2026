/**
 * Modern Report Submission - Premium Design
 * Step 1: Show students table with internship duration
 * Step 2: Click student to submit monthly report
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Users, TrendingUp, Award, CheckCircle, Calendar,
  Clock, FileText, Send, Search, Filter, ChevronRight, Building2,
  User, Mail, Phone, MapPin, Save, RefreshCw, AlertTriangle, X
} from 'lucide-react';
import Header from '../../components/common/Header';
import reportService from '../../services/reportService';
import './ReportSubmissionModern.css';

const PERF = [
  { value: 'EXCELLENT',         label: 'Excellent',          icon: <Award size={18} />, color: '#14a800', bg: '#e8f5e9' },
  { value: 'VERY_GOOD',         label: 'Very Good',          icon: <TrendingUp size={18} />, color: '#2563EB', bg: '#EFF6FF' },
  { value: 'GOOD',              label: 'Good',               icon: <CheckCircle size={18} />, color: '#D97706', bg: '#FFFBEB' },
  { value: 'NEEDS_IMPROVEMENT', label: 'Needs Improvement',  icon: <AlertTriangle size={18} />, color: '#DC2626', bg: '#FEF2F2' },
];

const ReportSubmissionModern = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = searchParams.get('student');

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
  
  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    assignment_id: '',
    report_month: '',
    attendance_rate: '',
    performance_rating: '',
    tasks_completed: '',
    comments: '',
    task_completion_score: 0,
    skill_development_score: 0,
    problem_solving_score: 0,
    professionalism_score: 0,
  });

  useEffect(() => {
    fetchInterns();
  }, []);

  useEffect(() => {
    if (studentId && interns.length > 0) {
      const intern = interns.find(i => String(i.id) === String(studentId));
      if (intern) {
        setForm(prev => ({ ...prev, assignment_id: studentId }));
      }
    }
  }, [studentId, interns]);

  const fetchInterns = async () => {
    setLoading(true);
    const res = await reportService.getActiveInterns();
    if (res.success) {
      setInterns(res.data.results || []);
    }
    setLoading(false);
  };

  const selectedIntern = interns.find(i => String(i.id) === String(form.assignment_id)) || null;
  const submittedMonths = selectedIntern?.reports_submitted || [];

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = 
      intern.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.university_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.internship_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const submitted = intern.reports_submitted?.length || 0;
    const totalMonths = intern.duration_months || intern.months_elapsed || 6;
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'pending') return matchesSearch && submitted < totalMonths;
    if (filterStatus === 'completed') return matchesSearch && submitted >= totalMonths;
    return matchesSearch;
  });

  const handleSelectStudent = (intern) => {
    const submitted = intern.reports_submitted?.length || 0;
    const totalMonths = intern.duration_months || intern.months_elapsed || 6;
    
    // Check if all reports are complete
    if (submitted >= totalMonths) {
      setError(`All reports for ${intern.student_name} have been completed (${submitted}/${totalMonths}). No more reports needed.`);
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setSearchParams({ student: intern.id });
    setForm(prev => ({ ...prev, assignment_id: intern.id }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSearchParams({});
    setForm({
      assignment_id: '',
      report_month: '',
      attendance_rate: '',
      performance_rating: '',
      tasks_completed: '',
      comments: '',
      task_completion_score: 0,
      skill_development_score: 0,
      problem_solving_score: 0,
      professionalism_score: 0,
    });
    setError('');
    setSuccess('');
  };

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const isSubmitted = (m) => submittedMonths.includes(m);

  const validate = () => {
    if (!form.assignment_id) return 'Select a student.';
    if (!form.report_month) return 'Select a report month.';
    if (isSubmitted(Number(form.report_month))) return `Month ${form.report_month} already submitted.`;
    if (!form.attendance_rate) return 'Enter the attendance rate.';
    const a = parseFloat(form.attendance_rate);
    if (isNaN(a) || a < 0 || a > 100) return 'Attendance must be 0–100.';
    if (!form.performance_rating) return 'Select a performance rating.';
    if (!form.tasks_completed.trim()) return 'Describe the tasks completed.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    const res = await reportService.submitMonthlyReport({
      assignment_id: Number(form.assignment_id),
      report_month: Number(form.report_month),
      attendance_rate: parseFloat(form.attendance_rate),
      performance_rating: form.performance_rating,
      tasks_completed: form.tasks_completed.trim(),
      comments: form.comments.trim(),
      task_completion_score: parseInt(form.task_completion_score) || 0,
      skill_development_score: parseInt(form.skill_development_score) || 0,
      problem_solving_score: parseInt(form.problem_solving_score) || 0,
      professionalism_score: parseInt(form.professionalism_score) || 0,
    });

    setSubmitting(false);

    if (res.success) {
      const isLastReport = (submittedMonths.length + 1) >= (selectedIntern.duration_months || 6);
      
      if (isLastReport) {
        setSuccess(`the student reporte are completeley send. All ${selectedIntern.duration_months} monthly reports finished.`);
      } else {
        setSuccess(`Month ${form.report_month} report submitted successfully! PDF generated and advisor notified.`);
      }
      
      // Refresh interns list
      await fetchInterns();
      // Reset form but keep student selected
      setForm(prev => ({
        ...prev,
        report_month: '',
        attendance_rate: '',
        performance_rating: '',
        tasks_completed: '',
        comments: '',
        task_completion_score: 0,
        skill_development_score: 0,
        problem_solving_score: 0,
        professionalism_score: 0,
      }));
      // Auto-clear success after 5s
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(res.error || 'Failed to submit report');
    }
  };

  // Show form if student is selected
  if (studentId && selectedIntern) {
    return (
      <div className="rsm-page">
        <Header title="Submit Monthly Report" subtitle={`Report for ${selectedIntern.student_name}`} />
        
        <div className="rsm-container">
          {/* Back Button */}
          <button onClick={handleBackToList} className="rsm-back-btn">
            <ArrowLeft size={18} />
            Back to Students List
          </button>

          {/* Alerts */}
          {error && (
            <div className="rsm-alert rsm-alert-error">
              <AlertTriangle size={20} />
              <span>{error}</span>
              <button onClick={() => setError('')} className="rsm-alert-close">
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div className="rsm-alert rsm-alert-success">
              <CheckCircle size={20} />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="rsm-alert-close">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="rsm-form-grid">
            {/* Left: Form */}
            <div className="rsm-form-card">
              <div className="rsm-form-header">
                <FileText size={24} />
                <div>
                  <h2>Monthly Progress Report</h2>
                  <p>Fill in the performance details for this month</p>
                </div>
              </div>

              <div className="rsm-form-body">
                {/* Month and Attendance */}
                <div className="rsm-form-row">
                  <div className="rsm-form-group">
                    <label>Report Month *</label>
                    <select 
                      value={form.report_month}
                      onChange={e => set('report_month', e.target.value)}
                      className="rsm-select"
                    >
                      <option value="">Select Month</option>
                      {Array.from({ length: selectedIntern.duration_months || 6 }, (_, i) => i + 1).map(m => {
                        const done = isSubmitted(m);
                        return (
                          <option key={m} value={m} disabled={done}>
                            Month {m} {done ? '✓ Submitted' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="rsm-form-group">
                    <label>Attendance Rate (%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="95.5"
                      value={form.attendance_rate}
                      onChange={e => set('attendance_rate', e.target.value)}
                      className="rsm-input"
                    />
                  </div>
                </div>

                {/* Performance Rating */}
                <div className="rsm-form-group">
                  <label>Performance Rating *</label>
                  <div className="rsm-rating-grid">
                    {PERF.map(opt => {
                      const selected = form.performance_rating === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => set('performance_rating', opt.value)}
                          className={`rsm-rating-btn ${selected ? 'selected' : ''}`}
                          style={{
                            borderColor: selected ? opt.color : '#e2e8f0',
                            background: selected ? opt.bg : '#fff'
                          }}
                        >
                          <span style={{ color: selected ? opt.color : '#64748b' }}>
                            {opt.icon}
                          </span>
                          <span style={{ color: selected ? opt.color : '#1e293b' }}>
                            {opt.label}
                          </span>
                          {selected && (
                            <span className="rsm-rating-check" style={{ background: opt.color }}>
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Performance Scores */}
                <div className="rsm-scores-section">
                  <div className="rsm-scores-header">
                    <TrendingUp size={20} />
                    <div>
                      <h3>Performance Evaluation Scores</h3>
                      <p>Rate each category from 0-100 (contributes 40% to final grade)</p>
                    </div>
                  </div>

                  <div className="rsm-scores-grid">
                    {[
                      { field: 'task_completion_score', label: 'Task Completion', icon: '✅' },
                      { field: 'skill_development_score', label: 'Skill Development', icon: '📚' },
                      { field: 'problem_solving_score', label: 'Problem Solving', icon: '🧩' },
                      { field: 'professionalism_score', label: 'Professionalism', icon: '👔' }
                    ].map(item => (
                      <div key={item.field} className="rsm-score-item">
                        <label>
                          <span className="rsm-score-icon">{item.icon}</span>
                          {item.label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={form[item.field]}
                          onChange={e => set(item.field, e.target.value)}
                          className="rsm-input rsm-input-score"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks Completed */}
                <div className="rsm-form-group">
                  <label>Tasks Completed This Month *</label>
                  <textarea
                    value={form.tasks_completed}
                    onChange={e => set('tasks_completed', e.target.value)}
                    placeholder="Describe the tasks, projects, and responsibilities completed by the intern this month..."
                    className="rsm-textarea"
                    rows="6"
                  />
                  <div className="rsm-char-count">
                    {form.tasks_completed.length} characters
                  </div>
                </div>

                {/* Comments */}
                <div className="rsm-form-group">
                  <label>
                    Additional Comments & Feedback
                    <span className="rsm-optional">(optional)</span>
                  </label>
                  <textarea
                    value={form.comments}
                    onChange={e => set('comments', e.target.value)}
                    placeholder="Additional observations, recommendations, or feedback..."
                    className="rsm-textarea"
                    rows="4"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rsm-submit-btn"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={20} className="rsm-spinning" />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Monthly Report
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Student Info */}
            <div className="rsm-sidebar">
              <div className="rsm-student-card">
                <div className="rsm-student-header">
                  <div className="rsm-student-avatar">
                    {selectedIntern.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{selectedIntern.student_name}</h3>
                    <p>{selectedIntern.university_id}</p>
                  </div>
                </div>

                <div className="rsm-student-info">
                  <div className="rsm-info-item">
                    <Building2 size={16} />
                    <span>{selectedIntern.internship_title}</span>
                  </div>
                  <div className="rsm-info-item">
                    <Calendar size={16} />
                    <span>{selectedIntern.months_elapsed} month{selectedIntern.months_elapsed !== 1 ? 's' : ''} in</span>
                  </div>
                  <div className="rsm-info-item">
                    <FileText size={16} />
                    <span style={{ fontWeight: '700', color: submittedMonths.length === (selectedIntern.duration_months || 6) ? '#14a800' : 'inherit' }}>
                      {submittedMonths.length} / {selectedIntern.duration_months || 6} reports submitted
                    </span>
                  </div>
                </div>

                {submittedMonths.length > 0 && (
                  <div className="rsm-submitted-months">
                    <h4>Submitted Months</h4>
                    <div className="rsm-month-badges">
                      {submittedMonths.map(m => (
                        <span key={m} className="rsm-month-badge">
                          Month {m} ✓
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rsm-info-card">
                <h4>📋 Report Guidelines</h4>
                <ul>
                  <li>One report per month per intern</li>
                  <li>Official PDF auto-generated</li>
                  <li>Advisor notified automatically</li>
                  <li>Progress tracked over full internship</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show students list
  return (
    <div className="rsm-page">
      <Header title="Monthly Report Submission" subtitle="Select a student to submit their monthly progress report" />
      
      <div className="rsm-container">
        {/* Back to Dashboard */}
        <button onClick={() => navigate('/company/dashboard')} className="rsm-back-btn">
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* Search and Filter Bar */}
        <div className="rsm-toolbar">
          <div className="rsm-search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, ID, or internship..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="rsm-search-input"
            />
          </div>

          <div className="rsm-filter-group">
            <Filter size={18} />
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="rsm-filter-select"
            >
              <option value="all">All Students ({interns.length})</option>
              <option value="pending">Pending Reports</option>
              <option value="completed">Up to Date</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rsm-loading">
            <RefreshCw size={48} className="rsm-spinning" />
            <p>Loading students...</p>
          </div>
        ) : filteredInterns.length === 0 ? (
          <div className="rsm-empty">
            <Users size={64} />
            <h3>No Students Found</h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search or filter criteria'
                : 'No active interns available for report submission'}
            </p>
          </div>
        ) : (
          <>
            {/* Show info alert for completed students */}
            {filteredInterns.some(intern => {
              const submitted = intern.reports_submitted?.length || 0;
              const totalMonths = intern.duration_months || intern.months_elapsed || 6;
              return submitted >= totalMonths;
            }) && (
              <div className="rsm-alert rsm-alert-info" style={{ marginBottom: '20px' }}>
                <CheckCircle size={20} />
                <span>
                  ✓ Some students have completed all their monthly reports. 
                  They are marked as "All Complete" and cannot receive additional reports.
                </span>
              </div>
            )}

            <div className="rsm-table-card">
            <div className="rsm-table-header">
              <h2>Active Interns ({filteredInterns.length})</h2>
              <p>Click on a student to submit their monthly report</p>
            </div>

            <div className="rsm-table-wrapper">
              <table className="rsm-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Internship</th>
                    <th>Duration</th>
                    <th>Reports</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterns.map(intern => {
                    const submitted = intern.reports_submitted?.length || 0;
                    const totalMonths = intern.duration_months || intern.months_elapsed || 6; // Get total internship duration
                    const isComplete = submitted >= totalMonths;
                    const isPending = submitted < totalMonths;
                    
                    return (
                      <tr 
                        key={intern.id}
                        onClick={() => handleSelectStudent(intern)}
                        className="rsm-table-row"
                      >
                        <td>
                          <div className="rsm-student-cell">
                            <div className="rsm-student-avatar-sm">
                              {intern.student_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="rsm-student-name">{intern.student_name}</div>
                              <div className="rsm-student-id">{intern.university_id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="rsm-internship-cell">
                            <Building2 size={16} />
                            <span>{intern.internship_title}</span>
                          </div>
                        </td>
                        <td>
                          <div className="rsm-duration-cell">
                            <Clock size={16} />
                            <span>{totalMonths} month{totalMonths !== 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td>
                          <div className="rsm-reports-cell">
                            <span className={`rsm-reports-count ${isComplete ? 'complete' : ''}`}>
                              {submitted}/{totalMonths}
                            </span>
                            <span className="rsm-reports-label">
                              {isComplete ? 'complete' : 'submitted'}
                            </span>
                          </div>
                        </td>
                        <td>
                          {isComplete ? (
                            <span className="rsm-status-badge complete">
                              ✓ All Complete
                            </span>
                          ) : (
                            <span className="rsm-status-badge pending">
                              ⏳ {totalMonths - submitted} Pending
                            </span>
                          )}
                        </td>
                        <td>
                          {isComplete ? (
                            <button className="rsm-action-btn rsm-action-btn-disabled" disabled>
                              <CheckCircle size={16} />
                              Completed
                            </button>
                          ) : (
                            <button className="rsm-action-btn">
                              Submit Report
                              <ChevronRight size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportSubmissionModern;
