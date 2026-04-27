/**
 * RoleRoute Component
 * Wrapper for role-specific routes
 * Checks if user has required role before rendering
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getDashboardRoute } from '../hooks/useAuthRedirect';

/**
 * RoleRoute Component
 * Checks user role before rendering children
 * Redirects to user's dashboard if wrong role
 * 
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string|string[]} props.allowedRoles - Role(s) allowed to access this route
 * @returns {React.ReactElement} Role-protected route or redirect
 */
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        Loading...
      </div>
    );
  }
  
  // No user (should not happen as PrivateRoute handles this)
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Normalize allowedRoles to array
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Check if user's role is in allowed roles
  const hasAccess = rolesArray.includes(user.role);
  
  if (!hasAccess) {
    // User doesn't have required role
    // Redirect to their own dashboard
    const userDashboard = getDashboardRoute(user.role);
    return <Navigate to={userDashboard} replace />;
  }
  
  // User has correct role, render children
  return children;
};

// PropTypes validation
RoleRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
};

export default RoleRoute;