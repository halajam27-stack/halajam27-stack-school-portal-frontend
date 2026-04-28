import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  ClipboardList,
  Award,
  Upload,
  ChevronLeft
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { id: 'students', title: 'طلاب الصف', icon: Users, variant: 'peach' as const },
  { id: 'attendance', title: 'تسجيل الحضور والغياب', icon: UserCheck, variant: 'babyBlue' as const },
  { id: 'tasks', title: 'الواجبات', icon: ClipboardList, variant: 'yellow' as const },
  { id: 'grades', title: 'علامات المادة', icon: Award, variant: 'pink' as const },
  { id: 'book', title: 'رفع كتاب المادة', icon: Upload, variant: 'green' as const },
];

interface ClassInfo {
  sectionId: number;
  sectionName: string;
  subjectId: number;
  subjectName: string;
  classId: number;
  className: string;
  semesterName: string;
}

export default function TeacherClassManagement() {
  const { sectionId, subjectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const semesterId = localStorage.getItem("adminSelectedSemester");
  const [classData, setClassData] = useState<ClassInfo | null>(null);

  useEffect(() => {
    const fetchClassInfo = async () => {
      if (!sectionId || !subjectId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/class-info/${sectionId}/${subjectId}/${semesterId}`
        );

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل بيانات الصف',
            variant: 'destructive'
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
          variant: 'destructive'
        });
      }
    };

    fetchClassInfo();
  }, [sectionId, subjectId, semesterId, toast]);

  const handleMenuClick = (id: string) => {
    navigate(`/teacher/class/${sectionId}/${subjectId}/${id}`);
  };

  return (
    <DashboardLayout
      title={`${classData?.className || 'الصف'} - شعبة ${classData?.sectionName || ''}`}
      subtitle={`${classData?.subjectName || 'المادة'} | ${classData?.semesterName || 'الفصل الدراسي'}`}
      showBackButton
      backPath="/teacher/subjects"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, index) => (
          <Card
            key={item.id}
            variant={item.variant}
            onClick={() => handleMenuClick(item.id)}
            className="group animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-card/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <item.icon size={28} className="text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{item.title}</h3>
              </div>
              <ChevronLeft size={20} className="text-muted-foreground group-hover:translate-x-[-4px] transition-transform" />
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}