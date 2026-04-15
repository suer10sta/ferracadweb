import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const ProtectedRoute = () => {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    // Auth check in progress
    return <div>Chargement...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/connexion" replace />;
};

export default ProtectedRoute;
