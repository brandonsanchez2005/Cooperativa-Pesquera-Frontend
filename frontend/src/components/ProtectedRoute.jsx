import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

export default function ProtectedRoute() {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <span className="spinner-border text-sea" />
        <span>Restaurando sesión…</span>
      </div>
    );
  }

  return token
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />;
}
