import { useEffect, useState } from 'react';
import { BookOpen, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getIconById } from '@/lib/subjectIcons';

interface SubjectItem {
  id: number;
  name: string;
  bookPath: string | null;
  className: string;
  sectionName: string;
  iconId: string;
  color: 'peach' | 'babyBlue' | 'yellow' | 'pink' | 'green' | 'purple';
}

const cardColors: SubjectItem['color'][] = [
  'peach',
  'babyBlue',
  'yellow',
  'pink',
  'green',
  'purple',
];

export default function StudentSubjects() {
  const { toast } = useToast();
  const { student } = useAuth();

  const semesterId = student?.semesterId;
  const naturalId = student?.naturalId;

  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [className, setClassName] = useState('');
  const [sectionName, setSectionName] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!naturalId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/student/subjects/${naturalId}/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل المواد',
            variant: 'destructive',
          });
          return;
        }

        const formatted: SubjectItem[] = data.map((subject: any, index: number) => ({
          id: subject.SubjectID,
          name: subject.SubjectName,
          bookPath: subject.BookPath,
          className: subject.ClassName,
          sectionName: subject.SectionName,
          iconId: subject.IconId || 'book',
          color: cardColors[index % cardColors.length],
        }));

        setSubjects(formatted);

        if (formatted.length > 0) {
          setClassName(formatted[0].className);
          setSectionName(formatted[0].sectionName);
        }
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchSubjects();
  }, [naturalId, semesterId, toast]);

  const handleOpenBook = (bookPath: string | null) => {
    if (!bookPath) {
      toast({
        title: 'تنبيه',
        description: 'لا يوجد كتاب مرفوع لهذه المادة بعد',
        variant: 'destructive',
      });
      return;
    }

    window.open(`https://school-portal-backend-new-cfr6.onrender.com${bookPath}`, '_blank');
  };

  return (
    <DashboardLayout
      title="المواد الدراسية"
      subtitle="اختر المادة لعرض الكتاب"
      showBackButton
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-peach flex items-center justify-center">
          <BookOpen size={24} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">المواد الدراسية</h2>
          <p className="text-sm text-muted-foreground">
            {className ? `${className} - شعبة ${sectionName}` : 'جاري تحميل بيانات الصف...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.map((subject, index) => (
          <Card
            key={subject.id}
            variant={subject.color}
            className="group animate-scale-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {getIconById(subject.iconId)}
              </span>

              <h3 className="font-bold text-foreground mb-3">{subject.name}</h3>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenBook(subject.bookPath)}
                className="w-full"
              >
                <FileText size={16} />
                عرض الكتاب
              </Button>
            </CardContent>
          </Card>
        ))}

        {subjects.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            لا توجد مواد مرتبطة بهذا الطالب
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}