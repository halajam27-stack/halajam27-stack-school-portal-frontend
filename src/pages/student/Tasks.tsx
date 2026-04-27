import { useEffect, useState } from 'react';
import { ClipboardList, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TaskItem {
  id: number;
  subject: string;
  description: string;
  dueDate: string;
  createdAt: string;
  className: string;
  sectionName: string;
  color: string;
}

const taskColors = [
  'bg-peach',
  'bg-soft-yellow',
  'bg-soft-pink',
  'bg-soft-green',
  'bg-baby-blue',
  'bg-soft-purple',
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function isUpcoming(dateString: string) {
  const today = new Date();
  const dueDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDays <= 2 && diffDays >= 0;
}

function isExpired(dateString: string) {
  const today = new Date();
  const dueDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

export default function StudentTasks() {
  const { toast } = useToast();
  const { student } = useAuth();

  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!student?.naturalId || !student?.semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/student/tasks/${student.naturalId}/${student.semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل الواجبات',
            variant: 'destructive',
          });
          return;
        }

       const sortedData = [...data].sort((a: any, b: any) => {
  const aExpired = isExpired(a.TaskDate);
  const bExpired = isExpired(b.TaskDate);

  if (aExpired && !bExpired) return 1;
  if (!aExpired && bExpired) return -1;

  const aDueDate = new Date(a.TaskDate).getTime();
  const bDueDate = new Date(b.TaskDate).getTime();

  // إذا الاثنين منتهيات: الأحدث أولاً، الأقدم آخر شيء
  if (aExpired && bExpired) {
    return bDueDate - aDueDate;
  }

  // إذا الاثنين غير منتهيات: الأقرب أولاً
  return aDueDate - bDueDate;
});

        const formatted: TaskItem[] = sortedData.map((task: any, index: number) => ({
          id: task.TaskID,
          subject: task.SubjectName,
          description: task.TaskInfo,
          dueDate: task.TaskDate,
          createdAt: task.CreatedAt,
          className: task.ClassName,
          sectionName: task.SectionName,
          color: isExpired(task.TaskDate) ? 'bg-gray-400' : taskColors[index % taskColors.length],
        }));

        setTasks(formatted);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchTasks();
  }, [student, toast]);

  return (
    <DashboardLayout
      title="المهام والواجبات"
      subtitle="متابعة الواجبات المدرسية"
      showBackButton
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-soft-yellow flex items-center justify-center">
          <ClipboardList size={24} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">الواجبات القادمة</h2>
          <p className="text-sm text-muted-foreground">{tasks.length} واجبات</p>
        </div>
      </div>

      <div className="space-y-4">
        {tasks.map((task, index) => {
          const expired = isExpired(task.dueDate);
const upcoming = !expired && isUpcoming(task.dueDate);

          return (
            <Card
  key={task.id}
  className={`animate-slide-up overflow-hidden ${
    expired
      ? 'bg-gray-100 border-gray-300'
      : upcoming
      ? 'bg-[#EAF7F5] border-[#CFEAE5]'
      : ''
  }`}
  style={{ animationDelay: `${index * 0.1}s` }}
>
              <div
  className={`h-2 ${
    expired ? 'bg-gray-400' : upcoming ? 'bg-[#BFE5DE]' : task.color
  }`}
/>

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                 <CardTitle className={`text-lg flex items-center gap-2 ${expired ? 'text-gray-500 font-normal' : ''}`}>
                    <BookOpen size={18} />
                    {task.subject}
                  </CardTitle>

                  {!expired && isUpcoming(task.dueDate) && (
                    <Badge variant="destructive" className="animate-bounce-soft">
                      قريباً
                    </Badge>
                  )}

                  {expired && (
                    <Badge className="bg-gray-500 hover:bg-gray-500 text-white">
                      منتهي
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <p className={`mb-3 ${expired ? 'text-gray-500 font-normal' : 'text-foreground font-medium'}`}>
  {task.description}
</p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>موعد التسليم: {formatDate(task.dueDate)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ClipboardList size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-medium text-foreground">لا توجد واجبات حالياً</p>
            <p className="text-muted-foreground">عمل رائع! استمر في التفوق</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}