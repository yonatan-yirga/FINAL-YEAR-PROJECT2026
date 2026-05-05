/**
 * Assign Company to Student Page - Upwork-Inspired Design
 * Department Head can manually assign students to companies/internships
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import departmentService from '../../services/departmentService';
import internshipService from '../../services/internshipService';
import {
  Users, Building2, Briefcase, ArrowRight, Search, CheckCircle,
  AlertTriangle, RefreshCw, Save, X, UserCheck, Calendar
} from 'lucide-react';
import './AssignCompany.css';

const AssignCompany = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);
  
  // Search states
  const [studentSearch, setStudentSearch] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // When company is selected, fetch their internships
    if (selectedCompany) {
      fetchCompanyInternships(selectedCompany.id);
    } else {
      setInternships([]);
      setSelectedInternship(null);
    }
  }, [selectedCompany]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all students (we'll filter on frontend)
      const studentsRes = await departmentService.getStudents();
      
      // Fetch companies
      const companiesRes = await departmentService.getCompanies();
      
      if (studentsRes.success && companiesRes.success) {
        // Filter students who don't have accepted applications
        // Show students with no internship status or NOT_APPLIED status
        const availableStudents = studentsRes.data.filter(
          s => !s.internship_status || 
               s.internship_status === 'NOT_APPLIED' || 
               s.internship_status === 'not_applied'
        );
        setStudents(availableStudents);
        setCompanies(companiesRes.data);
      } else {
        setError(studentsRes.error || companiesRes.error || 'Failed to load data');
      }
    } catch (err) {
      setError('An error occurred while loading data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInternships = async (companyId) => {
    try {
      setInternships([]);
      setError(''); // Clear previous errors
      
      console.log('🔍 Fetching internships for company ID:', companyId);
      console.log('🔍 Company object:', selectedCompany);
      
      if (!companyId) {
        console.error('❌ No company ID provided!');
        setError('Invalid company selected');
        return;
      }
      
      // Fetch ALL internships for the selected company
      const response = await internshipService.getAll({ 
        company_id: companyId
      });
      
      console.log('📦 Full API response:', response);
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.success:', response.success);
      console.log('📦 Response.error:', response.error);
      
      if (response.success) {
        // Handle different response formats
        let internshipData = [];
        
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          internshipData = response.data;
          console.log('✅ Data is array, length:', internshipData.length);
        } 
        // Check if response.data has results (paginated)
        else if (response.data && Array.isArray(response.data.results)) {
          internshipData = response.data.results;
          console.log('✅ Data has results array, length:', internshipData.length);
        } 
        // Check if response.data.data exists
        else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          internshipData = response.data.data;
          console.log('✅ Data has data.data array, length:', internshipData.length);
        }
        // Check if response itself is the array
        else if (response && Array.isArray(response)) {
          internshipData = response;
          console.log('✅ Response itself is array, length:', internshipData.length);
        }
        else {
          console.warn('⚠️ Unexpected response format:', typeof response.data, response.data);
        }
        
        console.log('📋 Final internship data:', internshipData);
        console.log('📋 First internship (if any):', internshipData[0]);
        
        setInternships(internshipData);
        
        if (internshipData.length === 0) {
          setError('This company has no internship postings yet');
        }
      } else {
        console.error('❌ API returned success=false');
        console.error('❌ Error message:', response.error);
        setInternships([]);
        setError(response.error || 'Failed to load internships');
      }
    } catch (err) {
      console.error('❌ Exception while fetching internships:', err);
      console.error('❌ Exception name:', err.name);
      console.error('❌ Exception message:', err.message);
      console.error('❌ Exception stack:', err.stack);
      setInternships([]);
      setError('An error occurred while loading internships: ' + (err.message || 'Unknown error'));
    }
  };

  const handleAssign = async () => {
    if (!selectedStudent || !selectedCompany || !selectedInternship) {
      setError('Please select a student, company, and internship');
      return;
    }

    if (!window.confirm(
      `Are you sure you want to assign ${selectedStudent.full_name || selectedStudent.student_name} to ${selectedInternship.title} at ${selectedCompany.company_name}?`
    )) {
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await departmentService.assignCompanyToStudent({
        student_id: selectedStudent.id,
        internship_id: selectedInternship.id,
        assigned_by: 'department_head'
      });

      if (response.success) {
        setSuccess(`Successfully assigned ${selectedStudent.full_name || selectedStudent.student_name} to ${selectedCompany.company_name}!`);
        
        // Reset form
        setSelectedStudent(null);
        setSelectedCompany(null);
        setSelectedInternship(null);
        setStudentSearch('');
        setCompanySearch('');
        
        // Refresh data
        setTimeout(() => {
          fetchData();
          setSuccess('');
        }, 2000);
      } else {
        setError(response.error || 'Failed to assign company to student');
      }
    } catch (err) {
      setError('An error occurred while assigning company');
      console.error('Error assigning company:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedStudent(null);
    setSelectedCompany(null);
    setSelectedInternship(null);
    setStudentSearch('');
    setCompanySearch('');
    setError('');
    setSuccess('');
  };

  const filteredStudents = students.filter(s =>
    (s.full_name || s.student_name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.university_id || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredCompanies = companies.filter(c =>
    (c.company_name || '').toLowerCase().includes(companySearch.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(companySearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="ac-page">
        <Header title="Assign Company to Student" subtitle="Loading..." />
        <div className="ac-content">
          <div className="ac-loading">
            <div className="ac-spinner" />
            <p>Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ac-page">
      <Header 
        title="Assign Company to Student" 
        subtitle="Manually place students in internship positions"
      />

      <div className="ac-content">
        {/* Success Alert */}
        {success && (
          <div className="ac-alert ac-alert-success">
            <CheckCircle size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>×</button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="ac-alert ac-alert-error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Selection Summary */}
        {(selectedStudent || selectedCompany || selectedInternship) && (
          <div className="ac-summary-card">
            <div className="ac-summary-header">
              <h3>Assignment Summary</h3>
              <button onClick={handleReset} className="ac-reset-btn">
                <X size={14} />
                Reset
              </button>
            </div>
            <div className="ac-summary-flow">
              <div className={`ac-summary-item ${selectedStudent ? 'selected' : ''}`}>
                <Users size={16} />
                <span>{selectedStudent ? (selectedStudent.full_name || selectedStudent.student_name) : 'Select Student'}</span>
              </div>
              <ArrowRight size={18} className="ac-arrow" />
              <div className={`ac-summary-item ${selectedCompany ? 'selected' : ''}`}>
                <Building2 size={16} />
                <span>{selectedCompany ? selectedCompany.company_name : 'Select Company'}</span>
              </div>
              <ArrowRight size={18} className="ac-arrow" />
              <div className={`ac-summary-item ${selectedInternship ? 'selected' : ''}`}>
                <Briefcase size={16} />
                <span>{selectedInternship ? selectedInternship.title : 'Select Internship'}</span>
              </div>
            </div>
            {selectedStudent && selectedCompany && selectedInternship && (
              <button 
                onClick={handleAssign} 
                className="ac-assign-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Confirm Assignment
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="ac-grid">
          {/* Step 1: Select Student */}
          <div className="ac-section">
            <div className="ac-section-header">
              <div className="ac-step-badge">1</div>
              <div>
                <h3>Select Student</h3>
                <p>Choose a student without an active internship</p>
              </div>
            </div>

            <div className="ac-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search students by name, ID, or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>

            <div className="ac-list">
              {filteredStudents.length === 0 ? (
                <div className="ac-empty">
                  <Users size={32} />
                  <p>No available students found</p>
                </div>
              ) : (
                filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className={`ac-list-item ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="ac-item-icon">
                      <Users size={18} />
                    </div>
                    <div className="ac-item-info">
                      <h4>{student.full_name || student.student_name}</h4>
                      <p>{student.university_id} • {student.email}</p>
                    </div>
                    {selectedStudent?.id === student.id && (
                      <CheckCircle size={18} className="ac-check-icon" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Step 2: Select Company */}
          <div className="ac-section">
            <div className="ac-section-header">
              <div className="ac-step-badge">2</div>
              <div>
                <h3>Select Company</h3>
                <p>Choose the company for placement</p>
              </div>
            </div>

            <div className="ac-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search companies by name..."
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
              />
            </div>

            <div className="ac-list">
              {filteredCompanies.length === 0 ? (
                <div className="ac-empty">
                  <Building2 size={32} />
                  <p>No companies found</p>
                </div>
              ) : (
                filteredCompanies.map(company => (
                  <div
                    key={company.id}
                    className={`ac-list-item ${selectedCompany?.id === company.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCompany(company)}
                  >
                    <div className="ac-item-icon">
                      <Building2 size={18} />
                    </div>
                    <div className="ac-item-info">
                      <h4>{company.company_name}</h4>
                      <p>{company.city || 'Location not specified'} • {company.posted_internships || 0} internships</p>
                    </div>
                    {selectedCompany?.id === company.id && (
                      <CheckCircle size={18} className="ac-check-icon" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Step 3: Select Internship */}
          <div className="ac-section">
            <div className="ac-section-header">
              <div className="ac-step-badge">3</div>
              <div>
                <h3>Select Internship</h3>
                <p>Choose the specific internship position</p>
              </div>
            </div>

            {!selectedCompany ? (
              <div className="ac-empty">
                <Briefcase size={32} />
                <p>Select a company first to view internships</p>
              </div>
            ) : internships.length === 0 ? (
              <div className="ac-empty">
                <Briefcase size={32} />
                <p>No internship postings found</p>
                <small>This company hasn't posted any internships yet</small>
              </div>
            ) : (
              <div className="ac-internship-list">
                {internships.map(internship => (
                  <div
                    key={internship.id}
                    className={`ac-internship-card ${selectedInternship?.id === internship.id ? 'selected' : ''} ${internship.available_slots === 0 ? 'no-slots' : ''}`}
                    onClick={() => setSelectedInternship(internship)}
                  >
                    <div className="ac-internship-header">
                      <div className="ac-internship-icon">
                        <Briefcase size={20} />
                      </div>
                      <div className="ac-internship-title-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <h4 style={{ margin: 0 }}>{internship.title}</h4>
                          {internship.status && (
                            <span className={`ac-status-badge ${internship.status.toLowerCase()}`}>
                              {internship.status}
                            </span>
                          )}
                        </div>
                        <div className="ac-internship-meta">
                          <span className="ac-meta-item">
                            <Calendar size={12} />
                            {internship.duration_months} months
                          </span>
                          <span className="ac-meta-item">
                            📍 {internship.location || 'Location not specified'}
                          </span>
                          <span className={`ac-slots-badge ${
                            internship.available_slots > 5 ? 'high' : 
                            internship.available_slots > 0 ? 'low' : 'none'
                          }`}>
                            {internship.available_slots || 0} slots available
                          </span>
                        </div>
                      </div>
                      {selectedInternship?.id === internship.id && (
                        <CheckCircle size={20} className="ac-check-icon-large" />
                      )}
                    </div>

                    <div className="ac-internship-body">
                      <div className="ac-internship-section">
                        <h5>Description</h5>
                        <p>{internship.description || 'No description provided'}</p>
                      </div>

                      {internship.required_skills && (
                        <div className="ac-internship-section">
                          <h5>Required Skills</h5>
                          <div className="ac-skills-tags">
                            {internship.required_skills.split(',').map((skill, idx) => (
                              <span key={idx} className="ac-skill-tag">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="ac-internship-section">
                        <h5>Duration & Timeline</h5>
                        <div className="ac-timeline-info">
                          <div className="ac-timeline-item">
                            <strong>Start Date:</strong> {new Date(internship.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          {internship.end_date && (
                            <div className="ac-timeline-item">
                              <strong>End Date:</strong> {new Date(internship.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                          )}
                          <div className="ac-timeline-item">
                            <strong>Duration:</strong> {internship.duration_months} months
                          </div>
                        </div>
                      </div>

                      {internship.stipend && (
                        <div className="ac-internship-section">
                          <h5>Stipend</h5>
                          <p className="ac-stipend">{internship.stipend}</p>
                        </div>
                      )}

                      {internship.available_slots === 0 && (
                        <div className="ac-warning-box">
                          <AlertTriangle size={16} />
                          <span>No slots available - Assignment may require approval</span>
                        </div>
                      )}
                    </div>

                    {selectedInternship?.id === internship.id && (
                      <div className="ac-selected-indicator">
                        ✓ Selected for Assignment
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCompany;
