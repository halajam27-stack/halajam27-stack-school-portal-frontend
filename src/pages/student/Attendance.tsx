import { useEffect, useMemo, useState } from 'react';
import { UserCheck, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceApiRow {
  SubjectID: number;
  SubjectName: string;
  SemesterName: string;
  AttendanceDate: string | null;
  Status: number | null;
  PeriodNumber: number | null;
}

interface AbsenceItem {
  date: string;
  period: string;
}

interface SubjectAttendance {
  subject: string;
  totalClasses: number;
  attended: number;
  absences: AbsenceItem[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getArabicPeriodName(periodNumber: number | null) {
  if (!periodNumber) return '-';

  const names: Record<number, string> = {
    1: 'الأولى',
    2: 'الثانية',
    3: 'الثالثة',
    4: 'الرابعة',
    5: 'الخامسة',
    6: 'السادسة',
    7: 'السابعة',
  };

  return names[periodNumber] || String(periodNumber);
}

export default function StudentAttendance() {
  const { toast } = useToast();
  const { student } = useAuth();

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [rows, setRows] = useState<AttendanceApiRow[]>([]);
  const [semesterName, setSemesterName] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!student?.naturalId || !student?.semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/student/attendance/${student.naturalId}/${student.semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل سجل الحضور',
            variant: 'destructive',
          });
          return;
        }

        setRows(data);

        if (data.length > 0) {
          setSemesterName(data[0].SemesterName || '');
        }
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchAttendance();
  }, [student, toast]);

  const attendanceData = useMemo<SubjectAttendance[]>(() => {
    const grouped = new Map<string, SubjectAttendance>();

    rows.forEach((row) => {
      if (!grouped.has(row.SubjectName)) {
        grouped.set(row.SubjectName, {
          subject: row.SubjectName,
          totalClasses: 0,
          attended: 0,
          absences: [],
        });
      }

      const subjectRow = grouped.get(row.SubjectName)!;

      if (row.AttendanceDate) {
        subjectRow.totalClasses += 1;

        if (Number(row.Status) === 1) {
          subjectRow.attended += 1;
        } else {
          subjectRow.absences.push({
            date: row.AttendanceDate,
            period: getArabicPeriodName(row.PeriodNumber),
          });
        }
      }
    });

    return Array.from(grouped.values());
  }, [rows]);

  const toggleExpand = (subject: string) => {
    setExpandedSubject(expandedSubject === subject ? null : subject);
  };

  return (
    <DashboardLayout
      title="الحضور والغياب"
      subtitle="متابعة نسبة الحضور"
      showBackButton
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-soft-purple flex items-center justify-center">
          <UserCheck size={24} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">سجل الحضور</h2>
          <p className="text-sm text-muted-foreground">
            {semesterName || 'جاري تحميل الفصل الدراسي...'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {attendanceData.map((item, index) => {
          const percentage =
            item.totalClasses > 0
              ? Math.round((item.attended / item.totalClasses) * 100)
              : 0;

          const absenceCount = item.totalClasses - item.attended;
          const isExpanded = expandedSubject === item.subject;

          return (
            <Card
              key={item.subject}
              className="overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{item.subject}</span>
                  <span
                    className={`text-sm font-bold rounded-lg py-1 px-3 ${
                      percentage >= 90
                        ? 'bg-soft-green text-success-foreground'
                        : percentage >= 75
                        ? 'bg-soft-yellow text-foreground'
                        : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {percentage}%
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <Progress value={percentage} className="h-3" />

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-muted-foreground">
                        الحضور:{' '}
                        <span className="font-medium text-foreground">{item.attended}</span>
                      </span>

                      <span className="text-muted-foreground">
                        الغياب:{' '}
                        <span className="font-medium text-destructive-foreground">
                          {absenceCount}
                        </span>
                      </span>

                      <span className="text-muted-foreground">
                        مجموع الحصص:{' '}
                        <span className="font-medium text-foreground">
                          {item.totalClasses}
                        </span>
                      </span>
                    </div>

                    {absenceCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(item.subject)}
                        className="text-primary"
                      >
                        عرض التفاصيل
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    )}
                  </div>

                  {isExpanded && item.absences.length > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-muted animate-fade-in">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar size={16} />
                        أيام الغياب
                      </h4>

                      <div className="space-y-2">
                        {item.absences.map((absence, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-lg bg-card"
                          >
                            <span className="text-sm">{formatDate(absence.date)}</span>
                            <span className="text-xs text-muted-foreground">
                              الحصة {absence.period}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {attendanceData.length === 0 && (
        <Card className="text-center py-12 mt-6">
          <CardContent>
            <UserCheck size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-medium text-foreground">لا توجد بيانات حضور حالياً</p>
            <p className="text-muted-foreground">
              ستظهر سجلات الحضور والغياب هنا عند إدخالها من المعلم
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}