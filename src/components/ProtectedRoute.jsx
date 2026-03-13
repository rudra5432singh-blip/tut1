import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoaderSkeleton from './LoaderSkeleton';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-10"><LoaderSkeleton type="card" count={3} /></div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'Department Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
