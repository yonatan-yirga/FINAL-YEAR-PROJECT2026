/**
 * Login Page - Upwork-Inspired Design with OAuth
 * Secure authentication portal for all users.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../hooks/useAuth';
import useAuthRedirect from '../../hooks/useAuthRedirect';
import oauthService from '../../services/oauthService';
import dmuLogo from '../../assets/logodmu.jpg';
import './Login.css';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email required'),
  password: Yup.string().min(8, 'Password requires 8+ characters').required('Password required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState('');

  useAuthRedirect();

  const handleGoogleLogin = () => {
    sessionStorage.setItem('oauth_provider', 'google');
    window.location.href = oauthService.getGoogleAuthUrl();
  };

  const handleGitHubLogin = () => {
    sessionStorage.setItem('oauth_provider', 'github');
    window.location.href = oauthService.getGitHubAuthUrl();
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoginError('');
      const result = await login(values.email, values.password);
      if (result.success) {
        // If there's a returnTo URL, navigate there instead of dashboard
        if (returnTo) {
          navigate(returnTo, { replace: true });
        } else {
          // Default dashboard navigation
          const dashboardRoutes = {
            STUDENT:         '/student/dashboard',
            COMPANY:         '/company/dashboard',
            ADVISOR:         '/advisor/dashboard',
            DEPARTMENT_HEAD: '/department/dashboard',
            UIL:             '/uil/dashboard',
            ADMIN:           '/admin/dashboard',
          };
          navigate(dashboardRoutes[result.user.role] || '/', { replace: true });
        }
      } else {
        setLoginError(result.error || 'Login failed.');
      }
    } catch {
      setLoginError('Connection error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Welcome Panel (Left) */}
      <div className="login-welcome">
        <div className="login-welcome-content">
          <div className="login-logo">
            <img src={dmuLogo} alt="DMU Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">
            DMU Internship Portal
          </h1>
          <p className="login-subtitle">
            Debre Markos University's platform for managing academic internships, 
            advisor support, and industry partnerships.
          </p>

          <div className="login-features">
            {[
              'User Management',
              'Student Monitoring',
              'Certificate Verification',
              'Department Statistics',
            ].map(feature => (
              <div key={feature} className="login-feature">
                <span className="login-feature-icon"></span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2 className="login-form-title">Sign In</h2>
            <p className="login-form-subtitle">
              {returnTo ? 'Sign in to continue to your application' : 'Sign in to access your dashboard'}
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '', rememberMe: false }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="login-form">
                
                {/* OAuth Buttons */}
                {true && (
                  <>
                    <div className="oauth-buttons">
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="oauth-button google"
                      >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                          <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                        </svg>
                        Continue with Google
                      </button>

                      <button
                        type="button"
                        onClick={handleGitHubLogin}
                        className="oauth-button github"
                      >
                        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        Continue with GitHub
                      </button>
                    </div>

                    <div className="login-divider">
                      <span>OR</span>
                    </div>
                  </>
                )}
                
                <div className="login-field">
                  <label className="login-label">Email</label>
                  <Field
                    type="email"
                    name="email"
                    placeholder="identifier@university.edu"
                    className={`login-input ${errors.email && touched.email ? 'error' : ''}`}
                  />
                  <ErrorMessage name="email" component="div" className="login-error" />
                </div>

                <div className="login-field">
                  <label className="login-label">Password</label>
                  <Field
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className={`login-input ${errors.password && touched.password ? 'error' : ''}`}
                  />
                  <ErrorMessage name="password" component="div" className="login-error" />
                </div>

                <div className="login-options">
                  <label className="login-remember">
                    <Field type="checkbox" name="rememberMe" />
                    Remember Me
                  </label>
                  <a href="/forgot-password" className="login-forgot">
                    Forgot password?
                  </a>
                </div>

                {loginError && (
                  <div className="login-alert">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="login-button"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
                </button>

                <div className="login-footer">
                  <p className="login-footer-text">
                    Don't have an account?{' '}
                    <a href="/register" className="login-link">Register</a>
                  </p>
                  <p>
                    <a href="/verify" className="login-verify-link">
                      Verify Certificate
                    </a>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;
