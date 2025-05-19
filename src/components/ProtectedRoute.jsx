import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // Show nothing while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    // Explicitly return Navigate component with replace to prevent adding to history
    // The 'replace' prop is critical here as it prevents the navigation from adding
    // a new entry to the history stack, which helps prevent infinite redirect loops
    return (
      <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
  }
  
  // If we get here, the user is authenticated, so render children
  return children;
}

export default ProtectedRoute;