import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** The inverse of ProtectedRoute — /login and /signup only make sense for a
    signed-out visitor. Without this, an already-authenticated user landing
    on either (a stale bookmark, back-button, or a shared link) sees a full
    sign-in/sign-up form instead of being sent somewhere useful. */
export default function GuestRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={user.role === 'admin' ? '/admin' : '/account/orders'} replace />;

  return children;
}
