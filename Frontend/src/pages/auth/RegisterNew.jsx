/**
 * Modern Registration Page - Upwork-Inspired Design
 * Features: Multi-step flow, Continue with Email, Clean UI
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import registrationService from '../../services/registrationService';
import FileUpload from '../../components/forms/FileUpload';
import './RegisterNew.css';

// Validation schemas (same as before for stability)
const getValidationSchema = (role) => {
  const baseSchema = {
    email: Yup.string().email('Invalid email').required('Email required'),
    department: Yup.string().when('request_type', {
      is: (val) => val !== 'COMPANY',
      then: () => Yup.string().required('Department required'),
      otherwise: () => Yup.string().notRequired(),
    }),
  };

  const roleSchemas = {
    STUDENT: Yup.object().shape({
      ...baseSchema,
      student_full_name: Yup.string().min(3).required('Name required'),
      student_phone: Yup.string().required('Phone required'),
      student_dob: Yup.date().max(new Date(Date.now() - 567648000000), 'Must be 18+').required('DOB required'),
      student_gender: Yup.string().required('Gender required'),
      student_university_id: Yup.string().required('ID required'),
      student_skills: Yup.string().required('Skills required'),
    }),
    COMPANY: Yup.object().shape({
      ...baseSchema,
      target_departments: Yup.array().min(1).required('Select departments'),
      company_name: Yup.string().min(3).required('Name required'),
      company_phone: Yup.string().required('Phone required'),
      company_address: Yup.string().required('Address required'),
      company_city: Yup.string().required('City required'),
      company_contact_person: Yup.string().required('Contact required'),
      company_contact_title: Yup.string().required('Title required'),
      company_description: Yup.string().min(20).required('Description required'),
    }),
    ADVISOR: Yup.object().shape({
      ...baseSchema,
      advisor_full_name: Yup.string().required('Name required'),
      advisor_phone: Yup.string().required('Phone required'),
      advisor_staff_id: Yup.string().required('Staff ID required'),
    }),
    DEPARTMENT: Yup.object().shape({
      ...baseSchema,
      department_name: Yup.string().required('Dept name required'),
      department_head_name: Yup.string().required('Head name required'),
      department_phone: Yup.string().required('Phone required'),
    }),
  };
  return roleSchemas[role] || roleSchemas.STUDENT;
};

const RegisterNew = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const result = await registrationService.getDepartments();
      if (result.success) setDepartments(result.data);
    };
    fetch();
  }, []);

  const getInitialValues = (role) => {
    const base = { request_type: role, email: '', department: '' };
    const roleValues = {
      STUDENT: { student_full_name: '', student_phone: '', student_dob: '', student_gender: '', student_university_id: '', student_skills: '' },
      COMPANY: { target_departments: [], company_name: '', company_phone: '', company_address: '', company_city: '', company_contact_person: '', company_contact_title: '', company_description: '' },
      ADVISOR: { advisor_full_name: '', advisor_phone: '', advisor_staff_id: '' },
      DEPARTMENT: { department_name: '', department_head_name: '', department_phone: '' },
    };
    return { ...base, ...roleValues[role] };
  };

  const handleSubmit = async (values, { resetForm }) => {
    if (!uploadedFile) { setSubmitError('Please upload a document'); return; }
    setIsSubmitting(true); setSubmitError('');
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== '' && values[key] !== null) {
          if (Array.isArray(values[key])) values[key].forEach(val => formData.append(key, val));
          else formData.append(key, values[key]);
        }
      });
      formData.append('document', uploadedFile);
      const result = await registrationService.register(formData);
      if (result.success) { setSubmitSuccess(true); resetForm(); setUploadedFile(null); }
      else setSubmitError(result.error);
    } catch { setSubmitError('Connection error. Please try again.'); }
    finally { setIsSubmitting(false); }
  };

  if (submitSuccess) {
    return (
      <div className="register-new-container">
        <div className="register-success-card">
          <div className="success-icon-wrapper">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#10b981"/>
              <path d="M20 32l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Registration Submitted!</h2>
          <p>Your application is under review. You'll receive an email notification within 24-48 hours.</p>
          <div className="success-actions">
            <button onClick={() => setSubmitSuccess(false)} className="btn-secondary-new">
              Submit Another
            </button>
            <button onClick={() => navigate('/login')} className="btn-primary-new">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-new-container">
      <div className="register-new-wrapper">
        {/* Header */}
        <div className="register-header-new">
          <h1>Create your account</h1>
          <p>Already have an account? <a href="/login" className="link-primary">Log in</a></p>
        </div>

        <Formik
          initialValues={getInitialValues('STUDENT')}
          validationSchema={Yup.lazy(v => getValidationSchema(v.request_type))}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="register-form-new">
              <div className="register-card-new">
                {/* Role Selection */}
                <div className="form-section-new">
                  <h3>Select your role</h3>
                  <div className="role-grid">
                    {[
                      { value: 'STUDENT', label: 'Student', icon: '🎓', desc: 'Looking for internship opportunities' },
                      { value: 'COMPANY', label: 'Company', icon: '🏢', desc: 'Offering internship positions' },
                      { value: 'ADVISOR', label: 'Advisor', icon: '👨‍🏫', desc: 'Supervising student internships' },
                      { value: 'DEPARTMENT', label: 'Department Head', icon: '👔', desc: 'Managing department operations' },
                    ].map(role => (
                      <div
                        key={role.value}
                        className={`role-card ${values.request_type === role.value ? 'active' : ''}`}
                        onClick={() => {
                          const v = getInitialValues(role.value);
                          v.email = values.email;
                          setFieldValue('request_type', role.value);
                          Object.keys(v).forEach(k => k !== 'request_type' && setFieldValue(k, v[k]));
                        }}
                      >
                        <div className="role-icon">{role.icon}</div>
                        <div className="role-content">
                          <div className="role-label">{role.label}</div>
                          <div className="role-desc">{role.desc}</div>
                        </div>
                        <div className="role-check">
                          {values.request_type === role.value && (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="form-section-new">
                  <h3>Basic information</h3>
                  <div className="form-grid">
                    <div className="form-group-new full-width">
                      <label>Email address *</label>
                      <Field
                        type="email"
                        name="email"
                        placeholder="your.email@university.edu"
                        className="input-new"
                      />
                      <ErrorMessage name="email" component="div" className="error-text" />
                    </div>

                    {values.request_type !== 'COMPANY' && (
                      <div className="form-group-new full-width">
                        <label>Department *</label>
                        <Field as="select" name="department" className="input-new">
                          <option value="">Select department</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Field>
                        <ErrorMessage name="department" component="div" className="error-text" />
                      </div>
                    )}

                    {values.request_type === 'COMPANY' && (
                      <div className="form-group-new full-width">
                        <label>Target Departments *</label>
                        <div className="department-chips">
                          {departments.map(d => (
                            <div
                              key={d.id}
                              className={`chip ${values.target_departments?.includes(d.id) ? 'active' : ''}`}
                              onClick={() => {
                                const arr = Array.isArray(values.target_departments) ? values.target_departments : [];
                                setFieldValue('target_departments', arr.includes(d.id) ? arr.filter(i => i !== d.id) : [...arr, d.id]);
                              }}
                            >
                              {d.name}
                            </div>
                          ))}
                        </div>
                        <ErrorMessage name="target_departments" component="div" className="error-text" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Role-Specific Fields */}
                <div className="form-section-new">
                  <h3>Additional details</h3>
                  {values.request_type === 'STUDENT' && <StudentFields />}
                  {values.request_type === 'COMPANY' && <CompanyFields />}
                  {values.request_type === 'ADVISOR' && <AdvisorFields />}
                  {values.request_type === 'DEPARTMENT' && <DepartmentFields />}
                </div>

                {/* Document Upload */}
                <div className="form-section-new">
                  <h3>Supporting document</h3>
                  <FileUpload 
                    onFileSelect={setUploadedFile} 
                    onFileRemove={() => setUploadedFile(null)} 
                    error={!uploadedFile && touched.document ? 'Document required' : null} 
                  />
                </div>

                {submitError && (
                  <div className="alert-error">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                    </svg>
                    {submitError}
                  </div>
                )}

                <button type="submit" className="btn-primary-new" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <p className="form-footer-text">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Role-specific field components
const StudentFields = () => (
  <div className="form-grid">
    <div className="form-group-new">
      <label>Full Name *</label>
      <Field name="student_full_name" placeholder="John Doe" className="input-new" />
      <ErrorMessage name="student_full_name" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Phone Number *</label>
      <Field name="student_phone" placeholder="+251..." className="input-new" />
      <ErrorMessage name="student_phone" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Date of Birth *</label>
      <Field type="date" name="student_dob" className="input-new" />
      <ErrorMessage name="student_dob" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Gender *</label>
      <Field as="select" name="student_gender" className="input-new">
        <option value="">Select</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </Field>
      <ErrorMessage name="student_gender" component="div" className="error-text" />
    </div>
    <div className="form-group-new full-width">
      <label>University ID *</label>
      <Field name="student_university_id" placeholder="DMU/2024/001" className="input-new" />
      <ErrorMessage name="student_university_id" component="div" className="error-text" />
    </div>
    <div className="form-group-new full-width">
      <label>Skills *</label>
      <Field as="textarea" name="student_skills" rows="3" placeholder="Python, Django, React..." className="input-new" />
      <ErrorMessage name="student_skills" component="div" className="error-text" />
    </div>
  </div>
);

const CompanyFields = () => (
  <div className="form-grid">
    <div className="form-group-new">
      <label>Company Name *</label>
      <Field name="company_name" placeholder="Acme Corp" className="input-new" />
      <ErrorMessage name="company_name" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Phone Number *</label>
      <Field name="company_phone" placeholder="+251..." className="input-new" />
      <ErrorMessage name="company_phone" component="div" className="error-text" />
    </div>
    <div className="form-group-new full-width">
      <label>Address *</label>
      <Field name="company_address" placeholder="123 Main St" className="input-new" />
      <ErrorMessage name="company_address" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>City *</label>
      <Field name="company_city" placeholder="Addis Ababa" className="input-new" />
      <ErrorMessage name="company_city" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Contact Person *</label>
      <Field name="company_contact_person" placeholder="Jane Smith" className="input-new" />
      <ErrorMessage name="company_contact_person" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Job Title *</label>
      <Field name="company_contact_title" placeholder="HR Manager" className="input-new" />
      <ErrorMessage name="company_contact_title" component="div" className="error-text" />
    </div>
    <div className="form-group-new full-width">
      <label>Company Description *</label>
      <Field as="textarea" name="company_description" rows="4" placeholder="Tell us about your company..." className="input-new" />
      <ErrorMessage name="company_description" component="div" className="error-text" />
    </div>
  </div>
);

const AdvisorFields = () => (
  <div className="form-grid">
    <div className="form-group-new">
      <label>Full Name *</label>
      <Field name="advisor_full_name" placeholder="Dr. John Doe" className="input-new" />
      <ErrorMessage name="advisor_full_name" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Phone Number *</label>
      <Field name="advisor_phone" placeholder="+251..." className="input-new" />
      <ErrorMessage name="advisor_phone" component="div" className="error-text" />
    </div>
    <div className="form-group-new full-width">
      <label>Staff ID *</label>
      <Field name="advisor_staff_id" placeholder="ADV-001" className="input-new" />
      <ErrorMessage name="advisor_staff_id" component="div" className="error-text" />
    </div>
  </div>
);

const DepartmentFields = () => (
  <div className="form-grid">
    <div className="form-group-new full-width">
      <label>Department Name *</label>
      <Field name="department_name" placeholder="Computer Science" className="input-new" />
      <ErrorMessage name="department_name" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Department Head *</label>
      <Field name="department_head_name" placeholder="Dr. Jane Smith" className="input-new" />
      <ErrorMessage name="department_head_name" component="div" className="error-text" />
    </div>
    <div className="form-group-new">
      <label>Phone Number *</label>
      <Field name="department_phone" placeholder="+251..." className="input-new" />
      <ErrorMessage name="department_phone" component="div" className="error-text" />
    </div>
  </div>
);

export default RegisterNew;
