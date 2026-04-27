/**
 * Registration Page - Upwork-Inspired Design
 * System for role-based user registration.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CheckCircle } from 'lucide-react';
import registrationService from '../../services/registrationService';
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