import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // Show nothing while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If user is not authenticated, redirect to login
  // The key fix: We use 'replace' to overwrite the current history entry instead of adding a new one
  // This helps prevent navigation loops and the "Maximum update depth exceeded" error
  // We also ensure we're rendering this conditionally to avoid unnecessary re-renders
  if (!currentUser) return (
    <Navigate 
      to="/login" 
      state={{ from: location.pathname }} 
      replace={true} // This is critical to prevent infinite redirects
    />
  );
  
  // If we get here, the user is authenticated, so render children
  return children;
}

export default ProtectedRoute;