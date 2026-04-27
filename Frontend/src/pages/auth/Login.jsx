/**
 * Login Page - Upwork-Inspired Design
 * Secure authentication portal for all users.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../hooks/useAuth';
import useAuthRedirect from '../../hooks/useAuthRedirect';
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
