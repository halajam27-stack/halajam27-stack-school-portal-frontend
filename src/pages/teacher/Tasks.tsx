import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ClipboardList, Calendar, Plus, Trash2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: number;
  description: string;
  dueDate: string;
  createdAt: string;
}

interface ClassInfo {
  sectionId: number;
  sectionName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  semesterName: string;
}

export default function TeacherTasks() {
  const { sectionId, subjectId } = useParams();
  const { toast } = useToast();
  const semesterId = localStorage.getItem('adminSelectedSemester');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [classData, setClassData] = useState<ClassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const isTaskExpired = (dateString: string) => {
    if (!dateString) return false;

    const today = new Date();
    const taskDueDate = new Date(dateString);

    today.setHours(0, 0, 0, 0);
    taskDueDate.setHours(0, 0, 0, 0);

    return taskDueDate < today;
  };

  const isUpcoming = (dateString: string) => {
    if (!dateString) return false;

    const today = new Date();
    const taskDueDate = new Date(dateString);

    today.setHours(0, 0, 0, 0);
    taskDueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (taskDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diffDays <= 2 && diffDays >= 0;
  };

  const fetchClassInfo = async () => {
    if (!sectionId || !subjectId || !semesterId) return;

    try {
      const res = await fetch(
        `https://school-portal-backend-new-cfr6.onrender.com/teacher/class-info/${sectionId}/${subjectId}/${semesterId}`
      );
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل تحميل بيانات الصف',
          variant: 'destructive',
        });
        return;
      }

      setClassData({
        sectionId: data.SectionID,
        sectionName: data.SectionName,
        subjectId: data.SubjectID,
        subjectName: data.SubjectName,
        classId: data.ClassID,
        className: data.ClassName,
        semesterName: data.SemesterName,
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    }
  };

  const fetchTasks = async () => {
    if (!sectionId || !subjectId || !semesterId) return;

    try {
      const res = await fetch(
        `https://school-portal-backend-new-cfr6.onrender.com/teacher/tasks/${sectionId}/${subjectId}/${semesterId}`
      );
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل تحميل المهام',
          variant: 'destructive',
        });
        return;
      }

      const formatted: Task[] = data
        .map((task: any) => ({
          id: task.TaskID,
          description: task.TaskInfo,
          dueDate: task.TaskDate || '',
          createdAt: task.CreatedAt || '',
        }))
.sort((a, b) => {
  const aExpired = isTaskExpired(a.dueDate);
  const bExpired = isTaskExpired(b.dueDate);

  if (aExpired && !bExpired) return 1;
  if (!aExpired && bExpired) return -1;

  const aDueDate = new Date(a.dueDate).getTime();
  const bDueDate = new Date(b.dueDate).getTime();

  const aCreatedAt = new Date(a.createdAt).getTime();
  const bCreatedAt = new Date(b.createdAt).getTime();

  // إذا الاثنين منتهيات: الأحدث إنشاءً أولاً، الأقدم إنشاءً آخر شيء
  if (aExpired && bExpired) {
    return bCreatedAt - aCreatedAt;
  }

  // إذا الاثنين غير منتهيات: الأقرب تسليماً أولاً
  return aDueDate - bDueDate;
});

      setTasks(formatted);
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchClassInfo();
    fetchTasks();
  }, [sectionId, subjectId, semesterId]);

  const handleAddTask = async () => {
    if (!newTask.trim() || !dueDate) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    if (!sectionId || !subjectId || !semesterId) {
      toast({
        title: 'خطأ',
        description: 'بيانات الصفحة ناقصة',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('https://school-portal-backend-new-cfr6.onrender.com/teacher/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: Number(sectionId),
          subjectId: Number(subjectId),
          semesterId: Number(semesterId),
          taskInfo: newTask,
          taskDate: dueDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل إضافة المهمة',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      setNewTask('');
      setDueDate('');
      fetchTasks();

      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة المهمة بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/teacher/tasks/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حذف المهمة',
          variant: 'destructive',
        });
        return;
      }

      setTasks(tasks.filter((t) => t.id !== id));

      toast({
        title: 'تم الحذف',
        description: 'تم حذف المهمة بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout
      title="الواجبات والمهام"
      subtitle={`${classData?.subjectName || 'المادة'} | ${classData?.className || 'الصف'} - شعبة ${classData?.sectionName || ''}`}
      showBackButton
      backPath={`/teacher/class/${sectionId}/${subjectId}`}
    >
      <div className="grid gap-6">
        <Card className="border-2 border-dashed border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={20} />
              إضافة مهمة جديدة
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>وصف المهمة</Label>
              <Textarea
                placeholder="اكتب وصف المهمة هنا..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ التسليم</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="pr-10"
                />
                <Calendar
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
              </div>
            </div>

            <Button onClick={handleAddTask} className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري الإرسال...' : 'إرسال المهمة'}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-soft-yellow flex items-center justify-center">
              <ClipboardList size={20} className="text-foreground" />
            </div>
            <h2 className="text-lg font-bold">المهام السابقة</h2>
          </div>

          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                لا توجد مهام مضافة بعد
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, index) => {
                const expired = isTaskExpired(task.dueDate);
                const upcoming = !expired && isUpcoming(task.dueDate);

                return (
                  <Card
                    key={task.id}
                    className={`animate-fade-in overflow-hidden ${
                      expired
                        ? 'bg-gray-100 border-gray-300'
                        : upcoming
                        ? 'bg-[#EAF7F5] border-[#CFEAE5]'
                        : ''
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className={`h-2 ${
                        expired
                          ? 'bg-gray-400'
                          : upcoming
                          ? 'bg-[#BFE5DE]'
                          : 'bg-soft-yellow'
                      }`}
                    />

                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle
                          className={`text-lg flex items-center gap-2 ${
                            expired ? 'text-gray-500 font-normal' : 'text-foreground'
                          }`}
                        >
                          <BookOpen size={18} />
                          المهمة
                        </CardTitle>

                        <div className="flex items-center gap-2">
                          {upcoming && (
                            <Badge variant="destructive" className="animate-bounce-soft">
                              قريباً
                            </Badge>
                          )}

                          {expired && (
                            <Badge className="bg-gray-500 hover:bg-gray-500 text-white">
                              منتهي
                            </Badge>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p
                        className={`mb-3 ${
                          expired
                            ? 'text-gray-500 font-normal'
                            : 'text-foreground font-medium'
                        }`}
                      >
                        {task.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>تاريخ الإنشاء: {formatDate(task.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>تاريخ التسليم: {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}