import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  FileSearch,
  MessageSquare,
  Info
} from 'lucide-react';
import reportService from '../../services/reportService';
import internshipService from '../../services/internshipService';

const StudentFinalSubmission = () => {
  const [activeInternship, setActiveInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reportFile, setReportFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [existingReport, setExistingReport] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchInternshipData();
  }, []);

  const fetchInternshipData = async () => {
    try {
      setLoading(true);
      const res = await internshipService.getActiveInternship();
      if (res.success && res.data) {
        setActiveInternship(res.data);
        // Check if report already exists
        if (res.data.student_final_report) {
          setExistingReport(res.data.student_final_report);
          setSummary(res.data.student_final_report.summary || '');
        }
      }
    } catch (err) {
      setError('Failed to load internship data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setReportFile(file);
      setError(null);
    } else {
      setError('Please upload a valid PDF file.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reportFile && !existingReport) {
      setError('Please select a report file.');
      return;
    }
    if (!summary.trim()) {
      setError('Please provide a brief summary.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('assignment_id', activeInternship.id);
      if (reportFile) {
        formData.append('report_file', reportFile);
      }
      formData.append('summary', summary);

      const res = await reportService.submitStudentFinalReport(formData);
      if (res.success) {
        setSuccess(true);
        fetchInternshipData();
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!activeInternship) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-8">
        <div className="max-w-4xl mx-auto bg-slate-900/50 rounded-3xl border border-white/10 p-12 text-center">
          <FileSearch size={64} className="mx-auto text-slate-500 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">No Active Internship</h2>
          <p className="text-slate-400">You must be in an active internship to submit a final report.</p>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'PENDING':
        return { 
          icon: <Clock className="text-amber-500" />, 
          label: 'Pending Advisor Review', 
          color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
        };
      case 'APPROVED':
        return { 
          icon: <CheckCircle className="text-emerald-500" />, 
          label: 'Approved by Advisor', 
          color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
        };
      case 'REVISIONS_REQUIRED':
        return { 
          icon: <AlertCircle className="text-rose-500" />, 
          label: 'Revisions Required', 
          color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
        };
      default:
        return { 
          icon: <Clock className="text-slate-500" />, 
          label: status, 
          color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' 
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#060B18] text-slate-200 font-['Inter',sans-serif] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-amber-500 font-bold tracking-widest text-xs uppercase mb-3">
              <span className="w-8 h-[2px] bg-amber-500"></span>
              Strategic Submission Port
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Final <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Internship Report</span>
            </h1>
            <p className="text-slate-400 mt-4 text-lg max-w-2xl">
              Consolidate your technical achievements and professional growth into your final academic artifact. 
              This report contributes to 50% of your final evaluation.
            </p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[280px]">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Current Internship</div>
            <div className="text-lg font-bold text-white mb-1">{activeInternship.internship?.title || 'Active Role'}</div>
            <div className="text-slate-400 text-sm">{activeInternship.internship?.company?.company_name}</div>
          </div>
        </div>

        {/* Status Tracker if report exists */}
        {existingReport && (
          <div className={`mb-10 rounded-2xl border p-6 flex flex-col md:flex-row items-center gap-6 ${getStatusDisplay(existingReport.status).color}`}>
            <div className="bg-white/10 p-4 rounded-xl">
              {getStatusDisplay(existingReport.status).icon}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">Artifact Status</div>
              <div className="text-xl font-bold">{getStatusDisplay(existingReport.status).label}</div>
              <div className="mt-1 text-sm opacity-80">Submitted on {new Date(existingReport.submitted_at).toLocaleDateString()}</div>
            </div>
            
            {existingReport.status === 'REVISIONS_REQUIRED' && (
              <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-sm">
                  <MessageSquare size={16} /> Advisor Feedback
                </div>
                <p className="text-sm italic">"{existingReport.advisor_feedback}"</p>
              </div>
            )}
          </div>
        )}

        {/* Submission Form / View Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Guidelines & Resources */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Info className="text-amber-500" /> Guidelines
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  Format your report as a comprehensive technical document (PDF only).
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  Include system architecture, technical challenges, and learning outcomes.
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  The advisor will review this document against your monthly progress logs.
                </li>
                <li className="flex gap-3 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  Wait for advisor approval before your final evaluation can be triggered.
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Submission Form */}
          <div className="lg:col-span-2">
            {(!existingReport || existingReport.status === 'REVISIONS_REQUIRED') ? (
              <form onSubmit={handleSubmit} className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10">
                <div className="space-y-8">
                  {/* File Upload Zone */}
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Report Artifact (PDF)
                    </label>
                    <div className={`relative group transition-all duration-500 ${reportFile ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/30'} border-2 border-dashed rounded-3xl overflow-hidden`}>
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <div className="p-12 text-center pointer-events-none">
                        <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${reportFile ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>
                          {reportFile ? <CheckCircle size={40} /> : <Upload size={40} />}
                        </div>
                        <div className="text-xl font-bold text-white mb-2">
                          {reportFile ? reportFile.name : 'Drop your final report here'}
                        </div>
                        <p className="text-slate-500 text-sm">
                          Drag and drop or click to browse. Max size 20MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Achievements Summary */}
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Strategic Summary
                    </label>
                    <textarea 
                      rows={6}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="High-level overview of your internship achievements and core technical contribution..."
                      className="w-full bg-slate-900/60 border border-white/10 rounded-2xl p-6 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 transition-all text-lg leading-relaxed"
                    />
                  </div>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-center gap-4 text-rose-500">
                      <AlertCircle size={20} />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full h-16 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-amber-500/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
                        Deploying Artifact...
                      </div>
                    ) : (
                      <>Commit Final Submission <ArrowRight size={22} /></>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8">
                  <CheckCircle size={48} className="text-emerald-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Report Locked</h3>
                <p className="text-slate-400 text-lg max-w-lg mb-10 leading-relaxed">
                  Your final report has been submitted and is currently locked for academic review. 
                  You will be notified once the advisor has completed the evaluation.
                </p>
                <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 text-left">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={14} /> Submission Metadata
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-slate-400 text-sm mb-1 uppercase tracking-tighter font-semibold">Summary</div>
                      <div className="text-white line-clamp-3 italic">"{existingReport.summary}"</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-sm mb-1 uppercase tracking-tighter font-semibold">Artifact</div>
                      <a 
                        href={`${process.env.REACT_APP_API_URL || ''}${existingReport.report_file}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-amber-500 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        View PDF Submission <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFinalSubmission;
