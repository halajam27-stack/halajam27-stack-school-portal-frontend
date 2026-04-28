import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, ClipboardList, Award, MessageCircle, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  {
    id: 'subjects',
    title: 'المواد الدراسية',
    icon: BookOpen,
    variant: 'peach' as const,
    path: '/student/subjects',
  },
  {
    id: 'schedule',
    title: 'الجدول الدراسي',
    icon: Calendar,
    variant: 'babyBlue' as const,
    path: '/student/schedule',
  },
  {
    id: 'tasks',
    title: 'المهام والواجبات',
    icon: ClipboardList,
    variant: 'yellow' as const,
    path: '/student/tasks',
  },
  {
    id: 'grades',
    title: 'العلامات',
    icon: Award,
    variant: 'pink' as const,
    path: '/student/grades',
  },
  {
    id: 'messages',
    title: 'الرسائل',
    icon: MessageCircle,
    variant: 'green' as const,
    path: '/student/messages',
  },
  {
    id: 'attendance',
    title: 'الحضور والغياب',
    icon: UserCheck,
    variant: 'purple' as const,
    path: '/student/attendance',
  },
];

interface StudentDashboardData {
  FullName: string;
  SemesterName: string;
  ClassName: string | null;
  SectionName: string | null;
}

export default function StudentDashboard() {
  const { student } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!student?.naturalId || !student?.semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/student/dashboard/${student.naturalId}/${student.semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل بيانات الطالب',
            variant: 'destructive',
          });
          return;
        }

        setDashboardData(data);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchDashboardData();
  }, [student, toast]);

  useEffect(() => {
    const fetchUnreadMessagesCount = async () => {
      if (!student?.naturalId || !student?.semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/student/messages/unread-count/${student.naturalId}/${student.semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          return;
        }

        setUnreadMessagesCount(Number(data.unreadCount || 0));
      } catch {
        setUnreadMessagesCount(0);
      }
    };

    fetchUnreadMessagesCount();
  }, [student]);

  return (
    <DashboardLayout
      title={`أهلاً بك يا ${dashboardData?.FullName || student?.fullName || 'الطالب'}`}
      subtitle={
        dashboardData
          ? `${dashboardData.ClassName || 'الصف غير محدد'} - شعبة ${dashboardData.SectionName || 'غير محددة'} | ${dashboardData.SemesterName || ''}`
          : 'جاري تحميل بيانات الطالب...'
      }
    >
      <div className="mb-8 p-6 rounded-2xl gradient-warm">
        <p className="text-lg font-medium text-foreground">
          من هنا تبدأ قصة إبداعك ✨
        </p>
        <p className="text-muted-foreground">اكتشف دروسك وتابع تقدمك</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item, index) => (
          <Card
            key={item.id}
            variant={item.variant}
            onClick={() => navigate(item.path)}
            className="group relative"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
 {item.id === 'messages' && unreadMessagesCount > 0 && (
  <div className="absolute -top-3 -left-3 min-w-[28px] h-7 px-2 rounded-full bg-red-700 flex items-center justify-center shadow-md animate-pulse">
    <span className="text-white text-sm font-bold">
      {unreadMessagesCount}
    </span>
  </div>
)}

            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-card/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <item.icon size={32} className="text-foreground" />
              </div>
              <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}