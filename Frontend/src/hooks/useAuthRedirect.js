/**
 * useAuthRedirect Hook
 * Redirects authenticated users to their role-based dashboard
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth';

/**
 * Get dashboard route based on user role
 * @param {string} role - User role
 * @returns {string} Dashboard route
 */
const getDashboardRoute = (role) => {
  const routes = {
    STUDENT: '/student/dashboard',
    COMPANY: '/company/dashboard',
    ADVISOR: '/advisor/dashboard',
    DEPARTMENT_HEAD: '/department/dashboard',
    UIL: '/uil/dashboard',
    ADMIN: '/admin/dashboard',
  };
  
  return routes[role] || '/';
};

/**
 * Hook to redirect authenticated users away from login page
 * Redirects to appropriate dashboard based on user role
 */
const useAuthRedirect = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading && isAuthenticated && user) {
      const dashboardRoute = getDashboardRoute(user.role);
      navigate(dashboardRoute, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);
};

export default useAuthRedirect;
export { getDashboardRoute };