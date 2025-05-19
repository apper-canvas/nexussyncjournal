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
    // This helps prevent the infinite render loop
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Only render children when user is authenticated
  return children;
}

export default ProtectedRoute;