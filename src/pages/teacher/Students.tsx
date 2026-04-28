import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface StudentItem {
  id: number;
  naturalId: string;
  fullName: string;
  guardianPhone: string;
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

export default function TeacherStudents() {
  const { sectionId, subjectId } = useParams();
  const { toast } = useToast();

  const semesterId = localStorage.getItem("adminSelectedSemester");

  const [students, setStudents] = useState<StudentItem[]>([]);
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

  useEffect(() => {
    const fetchStudents = async () => {
      if (!sectionId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/students/${sectionId}/${semesterId}`
        );

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل الطلاب',
            variant: 'destructive'
          });
          return;
        }

        const formatted = data.map((student: any, index: number) => ({
          id: index + 1,
          naturalId: student.NaturalID,
          fullName: student.FullName,
          guardianPhone: student.GuardianPhone || ''
        }));

        setStudents(formatted);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive'
        });
      }
    };

    fetchStudents();
  }, [sectionId, semesterId, toast]);

  return (
    <DashboardLayout
      title="طلاب الصف"
      subtitle={`${classData?.subjectName || 'المادة'} | ${classData?.className || 'الصف'} - شعبة ${classData?.sectionName || ''}`}
      showBackButton
      backPath={`/teacher/class/${sectionId}/${subjectId}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-peach flex items-center justify-center">
          <Users size={24} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">قائمة الطلاب</h2>
          <p className="text-sm text-muted-foreground">{students.length} طالب</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {students.map((student, index) => (
              <div
                key={`${student.naturalId}-${index}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-baby-blue flex items-center justify-center">
                  <User size={20} className="text-foreground" />
                </div>

                <div className="flex-1">
                  <p className="font-medium text-foreground">{student.fullName}</p>

                </div>

                <div className="text-left">
                  <p className="text-sm text-muted-foreground">هاتف ولي الأمر</p>
                  <p className="font-medium text-foreground" dir="ltr">
                    {student.guardianPhone || '-'}
                  </p>
                </div>
              </div>
            ))}

            {students.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                لا يوجد طلاب مرتبطون بهذه الشعبة
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}