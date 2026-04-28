import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TeacherSubjectItem {
  id: number;
  sectionId: number;
  subjectId: number;
  subject: string;
  classId: number;
  class: string;
  section: string;
  students: number;
}

const colors = ['peach', 'babyBlue', 'yellow', 'pink'] as const;

export default function TeacherSubjects() {
  const navigate = useNavigate();
  const { user, employee } = useAuth();
  const { toast } = useToast();

  const [teacherSubjects, setTeacherSubjects] = useState<TeacherSubjectItem[]>([]);

  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      if (!user?.naturalId || !user?.semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/subjects/${user.naturalId}/${user.semesterId}`
        );

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل مواد المعلم',
            variant: 'destructive'
          });
          return;
        }

const formatted = data
  .map((item: any, index: number) => ({
    id: index + 1,
    sectionId: item.SectionID,
    subjectId: item.SubjectID,
    subject: item.SubjectName,
    classId: item.ClassID,
    class: item.ClassName,
    section: item.SectionName,
    students: item.StudentsCount || 0,
  }))
  .sort((a, b) => {
    const classDiff = a.classId - b.classId;
    if (classDiff !== 0) return classDiff;

    const sectionDiff = a.section.localeCompare(b.section, 'ar');
    if (sectionDiff !== 0) return sectionDiff;

    return a.subject.localeCompare(b.subject, 'ar');
  });

        setTeacherSubjects(formatted);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive'
        });
      }
    };

    fetchTeacherSubjects();
  }, [user, toast]);

  return (
    <DashboardLayout
      title="المواد الدراسية"
      subtitle={employee?.semesterName || 'اختر الصف والشعبة'}
      showBackButton
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-peach flex items-center justify-center">
          <BookOpen size={24} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">الصفوف التي أدرسها</h2>
          <p className="text-sm text-muted-foreground">{employee?.semesterName || 'الفصل الدراسي'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teacherSubjects.map((item, index) => (
          <Card
            key={`${item.sectionId}-${item.subjectId}`}
            variant={colors[index % colors.length]}
            onClick={() => navigate(`/teacher/class/${item.sectionId}/${item.subjectId}`)}
            className="group animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{item.subject}</span>
                <ChevronLeft size={20} className="group-hover:translate-x-[-4px] transition-transform" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-lg">{item.class} - شعبة {item.section}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Users size={16} />
                <span>{item.students} طالب</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {teacherSubjects.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-10">
            لا توجد مواد مرتبطة بهذا المعلم بعد
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}