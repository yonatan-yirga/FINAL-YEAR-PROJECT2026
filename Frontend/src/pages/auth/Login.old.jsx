/**
 * Login Page
 * Secure authentication portal for all users.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import useAuth from '../../hooks/useAuth';
import useAuthRedirect from '../../hooks/useAuthRedirect';
import { G, T } from '../Dashboards';

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
    <div className="login-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-root)' }}>
      <style>{G}</style>
      
      {/* Welcome Panel (Left) */}
      <div style={{ 
        flex: 1.2, background: 'linear-gradient(135deg, var(--accent-navy) 0%, #000 150%)', 
        padding: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', 
        position: 'relative', overflow: 'hidden', color: '#fff' 
      }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'var(--accent-gold)', opacity: 0.1, filter: 'blur(100px)', borderRadius: '50%' }} />
        
        <div style={{ animation: 'cardEnter 0.8s ease-out' }}>
          <div style={{ fontSize: 72, marginBottom: 32 }}>🎓</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 28, letterSpacing: '-2px' }}>
            DMU Internship<br />Portal
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 480, marginBottom: 48 }}>
            Debre Markos University's platform for managing 
            academic internships, advisor support, and industry partnerships.
          </p>

          <div style={{ display: 'grid', gap: 16 }}>
            {[
              'User Management',
              'Student Monitoring',
              'Certificate Verification',
              'Department Statistics',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                <div style={{ width: 8, height: 8, background: 'var(--accent-gold)', borderRadius: '2px', transform: 'rotate(45deg)' }} />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Login (Right) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div className="db-card" style={{ width: '100%', maxWidth: 440, padding: '48px', animation: 'cardEnter 0.6s ease-out' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-bright)', marginBottom: 8 }}>Sign In</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
              {returnTo ? 'Sign in to continue to your application' : 'Sign in to access your dashboard'}
            </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '', rememberMe: false }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Email</label>
                  <Field
                    type="email" name="email"
                    placeholder="identifier@university.edu"
                    style={{
                      padding: '14px 16px', fontSize: 14, borderRadius: 12, outline: 'none',
                      background: 'var(--bg-root)', border: `1.5px solid ${errors.email && touched.email ? 'var(--status-error)' : 'var(--border-subtle)'}`,
                      color: 'var(--text-bright)', transition: 'var(--transition)'
                    }}
                  />
                  <ErrorMessage name="email" component="div" style={{ fontSize: 12, color: 'var(--status-error)', fontWeight: 600, marginTop: 4 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Password</label>
                  <Field
                    type="password" name="password"
                    placeholder="••••••••"
                    style={{
                      padding: '14px 16px', fontSize: 14, borderRadius: 12, outline: 'none',
                      background: 'var(--bg-root)', border: `1.5px solid ${errors.password && touched.password ? 'var(--status-error)' : 'var(--border-subtle)'}`,
                      color: 'var(--text-bright)', transition: 'var(--transition)'
                    }}
                  />
                  <ErrorMessage name="password" component="div" style={{ fontSize: 12, color: 'var(--status-error)', fontWeight: 600, marginTop: 4 }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600 }}>
                    <Field type="checkbox" name="rememberMe" style={{ width: 18, height: 18, accentColor: 'var(--accent-navy)' }} />
                    Remember Me
                  </label>
                  <a href="/forgot-password" style={{ color: 'var(--accent-navy)', fontWeight: 700, textDecoration: 'none' }}>Forgot password?</a>
                </div>

                {loginError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--status-error)', borderRadius: 12, padding: '14px 16px', color: 'var(--status-error)', fontSize: 13, fontWeight: 600 }}>
                    {loginError}
                  </div>
                )}

                <button type="submit" className="db-nav" disabled={isSubmitting || isLoading} style={{ padding: '16px', background: 'var(--accent-navy)', color: '#fff', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 16 }}>
                  {isSubmitting || isLoading ? 'Logging in...' : 'Login'}
                </button>

                <div style={{ textAlign: 'center', fontSize: 14 }}>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                    Don't have an account? <a href="/register" style={{ color: 'var(--accent-navy)', fontWeight: 800, textDecoration: 'none' }}>Register</a>
                  </p>
                  <p style={{ marginTop: 12 }}>
                    <a href="/verify" style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textDecoration: 'none', borderBottom: '1px solid var(--border-subtle)' }}>Verify Certificate</a>
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