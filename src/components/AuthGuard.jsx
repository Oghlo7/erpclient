import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function AuthGuard({ children }) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();
  
  useEffect(() => {
    // Check if token is valid on component mount
    checkAuth();
  }, [checkAuth]);
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}