import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageCircle, Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    id: 'subjects',
    title: 'المواد الدراسية',
    description: 'إدارة الصفوف والمواد التي تدرسها',
    icon: BookOpen,
    variant: 'peach' as const,
    path: '/teacher/subjects',
  },
  {
    id: 'messages',
    title: 'الرسائل',
    description: 'التواصل مع أولياء الأمور',
    icon: MessageCircle,
    variant: 'babyBlue' as const,
    path: '/teacher/messages',
  },
];

export default function TeacherDashboard() {
  const { employee } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);

  const semesterId = localStorage.getItem('adminSelectedSemester');
  const teacherId = employee?.naturalId || '';

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!teacherId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/messages/unread-count/${teacherId}/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          setUnreadCount(0);
          return;
        }

        setUnreadCount(Number(data.UnreadCount) || 0);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
  }, [teacherId, semesterId]);

  return (
    <DashboardLayout
      title={`أهلاً بك يا ${employee?.fullName || 'المعلم'}`}
      subtitle={employee?.semesterName || 'الفصل الدراسي'}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {menuItems.map((item) => (
          <Card
            key={item.id}
            variant={item.variant}
            onClick={() => navigate(item.path)}
            className="group relative"
          >
            {item.id === 'messages' && unreadCount > 0 && (
              <div className="absolute -top-3 -left-3 min-w-[28px] h-7 px-2 rounded-full bg-red-700 flex items-center justify-center shadow-md animate-pulse">
              <span className="text-white text-sm font-bold">
              {unreadCount}
             </span>
             </div>
            )}

            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-card/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <item.icon size={40} className="text-foreground" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}