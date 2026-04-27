/**
 * Modern Forgot Password Page - Upwork-Inspired Design
 * Features:
 * - Clean, minimal layout
 * - Two options: Reset link OR Temporary password
 * - Email validation
 * - Success confirmation
 * - Mobile responsive
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import authService from '../../services/authService';
import './ForgotPasswordModern.css';

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ForgotPasswordModern = () => {
  const [step, setStep] = useState('input'); // 'input', 'success'
  const [method, setMethod] = useState('link'); // 'link' or 'temp_password'
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setUserEmail(values.email);

      let result;
      if (method === 'link') {
        // Send reset link (existing functionality)
        result = await authService.forgotPassword(values.email);
      } else {
        // Send temporary password (new functionality)
        result = await authService.sendTemporaryPassword(values.email);
      }

      if (result.success) {
        setStep('success');
      } else {
        setError(result.error || 'Request failed. Please try again.');
      }
    } catch (error) {
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-modern-wrapper">
      {/* Left Panel - Branding */}
      <div className="forgot-password-modern-left">
        <div className="brand-container">
          <div className="brand-logo-section">
            <div className="logo-circle">
              <span className="logo-emoji">🔒</span>
            </div>
            <div className="logo-text-group">
              <h1 className="logo-title">DMU Portal</h1>
              <p className="logo-subtitle">Secure Password Recovery</p>
            </div>
          </div>

          <div className="brand-headline">
            <h2 className="headline-text">
              Forgot your password?<br />
              We've got you covered.
            </h2>
            <p className="headline-description">
              Choose your preferred recovery method and regain access to your account 
              securely within minutes.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="feature-text">Secure email verification</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="feature-text">Multiple recovery options</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="feature-text">Instant password delivery</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="feature-text">24/7 account protection</span>
            </div>
          </div>

          <div className="brand-decoration decoration-1"></div>
          <div className="brand-decoration decoration-2"></div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="forgot-password-modern-right">
        <div className="forgot-password-card-modern">
          {step === 'input' ? (
            <>
              {/* Header */}
              <div className="forgot-password-header-modern">
                <h2 className="forgot-password-title">Reset your password</h2>
                <p className="forgot-password-subtitle">
                  Enter your email address and choose how you'd like to recover your account
                </p>
              </div>

              <Formik
                initialValues={{ email: '' }}
                validationSchema={EmailSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="forgot-password-form-modern">
                    {/* Email Input */}
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
                        autoComplete="email"
                      />
                      <ErrorMessage name="email" component="div" className="error-message-modern" />
                    </div>

                    {/* Recovery Method Selection */}
                    <div className="recovery-method-section">
                      <label className="form-label-modern">Recovery method</label>
                      <div className="recovery-methods">
                        <div 
                          className={`recovery-method-card ${method === 'link' ? 'selected' : ''}`}
                          onClick={() => setMethod('link')}
                        >
                          <div className="method-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                          </div>
                          <div className="method-content">
                            <h4 className="method-title">Reset Link</h4>
                            <p className="method-description">
                              Receive a secure link to create a new password
                            </p>
                          </div>
                          <div className="method-check">
                            {method === 'link' && (
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            )}
                          </div>
                        </div>

                        <div 
                          className={`recovery-method-card ${method === 'temp_password' ? 'selected' : ''}`}
                          onClick={() => setMethod('temp_password')}
                        >
                          <div className="method-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                          </div>
                          <div className="method-content">
                            <h4 className="method-title">Temporary Password</h4>
                            <p className="method-description">
                              Get a temporary password sent to your email instantly
                            </p>
                          </div>
                          <div className="method-check">
                            {method === 'temp_password' && (
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                      <div className="alert-error-modern">
                        <svg className="alert-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className="btn-primary-modern" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-modern"></span>
                          <span>Sending...</span>
                        </>
                      ) : (
                        method === 'link' ? 'Send Reset Link' : 'Send Temporary Password'
                      )}
                    </button>

                    {/* Back to Login */}
                    <div className="form-footer-modern">
                      <Link to="/login-modern" className="link-secondary-modern">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                        </svg>
                        Back to Login
                      </Link>
                    </div>
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            /* Success Screen */
            <div className="success-screen-modern">
              <div className="success-icon-modern">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#10B981"/>
                  <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="success-title-modern">Check your email</h2>
              <p className="success-message-modern">
                {method === 'link' ? (
                  <>
                    We've sent a password reset link to <strong>{userEmail}</strong>.
                    Click the link in the email to create a new password.
                  </>
                ) : (
                  <>
                    We've sent a temporary password to <strong>{userEmail}</strong>.
                    Use it to log in, then change your password immediately for security.
                  </>
                )}
              </p>
              <div className="success-info-modern">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <span>
                  {method === 'link' 
                    ? 'The link expires in 1 hour. Check your spam folder if you don\'t see it.'
                    : 'The temporary password is valid for 24 hours. Change it after logging in.'
                  }
                </span>
              </div>
              <div className="success-actions-modern">
                <Link to="/login-modern" className="btn-primary-modern">
                  Go to Login
                </Link>
                <button 
                  onClick={() => {
                    setStep('input');
                    setError('');
                  }}
                  className="btn-secondary-modern"
                >
                  Send Again
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="bottom-notice-modern">
          © 2026 Debre Markos University. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordModern;
