/**
 * Modern Login Page - Upwork-Inspired Design
 * Features: 
 * - Clean, minimal layout
 * - Continue with Email flow (2-step authentication)
 * - Social auth ready (Google, Facebook placeholders)
 * - Smooth animations and transitions
 * - Mobile responsive
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../hooks/useAuth';
import useAuthRedirect from '../../hooks/useAuthRedirect';
import './LoginModern.css';

// Add animation keyframes
const animationStyles = `
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3) translateY(-20px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const LoginModern = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [step, setStep] = useState('email'); // 'email' or 'password'
  const [userEmail, setUserEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useAuthRedirect();

  const handleEmailSubmit = async (values) => {
    setUserEmail(values.email);
    setStep('password');
    setLoginError('');
  };

  const handlePasswordSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError('');
      const result = await login(userEmail, values.password);
      
      if (result.success) {
        const dashboardRoutes = {
          STUDENT:         '/student/dashboard',
          COMPANY:         '/company/dashboard',
          ADVISOR:         '/advisor/dashboard',
          DEPARTMENT_HEAD: '/department/dashboard',
          UIL:             '/uil/dashboard',
          ADMIN:           '/admin/dashboard',
        };
        navigate(dashboardRoutes[result.user.role] || '/', { replace: true });
      } else {
        setLoginError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      setLoginError('Connection error. Please check your internet and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setUserEmail('');
    setLoginError('');
  };

  return (
    <div className="login-modern-wrapper">
      <style>{animationStyles}</style>
      {/* Left Panel - Branding & Features */}
      <div className="login-modern-left">
        <div className="brand-container">
          {/* Logo */}
          <div className="brand-logo-section">
            <div className="logo-circle">
              <span className="logo-emoji" style={{
                display: 'inline-block',
                animation: 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}>🎓</span>
            </div>
            <div className="logo-text-group">
              <h1 className="logo-title" style={{
                animation: 'slideInRight 0.8s ease-out 0.2s both'
              }}>DMU Portal</h1>
              <p className="logo-subtitle">Internship Management System</p>
            </div>
          </div>

          {/* Main Headline */}
          <div className="brand-headline">
            <h2 className="headline-text" style={{
              animation: 'fadeInUp 0.8s ease-out 0.3s both'
            }}>
              Connect with opportunities.<br />
              Build your future.
            </h2>
            <p className="headline-description">
              Join Debre Markos University's comprehensive internship ecosystem 
              connecting students, advisors, and industry partners.
            </p>
          </div>

          {/* Feature List */}
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="feature-text">Streamlined internship management</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="feature-text">Real-time advisor support & monitoring</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="feature-text">Industry-verified digital certificates</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="feature-text">Comprehensive performance tracking</span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="brand-decoration decoration-1"></div>
          <div className="brand-decoration decoration-2"></div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-modern-right">
        <div className="login-card-modern">
          {/* Header */}
          <div className="login-header-modern">
            <h2 className="login-title">Log in to DMU Portal</h2>
            <p className="login-subtitle">
              New here? <Link to="/register-modern" className="link-primary">Create an account</Link>
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="social-login-buttons">
            <button type="button" className="btn-social-login" disabled title="Coming soon">
              <svg className="social-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                <path d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                <path d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                <path d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            
            <button type="button" className="btn-social-login" disabled title="Coming soon">
              <svg className="social-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.477 0 0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.879V12.89h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.989C16.343 19.129 20 14.99 20 10c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="login-divider">
            <span className="divider-text">or</span>
          </div>

          {/* Step 1: Email Input */}
          {step === 'email' && (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={EmailSchema}
              onSubmit={handleEmailSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="login-form-modern">
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

                  <button 
                    type="submit" 
                    className="btn-primary-modern" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-modern"></span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      'Continue with Email'
                    )}
                  </button>

                  <p className="form-footer-text-modern">
                    Don't have an account? <Link to="/register-modern" className="link-primary">Sign up</Link>
                  </p>
                </Form>
              )}
            </Formik>
          )}

          {/* Step 2: Password Input */}
          {step === 'password' && (
            <Formik
              initialValues={{ password: '', rememberMe: false }}
              validationSchema={PasswordSchema}
              onSubmit={handlePasswordSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="login-form-modern">
                  {/* Email Display with Change Button */}
                  <div className="email-display-modern">
                    <div className="email-display-content">
                      <span className="email-label-modern">Logging in as</span>
                      <span className="email-value-modern">{userEmail}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleBackToEmail}
                      className="btn-change-email-modern"
                    >
                      Change
                    </button>
                  </div>

                  {/* Password Field */}
                  <div className="form-group-modern">
                    <div className="label-row-modern">
                      <label htmlFor="password" className="form-label-modern">
                        Password
                      </label>
                      <Link to="/forgot-password" className="link-secondary-modern">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="password-input-wrapper-modern">
                      <Field
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        className={`input-modern ${errors.password && touched.password ? 'input-error' : ''}`}
                        autoFocus
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn-toggle-password-modern"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex="-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="error-message-modern" />
                  </div>

                  {/* Error Alert */}
                  {loginError && (
                    <div className="alert-error-modern">
                      <svg className="alert-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zM7 4a1 1 0 012 0v4a1 1 0 01-2 0V4zm1 7a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"/>
                      </svg>
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Remember Me Checkbox */}
                  <div className="form-checkbox-modern">
                    <label className="checkbox-label-modern">
                      <Field type="checkbox" name="rememberMe" className="checkbox-input-modern" />
                      <span className="checkbox-text-modern">Keep me logged in</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn-primary-modern" 
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? (
                      <>
                        <span className="spinner-modern"></span>
                        <span>Logging in...</span>
                      </>
                    ) : (
                      'Log in'
                    )}
                  </button>

                  {/* Back Button */}
                  <button 
                    type="button" 
                    onClick={handleBackToEmail}
                    className="btn-secondary-modern"
                  >
                    Back
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* Footer Links */}
          <div className="login-footer-modern">
            <Link to="/verify" className="footer-link-modern">Verify Certificate</Link>
            <span className="footer-divider-modern">•</span>
            <Link to="/help" className="footer-link-modern">Need Help?</Link>
          </div>
        </div>

        {/* Bottom Notice */}
        <p className="bottom-notice-modern">
          © 2026 Debre Markos University. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginModern;
