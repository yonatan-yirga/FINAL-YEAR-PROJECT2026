/**
 * Modern Registration Page - Upwork-Inspired Design
 * Features:
 * - Multi-step registration (Email → Role → Details)
 * - Clean, minimal layout
 * - Social auth ready
 * - Progress indicator
 * - Mobile responsive
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import registrationService from '../../services/registrationService';
import FileUpload from '../../components/forms/FileUpload';
import './RegisterModern.css';

// Validation Schemas
const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const getDetailsSchema = (role) => {
  const baseSchema = {
    department: Yup.string().when('role', {
      is: (val) => val !== 'COMPANY',
      then: () => Yup.string().required('Department is required'),
      otherwise: () => Yup.string().notRequired(),
    }),
  };

  const roleSchemas = {
    STUDENT: Yup.object().shape({
      ...baseSchema,
      student_full_name: Yup.string().min(3, 'Name must be at least 3 characters').required('Full name is required'),
      student_phone: Yup.string().matches(/^\+?[\d\s-()]+$/, 'Invalid phone format').required('Phone number is required'),
      student_dob: Yup.date().max(new Date(Date.now() - 567648000000), 'Must be at least 18 years old').required('Date of birth is required'),
      student_gender: Yup.string().required('Gender is required'),
      student_university_id: Yup.string().required('University ID is required'),
      student_skills: Yup.string().required('Skills are required').test('min-skills', 'At least 2 skills required', (val) => val && val.split(',').filter(s => s.trim()).length >= 2),
    }),
    COMPANY: Yup.object().shape({
      ...baseSchema,
      target_departments: Yup.array().min(1, 'Select at least one department').required('Target departments required'),
      company_name: Yup.string().min(3, 'Company name too short').required('Company name is required'),
      company_phone: Yup.string().required('Phone number is required'),
      company_address: Yup.string().required('Address is required'),
      company_city: Yup.string().required('City is required'),
      company_contact_person: Yup.string().required('Contact person is required'),
      company_contact_title: Yup.string().required('Job title is required'),
      company_description: Yup.string().min(20, 'Description too short (min 20 characters)').required('Company description is required'),
    }),
    ADVISOR: Yup.object().shape({
      ...baseSchema,
      advisor_full_name: Yup.string().required('Full name is required'),
      advisor_phone: Yup.string().required('Phone number is required'),
      advisor_staff_id: Yup.string().required('Staff ID is required'),
    }),
    DEPARTMENT: Yup.object().shape({
      ...baseSchema,
      department_name: Yup.string().required('Department name is required'),
      department_head_name: Yup.string().required('Department head name is required'),
      department_phone: Yup.string().required('Phone number is required'),
    }),
  };

  return roleSchemas[role] || roleSchemas.STUDENT;
};

const RegisterModern = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email', 'role', 'details', 'success'
  const [userEmail, setUserEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [departments, setDepartments] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchDepartments = async () => {
      const result = await registrationService.getDepartments();
      if (result.success) setDepartments(result.data);
    };
    fetchDepartments();
  }, []);

  const handleEmailSubmit = (values) => {
    setUserEmail(values.email);
    setStep('role');
    setSubmitError('');
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleBackToEmail = () => {
    setStep('email');
    setUserEmail('');
    setSelectedRole('');
    setSubmitError('');
  };

  const handleBackToRole = () => {
    setStep('role');
    setSelectedRole('');
    setSubmitError('');
  };

  const getInitialValues = (role) => {
    const base = { request_type: role, email: userEmail, department: '' };
    const roleValues = {
      STUDENT: { student_full_name: '', student_phone: '', student_dob: '', student_gender: '', student_university_id: '', student_skills: '' },
      COMPANY: { target_departments: [], company_name: '', company_phone: '', company_address: '', company_city: '', company_contact_person: '', company_contact_title: '', company_description: '' },
      ADVISOR: { advisor_full_name: '', advisor_phone: '', advisor_staff_id: '' },
      DEPARTMENT: { department_name: '', department_head_name: '', department_phone: '' },
    };
    return { ...base, ...roleValues[role] };
  };

  const handleDetailsSubmit = async (values, { setSubmitting, resetForm }) => {
    if (!uploadedFile) {
      setSubmitError('Please upload a registration document');
      setSubmitting(false);
      return;
    }

    try {
      setSubmitError('');
      const formData = new FormData();
      
      Object.keys(values).forEach(key => {
        if (values[key] !== '' && values[key] !== null) {
          if (Array.isArray(values[key])) {
            values[key].forEach(val => formData.append(key, val));
          } else {
            formData.append(key, values[key]);
          }
        }
      });
      
      formData.append('document', uploadedFile);
      
      const result = await registrationService.register(formData);
      
      if (result.success) {
        setStep('success');
        resetForm();
        setUploadedFile(null);
      } else {
        setSubmitError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setSubmitError('Connection error. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success Screen
  if (step === 'success') {
    return (
      <div className="register-modern-wrapper">
        <div className="register-success-container">
          <div className="success-card">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#10B981"/>
                <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="success-title">Registration Submitted!</h2>
            <p className="success-message">
              Your registration request has been received and is now under review. 
              You'll receive an email notification within 24-48 hours once your account is approved.
            </p>
            <div className="success-actions">
              <button 
                onClick={() => {
                  setStep('email');
                  setUserEmail('');
                  setSelectedRole('');
                  setSubmitError('');
                }}
                className="btn-secondary-modern"
              >
                Submit Another Request
              </button>
              <Link to="/login-modern" className="btn-primary-modern">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-modern-wrapper">
      {/* Left Panel - Branding */}
      <div className="register-modern-left">
        <div className="brand-container">
          <div className="brand-logo-section">
            <div className="logo-circle">
              <span className="logo-emoji">🎓</span>
            </div>
            <div className="logo-text-group">
              <h1 className="logo-title">DMU Portal</h1>
              <p className="logo-subtitle">Internship Management System</p>
            </div>
          </div>

          <div className="brand-headline">
            <h2 className="headline-text">
              Join our growing<br />
              community today.
            </h2>
            <p className="headline-description">
              Create your account and start connecting with internship opportunities, 
              advisors, and industry partners.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span className="feature-text">Quick and easy registration</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span className="feature-text">Secure document verification</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span className="feature-text">24-48 hour approval process</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span className="feature-text">Access to all portal features</span>
            </div>
          </div>

          <div className="brand-decoration decoration-1"></div>
          <div className="brand-decoration decoration-2"></div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="register-modern-right">
        <div className="register-card-modern">
          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className={`progress-step ${step === 'email' || step === 'role' || step === 'details' ? 'active' : ''} ${step === 'role' || step === 'details' ? 'completed' : ''}`}>
              <div className="progress-circle">1</div>
              <span className="progress-label">Email</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step === 'role' || step === 'details' ? 'active' : ''} ${step === 'details' ? 'completed' : ''}`}>
              <div className="progress-circle">2</div>
              <span className="progress-label">Role</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step === 'details' ? 'active' : ''}`}>
              <div className="progress-circle">3</div>
              <span className="progress-label">Details</span>
            </div>
          </div>

          {/* Header */}
          <div className="register-header-modern">
            <h2 className="register-title">Create your account</h2>
            <p className="register-subtitle">
              Already have an account? <Link to="/login-modern" className="link-primary">Log in</Link>
            </p>
          </div>

          {/* Step 1: Email */}
          {step === 'email' && (
            <>
              {/* Social Registration */}
              <div className="social-login-buttons">
                <button type="button" className="btn-social-login" disabled title="Coming soon">
                  <svg className="social-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                    <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                    <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                    <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                  </svg>
                  <span>Sign up with Google</span>
                </button>
              </div>

              <div className="login-divider">
                <span className="divider-text">or</span>
              </div>

              <Formik
                initialValues={{ email: '' }}
                validationSchema={EmailSchema}
                onSubmit={handleEmailSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="register-form-modern">
                    <div className="form-group-modern">
                      <label htmlFor="email" className="form-label-modern">
                        Email address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        placeholder="your.email@university.edu"
                        className={`input-modern ${errors.email && touched.email ? 'input-error' : ''}`}
                        autoFocus
                      />
                      <ErrorMessage name="email" component="div" className="error-message-modern" />
                    </div>

                    <button type="submit" className="btn-primary-modern" disabled={isSubmitting}>
                      Continue with Email
                    </button>

                    <p className="form-footer-text-modern">
                      By signing up, you agree to our <a href="/terms" className="link-primary">Terms of Service</a> and <a href="/privacy" className="link-primary">Privacy Policy</a>
                    </p>
                  </Form>
                )}
              </Formik>
            </>
          )}

          {/* Step 2: Role Selection */}
          {step === 'role' && (
            <div className="role-selection-container">
              <div className="email-display-modern">
                <div className="email-display-content">
                  <span className="email-label-modern">Registering as</span>
                  <span className="email-value-modern">{userEmail}</span>
                </div>
                <button type="button" onClick={handleBackToEmail} className="btn-change-email-modern">
                  Change
                </button>
              </div>

              <div className="role-selection-title">
                <h3>Select your role</h3>
                <p>Choose the role that best describes you</p>
              </div>

              <div className="role-cards-grid">
                <div className="role-card" onClick={() => handleRoleSelect('STUDENT')}>
                  <div className="role-card-icon">👨‍🎓</div>
                  <h4 className="role-card-title">Student</h4>
                  <p className="role-card-description">
                    Register as a student looking for internship opportunities
                  </p>
                </div>

                <div className="role-card" onClick={() => handleRoleSelect('COMPANY')}>
                  <div className="role-card-icon">🏢</div>
                  <h4 className="role-card-title">Company</h4>
                  <p className="role-card-description">
                    Register your company to offer internship positions
                  </p>
                </div>

                <div className="role-card" onClick={() => handleRoleSelect('ADVISOR')}>
                  <div className="role-card-icon">👨‍🏫</div>
                  <h4 className="role-card-title">Advisor</h4>
                  <p className="role-card-description">
                    Register as a faculty advisor to supervise students
                  </p>
                </div>

                <div className="role-card" onClick={() => handleRoleSelect('DEPARTMENT')}>
                  <div className="role-card-icon">🏛️</div>
                  <h4 className="role-card-title">Department Head</h4>
                  <p className="role-card-description">
                    Register as a department head to manage programs
                  </p>
                </div>
              </div>

              <button type="button" onClick={handleBackToEmail} className="btn-secondary-modern">
                Back
              </button>
            </div>
          )}

          {/* Step 3: Details Form */}
          {step === 'details' && (
            <Formik
              initialValues={getInitialValues(selectedRole)}
              validationSchema={getDetailsSchema(selectedRole)}
              onSubmit={handleDetailsSubmit}
            >
              {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                <Form className="register-form-modern">
                  <div className="email-display-modern">
                    <div className="email-display-content">
                      <span className="email-label-modern">Registering as {selectedRole.toLowerCase()}</span>
                      <span className="email-value-modern">{userEmail}</span>
                    </div>
                    <button type="button" onClick={handleBackToRole} className="btn-change-email-modern">
                      Change
                    </button>
                  </div>

                  {/* Department Selection (except for Company) */}
                  {selectedRole !== 'COMPANY' && (
                    <div className="form-group-modern">
                      <label htmlFor="department" className="form-label-modern">Department</label>
                      <Field as="select" name="department" className="input-modern">
                        <option value="">Select Department</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="department" component="div" className="error-message-modern" />
                    </div>
                  )}

                  {/* Company Target Departments */}
                  {selectedRole === 'COMPANY' && (
                    <div className="form-group-modern">
                      <label className="form-label-modern">Target Departments</label>
                      <div className="department-chips">
                        {departments.map(d => (
                          <div
                            key={d.id}
                            onClick={() => {
                              const arr = Array.isArray(values.target_departments) ? values.target_departments : [];
                              setFieldValue('target_departments', arr.includes(d.id) ? arr.filter(i => i !== d.id) : [...arr, d.id]);
                            }}
                            className={`department-chip ${values.target_departments?.includes(d.id) ? 'selected' : ''}`}
                          >
                            {values.target_departments?.includes(d.id) ? '✓ ' : '+ '}{d.name}
                          </div>
                        ))}
                      </div>
                      <ErrorMessage name="target_departments" component="div" className="error-message-modern" />
                    </div>
                  )}

                  {/* Role-Specific Fields */}
                  {selectedRole === 'STUDENT' && <StudentFields />}
                  {selectedRole === 'COMPANY' && <CompanyFields />}
                  {selectedRole === 'ADVISOR' && <AdvisorFields />}
                  {selectedRole === 'DEPARTMENT' && <DepartmentFields />}

                  {/* File Upload */}
                  <div className="form-group-modern">
                    <label className="form-label-modern">Registration Document</label>
                    <FileUpload 
                      onFileSelect={setUploadedFile} 
                      onFileRemove={() => setUploadedFile(null)} 
                      error={!uploadedFile && touched.document ? 'Registration document required' : null}
                    />
                  </div>

                  {/* Error Alert */}
                  {submitError && (
                    <div className="alert-error-modern">
                      <svg className="alert-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                      </svg>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button type="submit" className="btn-primary-modern" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-modern"></span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>

                  <button type="button" onClick={handleBackToRole} className="btn-secondary-modern">
                    Back
                  </button>
                </Form>
              )}
            </Formik>
          )}
        </div>

        <p className="bottom-notice-modern">
          © 2026 Debre Markos University. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// Role-Specific Field Components
const InputField = ({ label, name, ...props }) => (
  <div className="form-group-modern">
    <label htmlFor={name} className="form-label-modern">{label}</label>
    <Field name={name} id={name} className="input-modern" {...props} />
    <ErrorMessage name={name} component="div" className="error-message-modern" />
  </div>
);

const StudentFields = () => (
  <div className="fields-grid">
    <InputField label="Full Name" name="student_full_name" placeholder="John Doe" />
    <InputField label="Phone Number" name="student_phone" placeholder="+251..." />
    <InputField label="Date of Birth" name="student_dob" type="date" />
    <div className="form-group-modern">
      <label htmlFor="student_gender" className="form-label-modern">Gender</label>
      <Field as="select" name="student_gender" className="input-modern">
        <option value="">Select Gender</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </Field>
      <ErrorMessage name="student_gender" component="div" className="error-message-modern" />
    </div>
    <div className="form-group-modern full-width">
      <InputField label="University ID" name="student_university_id" placeholder="DMU/2024/001" />
    </div>
    <div className="form-group-modern full-width">
      <label htmlFor="student_skills" className="form-label-modern">Skills (comma-separated)</label>
      <Field as="textarea" name="student_skills" rows="3" className="input-modern" placeholder="Python, Django, React, JavaScript..." />
      <ErrorMessage name="student_skills" component="div" className="error-message-modern" />
    </div>
  </div>
);

const CompanyFields = () => (
  <div className="fields-grid">
    <InputField label="Company Name" name="company_name" placeholder="Tech Corp Ltd" />
    <InputField label="Phone Number" name="company_phone" placeholder="+251..." />
    <div className="form-group-modern full-width">
      <InputField label="Address" name="company_address" placeholder="123 Main Street" />
    </div>
    <InputField label="City" name="company_city" placeholder="Addis Ababa" />
    <InputField label="Contact Person" name="company_contact_person" placeholder="Jane Smith" />
    <InputField label="Job Title" name="company_contact_title" placeholder="HR Manager" />
    <div className="form-group-modern full-width">
      <label htmlFor="company_description" className="form-label-modern">Company Description</label>
      <Field as="textarea" name="company_description" rows="4" className="input-modern" placeholder="Brief description of your company..." />
      <ErrorMessage name="company_description" component="div" className="error-message-modern" />
    </div>
  </div>
);

const AdvisorFields = () => (
  <div className="fields-grid">
    <InputField label="Full Name" name="advisor_full_name" placeholder="Dr. John Doe" />
    <InputField label="Phone Number" name="advisor_phone" placeholder="+251..." />
    <div className="form-group-modern full-width">
      <InputField label="Staff ID" name="advisor_staff_id" placeholder="ADV/2024/001" />
    </div>
  </div>
);

const DepartmentFields = () => (
  <div className="fields-grid">
    <div className="form-group-modern full-width">
      <InputField label="Department Name" name="department_name" placeholder="Computer Science" />
    </div>
    <InputField label="Department Head Name" name="department_head_name" placeholder="Dr. Jane Smith" />
    <InputField label="Phone Number" name="department_phone" placeholder="+251..." />
  </div>
);

export default RegisterModern;
