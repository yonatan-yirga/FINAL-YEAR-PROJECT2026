/**
 * Add Advisor Page - Upwork-Inspired Design
 * Department Head can register new advisors
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import departmentService from '../../services/departmentService';
import {
  UserCheck, Mail, Phone, IdCard, ArrowLeft, Save, AlertTriangle,
  CheckCircle, RefreshCw, User, Building2, Download
} from 'lucide-react';
import './AddAdvisor.css';

const AddAdvisor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    staff_id: '',
    max_students: 15,
  });

  // Active tab state: 'single' or 'bulk'
  const [activeTab, setActiveTab] = useState('single');
  
  // Bulk upload state
  const [file, setFile] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.xlsx') && !droppedFile.name.endsWith('.xls')) {
        setError('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }
      setFile(droppedFile);
      setError('');
    }
  };

  const downloadTemplate = () => {
    // Basic CSV template (Excel can open this)
    const headers = 'Full Name,Email,Phone Number,Staff ID,Max Students\n';
    const sampleRow = 'Dr. John Doe,john.doe@university.edu,+251 911 223344,STAFF-001,15\n';
    const blob = new Blob([headers + sampleRow], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'advisor_registration_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setUploadSummary(null);

    try {
      const response = await departmentService.bulkAddAdvisors(file);

      if (response.success) {
        setSuccess(response.data.message);
        setUploadSummary({
          created: response.data.created_count,
          errors: response.data.errors
        });
        setFile(null);
      } else {
        setError(response.error || 'Failed to bulk register advisors');
        if (response.details && response.details.length > 0) {
          setUploadSummary({
            created: 0,
            errors: response.details
          });
        }
      }
    } catch (err) {
      setError('An error occurred during bulk registration');
      console.error('Bulk registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.full_name || !formData.email || !formData.phone_number || !formData.staff_id) {
      setError('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await departmentService.addAdvisor(formData);

      if (response.success) {
        setSuccess(`Advisor ${formData.full_name} has been successfully registered!`);
        
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone_number: '',
          staff_id: '',
          max_students: 15,
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/department/advisors');
        }, 2000);
      } else {
        setError(response.error || 'Failed to register advisor');
      }
    } catch (err) {
      setError('An error occurred while registering advisor');
      console.error('Error registering advisor:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aa-page">
      <Header 
        title="Register Advisors" 
        subtitle="Add advisors to your department individually or in bulk"
      />

      <div className="aa-content">
        {/* Back Button */}
        <button onClick={() => navigate('/department/advisors')} className="aa-back-button">
          <ArrowLeft size={16} />
          Back to Advisors
        </button>

        {/* Tab Selection */}
        <div className="aa-tabs">
          <button 
            className={`aa-tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => { setActiveTab('single'); setError(''); setSuccess(''); setUploadSummary(null); }}
          >
            <User size={16} />
            Single Registration
          </button>
          <button 
            className={`aa-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bulk'); setError(''); setSuccess(''); setUploadSummary(null); }}
          >
            <Download size={16} />
            Bulk Upload (Excel)
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="aa-alert aa-alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="aa-alert aa-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="aa-container">
          {/* Info Card */}
          <div className="aa-info-card">
            <div className="aa-info-icon">
              <UserCheck size={24} />
            </div>
            <div className="aa-info-content">
              <h3>Advisor Registration</h3>
              <p>
                {activeTab === 'single' 
                  ? "Register a new advisor individually by filling out the form below."
                  : "Register multiple advisors at once by uploading an Excel file with their details."}
                {" "}The advisor will receive login credentials via email and can immediately start supervising students.
              </p>
            </div>
          </div>

          {/* Registration Content */}
          <div className="aa-form-card">
            <div className="aa-form-header">
              {activeTab === 'single' ? <User size={20} /> : <Download size={20} />}
              <div>
                <h3>{activeTab === 'single' ? 'Advisor Information' : 'Excel File Upload'}</h3>
                <p>{activeTab === 'single' ? 'Enter the advisor\'s details below' : 'Upload your advisor list in .xlsx or .xls format'}</p>
              </div>
            </div>

            {activeTab === 'single' ? (
              <form onSubmit={handleSubmit} className="aa-form">
                <div className="aa-form-grid">
                  {/* Full Name */}
                  <div className="aa-form-group aa-form-group-full">
                    <label>
                      <User size={14} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="aa-form-group">
                    <label>
                      <Mail size={14} />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="advisor@university.edu"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="aa-form-group">
                    <label>
                      <Phone size={14} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="+251 912 345 678"
                      required
                    />
                  </div>

                  {/* Staff ID */}
                  <div className="aa-form-group">
                    <label>
                      <IdCard size={14} />
                      Staff ID *
                    </label>
                    <input
                      type="text"
                      name="staff_id"
                      value={formData.staff_id}
                      onChange={handleInputChange}
                      placeholder="STAFF-2024-001"
                      required
                    />
                  </div>

                  {/* Max Students */}
                  <div className="aa-form-group">
                    <label>
                      <Building2 size={14} />
                      Maximum Students
                    </label>
                    <input
                      type="number"
                      name="max_students"
                      value={formData.max_students}
                      onChange={handleInputChange}
                      min="1"
                      max="50"
                      placeholder="15"
                    />
                    <span className="aa-form-hint">
                      Maximum number of students this advisor can supervise
                    </span>
                  </div>
                </div>

                <div className="aa-form-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/department/advisors')}
                    className="aa-button aa-button-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="aa-button aa-button-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="spinning" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Register Advisor
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="aa-bulk-section">
                <button type="button" onClick={downloadTemplate} className="aa-template-link">
                  <Download size={16} />
                  Download Excel Template
                </button>

                <div 
                  className={`aa-dropzone ${isDragging ? 'active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input 
                    type="file" 
                    id="fileInput" 
                    hidden 
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                  />
                  <div className="aa-dropzone-icon">
                    <Download size={32} />
                  </div>
                  <div className="aa-dropzone-text">
                    <h4>Click or drag file to upload</h4>
                    <p>Supports .xlsx and .xls files</p>
                  </div>
                </div>

                {file && (
                  <div className="aa-file-selected">
                    <IdCard size={24} color="#14a800" />
                    <div className="aa-file-info">
                      <span className="aa-file-name">{file.name}</span>
                      <span className="aa-file-size">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <button type="button" className="aa-remove-file" onClick={() => setFile(null)}>
                      <AlertTriangle size={18} />
                    </button>
                  </div>
                )}

                <div className="aa-form-actions">
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    className="aa-button aa-button-primary"
                    disabled={loading || !file}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="spinning" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Upload & Register Advisors
                      </>
                    )}
                  </button>
                </div>

                {uploadSummary && (
                  <div className="aa-upload-summary">
                    <h4 className="aa-summary-title">
                      <CheckCircle size={16} />
                      Upload Summary
                    </h4>
                    <div className="aa-summary-stats">
                      <div className="aa-stat-item aa-stat-success">
                        <span className="aa-stat-val">{uploadSummary.created}</span>
                        <span className="aa-stat-lbl">Created</span>
                      </div>
                      <div className="aa-stat-item aa-stat-error">
                        <span className="aa-stat-val">{uploadSummary.errors.length}</span>
                        <span className="aa-stat-lbl">Failed</span>
                      </div>
                    </div>
                    
                    {uploadSummary.errors.length > 0 && (
                      <>
                        <p style={{ fontSize: '12px', fontWeight: 600, margin: '8px 0' }}>Errors Details:</p>
                        <ul className="aa-error-list">
                          {uploadSummary.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help Card */}
          <div className="aa-help-card">
            <h4>What happens next?</h4>
            <ul>
              <li>
                <CheckCircle size={16} />
                <span>Advisor account is created with the provided information</span>
              </li>
              <li>
                <CheckCircle size={16} />
                <span>Login credentials are sent to the advisor's email</span>
              </li>
              <li>
                <CheckCircle size={16} />
                <span>Advisor can login and access their dashboard</span>
              </li>
              <li>
                <CheckCircle size={16} />
                <span>You can assign students to this advisor</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdvisor;
