import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes?: ('student' | 'teacher' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedTypes }: ProtectedRouteProps) {
  const { isAuthenticated, userType } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !userType) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedTypes && !allowedTypes.includes(userType)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
