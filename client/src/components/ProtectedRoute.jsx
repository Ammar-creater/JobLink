import { Navigate } from 'react-router-dom';
import authAPI from '../services/auth';

/**
 * Guards a route by required role(s).
 * - If not logged in → redirect to /login
 * - If logged in but role not allowed → redirect to /jobs
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const user = authAPI.getCurrentUser();
  const isLoggedIn = authAPI.isAuthenticated();

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/jobs" replace />;
  }

  return children;
}