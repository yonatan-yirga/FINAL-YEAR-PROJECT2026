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
      
      // Fetch internships for the selected company
      const response = await internshipService.getAll({ 
        company_id: companyId,
        status: 'OPEN' // Only show open internships
      });
      
      if (response.success && Array.isArray(response.data)) {
        // Filter to only show internships with available slots
        const availableInternships = response.data.filter(
          internship => internship.available_slots > 0
        );
        setInternships(availableInternships);
      } else {
        console.error('Failed to fetch internships:', response.error);
        setInternships([]);
        if (response.error) {
          setError(`Failed to load internships: ${response.error}`);
        }
      }
    } catch (err) {
      console.error('Error fetching internships:', err);
      setInternships([]);
      setError('An error occurred while loading internships');
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
                <p>No open internships available for this company</p>
              </div>
            ) : (
              <div className="ac-list">
                {internships.map(internship => (
                  <div
                    key={internship.id}
                    className={`ac-list-item ${selectedInternship?.id === internship.id ? 'selected' : ''}`}
                    onClick={() => setSelectedInternship(internship)}
                  >
                    <div className="ac-item-icon">
                      <Briefcase size={18} />
                    </div>
                    <div className="ac-item-info">
                      <h4>{internship.title}</h4>
                      <p>
                        <Calendar size={12} />
                        {internship.duration_months} months • Starts {internship.start_date}
                      </p>
                      <p className="ac-slots">
                        {internship.available_slots || 0} slots available
                      </p>
                    </div>
                    {selectedInternship?.id === internship.id && (
                      <CheckCircle size={18} className="ac-check-icon" />
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
