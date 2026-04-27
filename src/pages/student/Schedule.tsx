import { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const periods = [1, 2, 3, 4, 5, 6, 7];

interface ScheduleRow {
  DayOfWeek: string;
  PeriodNumber: number;
  SubjectName: string;
  ClassName: string;
  SectionName: string;
  SemesterName: string;
}

const subjectColors: { [key: string]: string } = {
  'الرياضيات': 'bg-soft-yellow',
  'لغتنا الجميلة': 'bg-peach',
  'اللغة العربية': 'bg-peach',
  'اللغة الانجليزية': 'bg-soft-pink',
  'العلوم': 'bg-soft-green',
  'العلوم والحياة': 'bg-soft-green',
  'التربية الإسلامية': 'bg-baby-blue',
  'التربية الوطنية والحياتية': 'bg-soft-purple',
  'التنشئة الوطنية والإجتماعية': 'bg-soft-purple',
  'رياضة': 'bg-peach',
  'فنون جميلة': 'bg-soft-pink',
};

export default function StudentSchedule() {
  const { toast } = useToast();
  const { student } = useAuth();

  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [semesterName, setSemesterName] = useState('');

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!student?.naturalId || !student?.semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/student/schedule/${student.naturalId}/${student.semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل الجدول الدراسي',
            variant: 'destructive',
          });
          return;
        }

        setScheduleRows(data);

        if (data.length > 0) {
          setClassName(data[0].ClassName || '');
          setSectionName(data[0].SectionName || '');
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

    fetchSchedule();
  }, [student, toast]);

  const getSubjectForCell = (day: string, period: number) => {
    const row = scheduleRows.find(
      (item) => item.DayOfWeek === day && Number(item.PeriodNumber) === period
    );
    return row?.SubjectName || '-';
  };

  return (
    <DashboardLayout
      title="الجدول الدراسي"
      subtitle={className ? `${className} - شعبة ${sectionName}` : 'جاري تحميل بيانات الصف...'}
      showBackButton
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-baby-blue flex items-center justify-center">
          <Calendar size={24} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">جدول الحصص </h2>
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
                  <th className="p-3 text-right border-b border-border">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      الحصة / اليوم
                    </div>
                  </th>
                  {days.map((day) => (
                    <th key={day} className="p-3 text-center border-b border-border font-bold">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {periods.map((period) => (
                  <tr key={period} className="hover:bg-muted/50 transition-colors">
                    <td className="p-3 border-b border-border font-medium bg-muted/30">
                      الحصة {period}
                    </td>

                    {days.map((day) => {
                      const subject = getSubjectForCell(day, period);

                      return (
                        <td key={`${day}-${period}`} className="p-2 border-b border-border text-center">
                          <div className={`rounded-lg py-2 px-3 text-sm font-medium ${subjectColors[subject] || 'bg-muted'}`}>
                            {subject}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="md:hidden space-y-4">
        {days.map((day) => (
          <Card key={day} className="animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{day}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {periods.map((period) => {
                  const subject = getSubjectForCell(day, period);

                  return (
                    <div
                      key={`${day}-${period}`}
                      className={`rounded-lg p-3 text-center ${subjectColors[subject] || 'bg-muted'}`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">الحصة {period}</p>
                      <p className="font-medium text-sm">{subject}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}