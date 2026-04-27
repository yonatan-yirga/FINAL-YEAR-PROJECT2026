/**
 * PostInternship Page 
 * Company form for posting AND editing internship opportunities
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Header from '../../components/common/Header';
import SkillsInput from '../../components/forms/SkillsInput';
import internshipService from '../../services/internshipService';
import './PostInternship.css';

const buildSchema = (isEdit) =>
  Yup.object().shape({
    title: Yup.string()
      .min(10, 'Title must be at least 10 characters')
      .max(200, 'Title must not exceed 200 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(50, 'Description must be at least 50 characters')
      .max(2000, 'Description must not exceed 2000 characters')
      .required('Description is required'),
    required_skills: Yup.string()
      .test('min-skills', 'At least 2 skills are required', (value) => {
        if (!value) return false;
        return value.split(',').filter((s) => s.trim()).length >= 2;
      })
      .required('Skills are required'),
    location: Yup.string().required('Location is required'),
    duration_months: Yup.number()
      .min(1, 'Duration must be at least 1 month')
      .max(12, 'Duration cannot exceed 12 months')
      .required('Duration is required'),
    start_date: Yup.date().required('Start date is required'),
    application_deadline: Yup.date()
      .min(new Date(new Date().setHours(0,0,0,0)), 'Deadline cannot be in the past')
      .required('Application deadline is required'),
    max_applicants: Yup.number()
      .min(1, 'At least 1 applicant required')
      .max(50, 'Maximum 50 applicants allowed')
      .required('Max applicants is required'),
  });

const PostInternship = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isEdit = location.state?.isEdit === true;
  const editInternship = location.state?.internship || null;

  const [submitError, setSubmitError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [hasAcceptedApps, setHasAcceptedApps] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isEdit && editInternship) {
      setHasAcceptedApps((editInternship.accepted_count || 0) > 0);
    }
  }, [isEdit, editInternship]);

  const initialValues =
    isEdit && editInternship
      ? {
          title: editInternship.title || '',
          description: editInternship.description || '',
          required_skills: editInternship.required_skills || '',
          location: editInternship.location || '',
          duration_months: editInternship.duration_months || 6,
          start_date: editInternship.start_date || '',
          end_date: editInternship.end_date || '',
          application_deadline: editInternship.application_deadline || '',
          max_applicants: editInternship.max_applicants || 5,
        }
          : {
            title: '',
            description: '',
            required_skills: '',
            location: '',
            duration_months: 6,
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            application_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            max_applicants: 5,
          };

  // Format to YYYY-MM-DD using LOCAL date parts — NOT toISOString() which shifts
  // dates in UTC+ timezones (e.g. Ethiopia UTC+3 would show previous day).
  const formatDate = (val) => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d)) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitError('');
      const payload = {
        ...values,
        start_date: formatDate(values.start_date) || null,
        end_date: formatDate(values.end_date) || null,
        application_deadline: formatDate(values.application_deadline) || null,
      };
      const result = isEdit && editInternship
        ? await internshipService.update(editInternship.id, payload)
        : await internshipService.create(payload);

      if (result.success) {
        navigate('/company/my-internships', {
          state: {
            message: isEdit ? 'Internship updated successfully!' : 'Internship posted successfully!',
          },
        });
      } else {
        const errorMessage =
          typeof result.error === 'object'
            ? Object.values(result.error).flat().join(', ')
            : result.error;
        setSubmitError(errorMessage);
      }
    } catch {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
      setShowPreview(false);
    }
  };

  return (
    <div className="pi-page">
      <Header
        title={isEdit ? 'Edit Internship' : 'Post Internship'}
        subtitle={isEdit ? `Editing: ${editInternship?.title}` : 'Create a new internship opportunity'}
      />

      <div className="pi-content">

        {isEdit && hasAcceptedApps && (
          <div className="pi-warn-banner">
            ⚠️ This internship has accepted applications. Max applicants field is locked.
          </div>
        )}

        <div className="pi-form-card">
          <div className={`pi-mode-badge ${isEdit ? 'pi-mode-edit' : 'pi-mode-new'}`}>
            {isEdit ? '✏️ Edit Mode' : '📝 New Internship'}
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={buildSchema(isEdit)}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, isSubmitting, setFieldValue, setFieldTouched }) => (
              <Form className="pi-form">

                <div className="pi-group">
                  <label htmlFor="title">Internship Title <span className="pi-required">*</span></label>
                  <Field
                    type="text"
                    name="title"
                    id="title"
                    className={`pi-input ${errors.title && touched.title ? 'pi-error' : ''}`}
                    placeholder="e.g., Backend Developer Intern"
                  />
                  <ErrorMessage name="title" component="div" className="pi-error-msg" />
                  <div className="pi-char-count">{values.title.length} / 200</div>
                </div>

                <div className="pi-group">
                  <label htmlFor="description">Description <span className="pi-required">*</span></label>
                  <Field
                    as="textarea"
                    name="description"
                    id="description"
                    rows="6"
                    className={`pi-textarea ${errors.description && touched.description ? 'pi-error' : ''}`}
                    placeholder="Describe the internship role, responsibilities, and requirements..."
                  />
                  <ErrorMessage name="description" component="div" className="pi-error-msg" />
                  <div className="pi-char-count">{values.description.length} / 2000</div>
                </div>

                <div className="pi-group">
                  <label htmlFor="required_skills">Required Skills <span className="pi-required">*</span></label>
                  <SkillsInput
                    value={values.required_skills}
                    onChange={(value) => setFieldValue('required_skills', value)}
                    onBlur={() => setFieldTouched('required_skills')}
                    error={errors.required_skills && touched.required_skills ? errors.required_skills : null}
                  />
                </div>

                <div className="pi-group">
                  <label htmlFor="location">Location <span className="pi-required">*</span></label>
                  <Field
                    type="text"
                    name="location"
                    id="location"
                    className={`pi-input ${errors.location && touched.location ? 'pi-error' : ''}`}
                    placeholder="e.g., Addis Ababa"
                  />
                  <ErrorMessage name="location" component="div" className="pi-error-msg" />
                </div>

                <div className="pi-row">
                  <div className="pi-group">
                    <label htmlFor="duration_months">Duration (Months) <span className="pi-required">*</span></label>
                    <Field
                      as="select"
                      name="duration_months"
                      id="duration_months"
                      className={`pi-select ${errors.duration_months && touched.duration_months ? 'pi-error' : ''}`}
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'month' : 'months'}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="duration_months" component="div" className="pi-error-msg" />
                  </div>

                  <div className="pi-group">
                    <label htmlFor="max_applicants">Max Applicants <span className="pi-required">*</span></label>
                    <Field
                      type="number"
                      name="max_applicants"
                      id="max_applicants"
                      min="1"
                      max="50"
                      disabled={isEdit && hasAcceptedApps}
                      className={`pi-input ${errors.max_applicants && touched.max_applicants ? 'pi-error' : ''}`}
                    />
                    <ErrorMessage name="max_applicants" component="div" className="pi-error-msg" />
                  </div>
                </div>

                <div className="pi-row">
                  <div className="pi-group">
                    <label htmlFor="start_date">Start Date <span className="pi-required">*</span></label>
                    <Field
                      type="date"
                      name="start_date"
                      id="start_date"
                      min={isEdit ? undefined : today}
                      className={`pi-input ${errors.start_date && touched.start_date ? 'pi-error' : ''}`}
                    />
                    <ErrorMessage name="start_date" component="div" className="pi-error-msg" />
                  </div>

                  <div className="pi-group">
                    <label htmlFor="application_deadline">
                      Application Deadline 
                      <span style={{ fontSize: '10px', color: '#6366f1', marginLeft: '8px' }}>(Min: {today})</span>
                    </label>
                    <Field
                      type="date"
                      name="application_deadline"
                      id="application_deadline"
                      min={today}
                      max={values.start_date}
                      className={`pi-input ${errors.application_deadline && touched.application_deadline ? 'pi-error' : ''}`}
                    />
                    <ErrorMessage name="application_deadline" component="div" className="pi-error-msg" />
                  </div>
                </div>

                {submitError && (
                  <div className="pi-alert pi-alert-error">{submitError}</div>
                )}

                <div className="pi-actions">
                  <button
                    type="button"
                    className="pi-btn-cancel"
                    onClick={() => navigate('/company/my-internships')}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="pi-btn-preview"
                    disabled={isSubmitting}
                    onClick={() => { setPreviewData(values); setShowPreview(true); }}
                  >
                    Preview
                  </button>
                  <button type="submit" className="pi-btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><span className="pi-btn-spinner" />{isEdit ? 'Saving...' : 'Posting...'}</>
                    ) : (
                      isEdit ? '💾 Save Changes' : '🚀 Post Internship'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="pi-overlay" onClick={() => setShowPreview(false)}>
          <div className="pi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pi-modal-header">
              <h2>📋 Preview</h2>
              <button onClick={() => setShowPreview(false)}>×</button>
            </div>
            <div className="pi-modal-body">
              <h3 className="pi-preview-title">{previewData.title}</h3>
              <p className="pi-preview-company">Your Company</p>

              <div className="pi-preview-meta">
                <span className="pi-meta-chip">📍 {previewData.location}</span>
                <span className="pi-meta-chip">⏱ {previewData.duration_months} months</span>
                <span className="pi-meta-chip">👥 Max {previewData.max_applicants}</span>
                {previewData.start_date && (
                  <span className="pi-meta-chip">📅 Starts {previewData.start_date}</span>
                )}
                {previewData.application_deadline && (
                  <span className="pi-meta-chip">⏰ Deadline {previewData.application_deadline}</span>
                )}
              </div>

              <div className="pi-preview-section">
                <h4>Description</h4>
                <p>{previewData.description}</p>
              </div>

              <div className="pi-preview-section">
                <h4>Required Skills</h4>
                <div className="pi-preview-skills">
                  {previewData.required_skills.split(',').map((skill, i) => (
                    <span key={i} className="pi-skill-badge">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="pi-modal-footer">
              <button className="pi-btn-cancel" onClick={() => setShowPreview(false)}>← Back to Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostInternship;