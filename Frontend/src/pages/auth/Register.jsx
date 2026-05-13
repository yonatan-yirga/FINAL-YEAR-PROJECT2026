/**
 * Registration Page - Upwork-Inspired Design with OAuth
 * System for role-based user registration.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CheckCircle } from 'lucide-react';
import registrationService from '../../services/registrationService';
import oauthService from '../../services/oauthService';
import FileUpload from '../../components/forms/FileUpload';
import dmuLogo from '../../assets/logodmu.jpg';
import './Register.css';

// Validation logic (Retained exactly for stability)
const getValidationSchema = (role) => {
  const baseSchema = {
    email: Yup.string().email('Invalid email address').required('Email required'),
    department: Yup.string().when('request_type', {
      is: (val) => val !== 'COMPANY',
      then: () => Yup.string().required('Department required'),
      otherwise: () => Yup.string().notRequired(),
    }),
  };

  const roleSchemas = {
    STUDENT: Yup.object().shape({
      ...baseSchema,
      student_full_name: Yup.string().min(3, 'Name too short').required('Name required'),
      student_phone: Yup.string().matches(/^\+?[\d\s-()]+$/, 'Invalid format').required('Phone required'),
      student_dob: Yup.date().max(new Date(Date.now() - 567648000000), 'Must be 18+').required('Date of birth required'),
      student_gender: Yup.string().required('Gender required'),
      student_university_id: Yup.string().required('ID required'),
      student_skills: Yup.string().required('Skills required').test('min-skills', '2+ skills required', (val) => val && val.split(',').filter(s => s.trim()).length >= 2),
    }),
    COMPANY: Yup.object().shape({
      ...baseSchema,
      target_departments: Yup.array().min(1, 'Select target departments').required('Departments required'),
      company_name: Yup.string().min(3, 'Identity too short').required('Name required'),
      company_phone: Yup.string().required('Phone required'),
      company_address: Yup.string().required('Address required'),
      company_city: Yup.string().required('City required'),
      company_contact_person: Yup.string().required('Contact required'),
      company_contact_title: Yup.string().required('Title required'),
      company_description: Yup.string().min(20, 'Desc too short').required('Desc required'),
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

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const action = searchParams.get('action');
  const [departments, setDepartments] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleGoogleSignup = () => {
    localStorage.setItem('oauth_provider', 'google');
    window.location.href = oauthService.getGoogleAuthUrl();
  };

  const handleGitHubSignup = () => {
    localStorage.setItem('oauth_provider', 'github');
    window.location.href = oauthService.getGitHubAuthUrl();
  };

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
      STUDENT: { student_full_name: '', student_phone: '', student_dob: '', student_gender: '', student_university_id: '', student_skills: '', student_batch: '', student_year_of_study: '' },
      COMPANY: { target_departments: [], company_name: '', company_phone: '', company_address: '', company_city: '', company_contact_person: '', company_contact_title: '', company_description: '' },
      ADVISOR: { advisor_full_name: '', advisor_phone: '', advisor_staff_id: '' },
      DEPARTMENT: { department_name: '', department_head_name: '', department_phone: '' },
    };
    return { ...base, ...roleValues[role] };
  };

  const handleSubmit = async (values, { resetForm }) => {
    if (!uploadedFile) { setSubmitError('Document upload failed (missing file)'); return; }
    setIsSubmitting(true); setSubmitError(''); setUploadProgress(0);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== '' && values[key] !== null) {
          if (Array.isArray(values[key])) values[key].forEach(val => formData.append(key, val));
          else formData.append(key, values[key]);
        }
      });
      formData.append('document', uploadedFile);
      const result = await registrationService.register(formData, setUploadProgress);
      if (result.success) { setSubmitSuccess(true); resetForm(); setUploadedFile(null); }
      else setSubmitError(result.error);
    } catch { setSubmitError('Connection error. Registration failed.'); }
    finally { setIsSubmitting(false); }
  };

  if (submitSuccess) {
    return (
      <div className="register-success">
        <div className="register-success-card">
          <div className="register-success-icon">
            <CheckCircle size={36} />
          </div>
          <h2 className="register-success-title">Registration Sent</h2>
          <p className="register-success-text">
            Your credentials and registration documents are now under review. You will be notified within 24-48 hours.
            {returnTo && action === 'apply' && (
              <span className="register-success-highlight">
                Once approved, you can login and apply for the internship!
              </span>
            )}
          </p>
          <div className="register-success-actions">
            <button 
              onClick={() => setSubmitSuccess(false)} 
              className="register-success-button register-success-button-secondary"
            >
              New Request
            </button>
            <button 
              onClick={() => {
                if (returnTo) {
                  navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
                } else {
                  navigate('/login');
                }
              }} 
              className="register-success-button register-success-button-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        
        <div className="register-header">
          <div className="register-logo">
            <img src={dmuLogo} alt="DMU Logo" className="register-logo-img" />
          </div>
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">
            Create your user profile in the Internship Portal
            {returnTo && action === 'apply' && (
              <span className="register-subtitle-highlight">
                Register to apply for this internship opportunity
              </span>
            )}
          </p>
        </div>

        {/* OAuth Buttons */}
        {true && (
          <div className="register-oauth-section">
            <div className="oauth-buttons">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="oauth-button google"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>
                Sign up with Google
              </button>

              <button
                type="button"
                onClick={handleGitHubSignup}
                className="oauth-button github"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                Sign up with GitHub
              </button>
            </div>

            <div className="register-divider-oauth">
              <span>OR</span>
            </div>
          </div>
        )}

        <Formik
          initialValues={getInitialValues('STUDENT')}
          validationSchema={Yup.lazy(v => getValidationSchema(v.request_type))}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form>
              <div className="register-card">
                
                {/* Role Switcher */}
                <div className="register-role-section">
                   <label className="register-role-label">Select Your Role</label>
                   <div className="register-role-tabs">
                     {['STUDENT', 'COMPANY', 'DEPARTMENT'].map(r => (
                       <button
                         key={r} type="button"
                         onClick={() => {
                           const v = getInitialValues(r); v.email = values.email;
                           setFieldValue('request_type', r);
                           Object.keys(v).forEach(k => k !== 'request_type' && setFieldValue(k, v[k]));
                         }}
                         className={`register-role-tab ${values.request_type === r ? 'active' : ''}`}
                       >
                         {r === 'DEPARTMENT' ? 'Dept Head' : r.charAt(0) + r.slice(1).toLowerCase()}
                       </button>
                     ))}
                   </div>
                </div>

                {/* General Information */}
                <div className="register-grid">
                  <div className="register-field">
                    <label className="register-label">
                      {values.request_type === 'COMPANY' ? 'Target Departments' : 'Department'}
                    </label>
                    {values.request_type === 'COMPANY' ? (
                      <div className="register-dept-tags">
                        {departments.map(d => (
                          <div
                            key={d.id} onClick={() => {
                              const arr = Array.isArray(values.target_departments) ? values.target_departments : [];
                              setFieldValue('target_departments', arr.includes(d.id) ? arr.filter(i => i !== d.id) : [...arr, d.id]);
                            }}
                            className={`register-dept-tag ${values.target_departments?.includes(d.id) ? 'selected' : ''}`}
                          >
                            {values.target_departments?.includes(d.id) ? '✓ ' : '+ '}{d.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Field as="select" name="department" className="register-select">
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </Field>
                    )}
                    <ErrorMessage name={values.request_type === 'COMPANY' ? 'target_departments' : 'department'} component="div" className="register-error" />
                  </div>

                  <div className="register-field">
                    <label className="register-label">Email</label>
                    <Field name="email" placeholder="identifier@university.edu" className="register-input" />
                    <ErrorMessage name="email" component="div" className="register-error" />
                  </div>
                </div>

                <div className="register-divider" />

                {/* Role Specifics */}
                <div>
                  {values.request_type === 'STUDENT' && <StudentFields errors={errors} touched={touched} />}
                  {values.request_type === 'COMPANY' && <CompanyFields errors={errors} touched={touched} />}
                  {values.request_type === 'DEPARTMENT' && <DepartmentFields errors={errors} touched={touched} />}
                </div>

                <div style={{ marginTop: 32 }}>
                   <FileUpload onFileSelect={setUploadedFile} onFileRemove={() => setUploadedFile(null)} error={!uploadedFile && touched.document ? 'Registration document required' : null} />
                </div>

                {submitError && <div className="register-alert">{submitError}</div>}

                <button type="submit" className="register-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>

                <div className="register-footer">
                  <span className="register-footer-text">Already have an account? </span>
                  <a href="/login" className="register-link">Sign In here</a>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div className="register-field">
    <label className="register-label">{label}</label>
    <Field {...props} className="register-input" />
    <ErrorMessage name={props.name} component="div" className="register-error" />
  </div>
);

const StudentFields = () => (
  <div className="register-grid-full">
    <Input name="student_full_name" label="Full Name" />
    <Input name="student_phone" label="Phone Number" placeholder="+251..." />
    <Input name="student_dob" label="Date of Birth" type="date" />
    <div className="register-field">
      <label className="register-label">Gender</label>
      <Field as="select" name="student_gender" className="register-select">
        <option value="">Select</option>
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
      </Field>
      <ErrorMessage name="student_gender" component="div" className="register-error" />
    </div>
    <div className="register-field-full">
      <Input name="student_university_id" label="University ID" />
    </div>
    <div className="register-field">
      <label className="register-label">Batch/Cohort</label>
      <Field as="select" name="student_batch" className="register-select">
        <option value="">Select Batch</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
        <option value="Fall 2024">Fall 2024</option>
        <option value="Spring 2024">Spring 2024</option>
        <option value="Batch A 2024">Batch A 2024</option>
        <option value="Batch B 2024">Batch B 2024</option>
      </Field>
      <ErrorMessage name="student_batch" component="div" className="register-error" />
      <span className="register-field-hint">Select your batch or cohort year</span>
    </div>
    <div className="register-field">
      <label className="register-label">Year of Study</label>
      <Field as="select" name="student_year_of_study" className="register-select">
        <option value="">Select Year</option>
        <option value="1">1st Year</option>
        <option value="2">2nd Year</option>
        <option value="3">3rd Year</option>
        <option value="4">4th Year</option>
        <option value="5">5th Year</option>
      </Field>
      <ErrorMessage name="student_year_of_study" component="div" className="register-error" />
    </div>
    <div className="register-field register-field-full">
      <label className="register-label">Skills</label>
      <Field as="textarea" name="student_skills" rows="3" placeholder="Python, Django, React..." className="register-textarea" />
      <ErrorMessage name="student_skills" component="div" className="register-error" />
    </div>
  </div>
);

const CompanyFields = () => (
  <div className="register-grid-full">
    <Input name="company_name" label="Company Name" />
    <Input name="company_phone" label="Phone Number" />
    <div className="register-field-full"><Input name="company_address" label="Address" /></div>
    <Input name="company_city" label="City" />
    <Input name="company_contact_person" label="Contact Person" />
    <Input name="company_contact_title" label="Job Title" />
    <div className="register-field register-field-full">
      <label className="register-label">Description</label>
      <Field as="textarea" name="company_description" rows="4" className="register-textarea" />
      <ErrorMessage name="company_description" component="div" className="register-error" />
    </div>
  </div>
);

const AdvisorFields = () => (
  <div className="register-grid-full">
    <Input name="advisor_full_name" label="Advisor Name" />
    <Input name="advisor_phone" label="Phone Number" />
    <div className="register-field-full"><Input name="advisor_staff_id" label="Staff ID" /></div>
  </div>
);

const DepartmentFields = () => (
  <div className="register-grid-full">
    <div className="register-field-full"><Input name="department_name" label="Department Name" /></div>
    <Input name="department_head_name" label="Department Head" />
    <Input name="department_phone" label="Phone Number" />
  </div>
);

export default Register;