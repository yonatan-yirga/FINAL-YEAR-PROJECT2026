/**
 * OAuth Callback Page
 * Handles the redirect from Google/GitHub OAuth
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import oauthService from '../../services/oauthService';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const provider = localStorage.getItem('oauth_provider') || 'google';

    if (error) {
      setStatus('error');
      setMessage(`Authentication failed: ${error}`);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Handle the callback
    const result = await oauthService.handleCallback(code, state, provider);

    if (result.success) {
      // Store the token
      const token = result.data.access_token || result.data.key;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        setStatus('success');
        setMessage('Login successful! Redirecting...');
        
        // Redirect based on role
        const role = result.data.user?.role;
        setTimeout(() => {
          if (role === 'STUDENT') navigate('/student/dashboard');
          else if (role === 'ADVISOR') navigate('/advisor/dashboard');
          else if (role === 'COMPANY') navigate('/company/dashboard');
          else if (role === 'DEPARTMENT_HEAD') navigate('/department/dashboard');
          else if (role === 'ADMIN') navigate('/admin/dashboard');
          else navigate('/');
        }, 1500);
      } else {
        setStatus('error');
        setMessage('No authentication token received');
        setTimeout(() => navigate('/login'), 3000);
      }
    } else {
      setStatus('error');
      setMessage(result.error || 'Authentication failed');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'processing' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>{message}</h2>
            <p style={styles.subtitle}>Please wait...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>{message}</h2>
            <p style={styles.subtitle}>Taking you to your dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.title}>Authentication Failed</h2>
            <p style={styles.subtitle}>{message}</p>
            <p style={styles.redirect}>Redirecting to login...</p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  successIcon: {
    width: '64px',
    height: '64px',
    background: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#ffffff',
    margin: '0 auto 24px',
    fontWeight: 'bold',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    background: '#ef4444',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#ffffff',
    margin: '0 auto 24px',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  redirect: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '16px',
  },
};

// Add keyframes for spinner animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default OAuthCallback;
