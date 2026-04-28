import { useEffect, useMemo, useState } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GradeApiRow {
  SubjectID: number;
  SubjectName: string;
  GradeTypeName: string;
  MaxGrade: number;
  GradeValue: number | null;
  SemesterName: string;
}

interface GradeCell {
  type: string;
  grade: number | null;
  max: number;
}

interface SubjectGradeRow {
  subject: string;
  grades: GradeCell[];
}

function getGradeColor(grade: number | null, max: number) {
  if (grade === null) return 'text-muted-foreground bg-muted';

  const percentage = (grade / max) * 100;

  if (percentage >= 90) return 'text-success-foreground bg-soft-green';
  if (percentage >= 70) return 'text-foreground bg-soft-yellow';
  if (percentage >= 50) return 'text-foreground bg-peach';
  return 'text-destructive-foreground bg-destructive';
}

export default function StudentGrades() {
  const { toast } = useToast();
  const { student } = useAuth();

  const [rows, setRows] = useState<GradeApiRow[]>([]);
  const [semesterName, setSemesterName] = useState('');

  useEffect(() => {
    const fetchGrades = async () => {
      if (!student?.naturalId || !student?.semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/student/grades/${student.naturalId}/${student.semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل العلامات',
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

    fetchGrades();
  }, [student, toast]);

  const gradeTypes = useMemo(() => {
    const unique = Array.from(new Set(rows.map((row) => row.GradeTypeName)));
    return unique;
  }, [rows]);

  const subjectRows = useMemo<SubjectGradeRow[]>(() => {
    const grouped = new Map<string, GradeCell[]>();

    rows.forEach((row) => {
      if (!grouped.has(row.SubjectName)) {
        grouped.set(row.SubjectName, []);
      }

      grouped.get(row.SubjectName)!.push({
        type: row.GradeTypeName,
        grade: row.GradeValue !== null ? Number(row.GradeValue) : null,
        max: Number(row.MaxGrade),
      });
    });

    return Array.from(grouped.entries()).map(([subject, grades]) => ({
      subject,
      grades,
    }));
  }, [rows]);

  return (
    <DashboardLayout
      title="العلامات"
      subtitle="متابعة التحصيل الدراسي"
      showBackButton
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-soft-pink flex items-center justify-center">
          <Award size={24} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">سجل العلامات</h2>
          <p className="text-sm text-muted-foreground">
            {semesterName || 'جاري تحميل الفصل الدراسي...'}
          </p>
        </div>
      </div>

      <Card className="hidden md:block overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="p-3 text-right border-b border-border font-bold">المادة</th>

                  {gradeTypes.map((type) => (
                    <th key={type} className="p-3 text-center border-b border-border font-medium">
                      {type}
                    </th>
                  ))}

                  <th className="p-3 text-center border-b border-border font-bold">المجموع</th>
                </tr>
              </thead>

              <tbody>
                {subjectRows.map((row) => {
                  const orderedGrades = gradeTypes.map((type) => {
                    return row.grades.find((g) => g.type === type) || {
                      type,
                      grade: null,
                      max: 0,
                    };
                  });

                  const total = orderedGrades.reduce(
                    (sum, g) => sum + (g.grade !== null ? g.grade : 0),
                    0
                  );

                  const maxTotal = orderedGrades.reduce((sum, g) => sum + g.max, 0);

                  const percentage =
                    maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

                  return (
                    <tr key={row.subject} className="hover:bg-muted/50 transition-colors">
                      <td className="p-3 border-b border-border font-medium">{row.subject}</td>

                      {orderedGrades.map((gradeItem, i) => (
                        <td key={i} className="p-2 border-b border-border text-center">
                          <span
                            className={`inline-block rounded-lg py-1 px-3 text-sm font-medium ${getGradeColor(
                              gradeItem.grade,
                              gradeItem.max || 1
                            )}`}
                          >
                            {gradeItem.grade !== null ? `${gradeItem.grade}/${gradeItem.max}` : '-'}
                          </span>
                        </td>
                      ))}

                      <td className="p-2 border-b border-border text-center">
                        <span className="inline-flex items-center gap-1 rounded-lg py-1 px-3 text-sm font-bold bg-primary text-primary-foreground">
                          <TrendingUp size={14} />
                          {percentage}/100
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="md:hidden space-y-4">
        {subjectRows.map((row, idx) => {
          const orderedGrades = gradeTypes.map((type) => {
            return row.grades.find((g) => g.type === type) || {
              type,
              grade: null,
              max: 0,
            };
          });

          const total = orderedGrades.reduce(
            (sum, g) => sum + (g.grade !== null ? g.grade : 0),
            0
          );

          const maxTotal = orderedGrades.reduce((sum, g) => sum + g.max, 0);

          const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;

          return (
            <Card
              key={row.subject}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{row.subject}</span>
                  <span className="text-sm font-bold bg-primary text-primary-foreground rounded-lg py-1 px-3">
                    {percentage}/100
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {orderedGrades.map((gradeItem) => (
                    <div
                      key={gradeItem.type}
                      className={`rounded-lg p-2 text-center ${getGradeColor(
                        gradeItem.grade,
                        gradeItem.max || 1
                      )}`}
                    >
                      <p className="text-xs mb-1">{gradeItem.type}</p>
                      <p className="font-medium text-sm">
                        {gradeItem.grade !== null ? `${gradeItem.grade}/${gradeItem.max}` : '-'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {subjectRows.length === 0 && (
        <Card className="text-center py-12 mt-6">
          <CardContent>
            <Award size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-medium text-foreground">لا توجد علامات حالياً</p>
            <p className="text-muted-foreground">ستظهر العلامات هنا عند إدخالها من المعلم</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}