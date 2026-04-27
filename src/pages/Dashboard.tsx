import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import StudentDashboard from '@/components/dashboards/StudentDashboard';
import TeacherDashboard from '@/components/dashboards/TeacherDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

export default function Dashboard() {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated || !userType) {
    return <Navigate to="/" replace />;
  }

  switch (userType) {
    case 'student':
      return <StudentDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
}