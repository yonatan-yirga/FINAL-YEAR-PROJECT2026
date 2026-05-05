/**
 * PrivateRoute Component
 * Wrapper for protected routes that require authentication
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Loading Component
 * Displayed while checking authentication status
 */
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    color: '#666',
  }}>
    <div>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px',
      }}></div>
      <p>Loading...</p>
    </div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

/**
 * PrivateRoute Component
 * Checks authentication before rendering children
 * Redirects to login if not authenticated
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {React.ReactElement} Protected route or redirect
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  
  // Wait for auth context to complete initialization
  useEffect(() => {
    if (!isLoading) {
      setAuthCheckComplete(true);
    }
  }, [isLoading]);
  
  // Show loading state while checking authentication
  if (!authCheckComplete || isLoading) {
    return <LoadingSpinner />;
  }
  
  // If not authenticated, redirect to login with returnTo parameter
  if (!isAuthenticated) {
    const currentPath = window.location.pathname;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(currentPath)}`} replace />;
  }
  
  // User is authenticated, render children
  return children;
};

// PropTypes validation
PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;