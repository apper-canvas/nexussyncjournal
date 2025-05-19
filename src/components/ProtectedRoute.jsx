import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  // Show nothing while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center min-h-[300px]">Loading...</div>;
  }
  
  if (!currentUser) {
    // If not authenticated, redirect to login using replace to avoid
    // adding a new entry in the history stack (prevents redirect loops)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated, render children
  return children;
}

export default ProtectedRoute;