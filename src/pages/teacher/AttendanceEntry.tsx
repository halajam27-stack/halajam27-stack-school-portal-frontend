import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UserCheck, Calendar, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface StudentItem {
  id: string;
  name: string;
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

interface PeriodItem {
  periodId: number;
  periodNumber: number;
}

export default function TeacherAttendanceEntry() {
  const { sectionId, subjectId } = useParams();
  const { toast } = useToast();
  const semesterId = localStorage.getItem('adminSelectedSemester');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classData, setClassData] = useState<ClassInfo | null>(null);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingRecord, setHasExistingRecord] = useState(false);

  const getArabicDayName = (dateString: string) => {
    const dateObj = new Date(dateString);
    const dayIndex = dateObj.getDay();

    const daysMap = [
      'الأحد',
      'الاثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت'
    ];

    return daysMap[dayIndex];
  };

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

        const formatted: StudentItem[] = data.map((s: any) => ({
          id: s.NaturalID,
          name: s.FullName,
        }));

        setStudents(formatted);

        const initialAttendance: { [key: string]: boolean } = {};
        formatted.forEach((student) => {
          initialAttendance[student.id] = true;
        });
        setAttendance(initialAttendance);
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

  useEffect(() => {
    const fetchPeriods = async () => {
      if (!sectionId || !subjectId || !semesterId || !date) return;

      const dayOfWeek = getArabicDayName(date);

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/attendance/periods?sectionId=${sectionId}&subjectId=${subjectId}&semesterId=${semesterId}&dayOfWeek=${encodeURIComponent(dayOfWeek)}`
        );

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل حصص اليوم',
            variant: 'destructive'
          });
          return;
        }

        const formatted: PeriodItem[] = data.map((p: any) => ({
          periodId: p.PeriodID,
          periodNumber: p.PeriodNumber,
        }));

        setPeriods(formatted);

        if (formatted.length === 1) {
          setSelectedPeriodId(String(formatted[0].periodId));
        } else {
          setSelectedPeriodId('');
        }
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive'
        });
      }
    };

    fetchPeriods();
  }, [sectionId, subjectId, semesterId, date, toast]);

  useEffect(() => {
    const fetchExistingAttendance = async () => {
      if (!sectionId || !subjectId || !semesterId || !selectedPeriodId || students.length === 0) {
        setHasExistingRecord(false);
        return;
      }

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/teacher/attendance/existing?sectionId=${sectionId}&subjectId=${subjectId}&semesterId=${semesterId}&periodId=${selectedPeriodId}&date=${date}`
        );

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل سجل الحضور',
            variant: 'destructive'
          });
          return;
        }

if (data.length > 0) {
  const loadedAttendance: { [key: string]: boolean } = {};

  students.forEach((student) => {
    loadedAttendance[student.id] = true;
  });

  console.log("EXISTING DATA FROM API:", data);

  data.forEach((record: any) => {
    loadedAttendance[record.NaturalID] = record.Status === 1;
  });

  console.log("LOADED ATTENDANCE:", loadedAttendance);

  setAttendance(loadedAttendance);
  setHasExistingRecord(true);

  toast({
    title: 'تم التحميل',
    description: 'تم تحميل سجل الحضور السابق ويمكنك تعديله'
  });
}
else {
          const initialAttendance: { [key: string]: boolean } = {};
          students.forEach((student) => {
            initialAttendance[student.id] = true;
          });
          setAttendance(initialAttendance);
          setHasExistingRecord(false);
        }
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive'
        });
      }
    };

    fetchExistingAttendance();
  }, [sectionId, subjectId, semesterId, selectedPeriodId, date, students, toast]);

  const handleToggle = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSave = async () => {
    if (!sectionId || !subjectId || !semesterId) {
      toast({
        title: 'خطأ',
        description: 'بيانات الصفحة ناقصة',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedPeriodId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار الحصة أولاً',
        variant: 'destructive'
      });
      return;
    }

    if (students.length === 0) {
      toast({
        title: 'خطأ',
        description: 'لا يوجد طلاب في هذه الشعبة',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const records = students.map((student) => ({
        naturalId: student.id,
        status: attendance[student.id] ? 1 : 0,
      }));

      const url = 'https://school-portal-backend-new.onrender.com/teacher/attendance';
      const method = hasExistingRecord ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: Number(sectionId),
          subjectId: Number(subjectId),
          semesterId: Number(semesterId),
          periodId: Number(selectedPeriodId),
          attendanceDate: date,
          records,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حفظ الحضور',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }

      setHasExistingRecord(true);

      toast({
        title: 'تم الحفظ',
        description: hasExistingRecord
          ? 'تم تعديل سجل الحضور بنجاح'
          : 'تم حفظ سجل الحضور بنجاح'
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="تسجيل الحضور والغياب"
      subtitle={`${classData?.className || 'الصف'} - شعبة ${classData?.sectionName || ''} | ${classData?.subjectName || 'المادة'}`}
      showBackButton
      backPath={`/teacher/class/${sectionId}/${subjectId}`}
    >
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-muted-foreground" />
              <span className="font-medium">التاريخ:</span>
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="font-medium">الحصة:</div>
            <div className="w-full sm:w-64">
              <Select value={selectedPeriodId} onValueChange={setSelectedPeriodId}>
                <SelectTrigger className="w-full flex-row-reverse text-right [&>span]:w-full [&>span]:text-right">
                  <SelectValue placeholder="اختر الحصة" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.periodId} value={String(period.periodId)}>
                      الحصة {period.periodNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {periods.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              لا توجد حصة لهذه المادة في هذا اليوم
            </p>
          )}

          {hasExistingRecord && (
            <p className="text-sm text-primary mt-4">
              تم تحميل سجل حضور محفوظ مسبقًا ويمكنك تعديله
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck size={20} />
            قائمة الطلاب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.map((student, index) => (
              <div
                key={student.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 animate-fade-in ${
                  attendance[student.id]
                    ? 'border-soft-green bg-soft-green/30'
                    : 'border-destructive bg-destructive/10'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div>
                  <p className="font-medium">{student.name}</p>
                </div>
                <Button
                  variant={attendance[student.id] ? 'success' : 'destructive'}
                  size="sm"
                  onClick={() => handleToggle(student.id)}
                  className="min-w-[80px]"
                >
                  {attendance[student.id] ? 'حاضر' : 'غائب'}
                </Button>
              </div>
            ))}

            {students.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                لا يوجد طلاب مرتبطون بهذه الشعبة
              </div>
            )}
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full mt-6"
            onClick={handleSave}
            disabled={isSaving || students.length === 0 || periods.length === 0 || !selectedPeriodId}
          >
            <Save size={20} />
            {isSaving ? 'جاري الحفظ...' : hasExistingRecord ? 'حفظ التعديلات' : 'حفظ السجل'}
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
