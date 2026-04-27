/**
 * useAuth Hook
 * Custom hook to access authentication context
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook to access auth context
 * @throws {Error} If used outside AuthProvider
 * @returns {object} Auth context value
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null || context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your app with <AuthProvider> to use authentication.'
    );
  }
  
  return context;
};

export default useAuth;