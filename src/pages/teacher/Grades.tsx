import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Award, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface GradeTypeItem {
  schemeId: number;
  gradeTypeId: number;
  name: string;
  maxGrade: number;
}

interface StudentItem {
  naturalId: string;
  fullName: string;
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

export default function TeacherGrades() {
  const { sectionId, subjectId } = useParams();
  const { toast } = useToast();
  const semesterId = localStorage.getItem('adminSelectedSemester');

  const [gradeTypes, setGradeTypes] = useState<GradeTypeItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedGradeType, setSelectedGradeType] = useState('');
  const [grades, setGrades] = useState<Record<string, number | null>>({});
  const [classData, setClassData] = useState<ClassInfo | null>(null);
  const [hasExistingGrades, setHasExistingGrades] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedType = gradeTypes.find(
    (item) => item.schemeId.toString() === selectedGradeType
  );

  useEffect(() => {
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

    fetchClassInfo();
  }, [sectionId, subjectId, semesterId, toast]);

  useEffect(() => {
    const fetchGradeTypes = async () => {
      if (!semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/teacher/grades/types/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل أنواع العلامات',
            variant: 'destructive',
          });
          return;
        }

        const formatted: GradeTypeItem[] = data.map((item: any) => ({
          schemeId: item.SchemeID,
          gradeTypeId: item.GradeTypeID,
          name: item.GradeTypeName,
          maxGrade: Number(item.MaxGrade),
        }));

        setGradeTypes(formatted);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchGradeTypes();
  }, [semesterId, toast]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!sectionId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/teacher/grades/students/${sectionId}/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل الطلاب',
            variant: 'destructive',
          });
          return;
        }

        const formatted: StudentItem[] = data.map((student: any) => ({
          naturalId: student.NaturalID,
          fullName: student.FullName,
        }));

        setStudents(formatted);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchStudents();
  }, [sectionId, semesterId, toast]);

  useEffect(() => {
    const fetchExistingGrades = async () => {
      if (!sectionId || !subjectId || !semesterId || !selectedGradeType) {
        setGrades({});
        setHasExistingGrades(false);
        return;
      }

      try {
        const res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/teacher/grades/existing?sectionId=${sectionId}&subjectId=${subjectId}&semesterId=${semesterId}&schemeId=${selectedGradeType}`
        );
        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تحميل العلامات السابقة',
            variant: 'destructive',
          });
          return;
        }

        const loadedGrades: Record<string, number | null> = {};

        students.forEach((student) => {
          loadedGrades[student.naturalId] = null;
        });

        data.forEach((record: any) => {
          loadedGrades[record.NaturalID] =
            record.GradeValue !== null ? Number(record.GradeValue) : null;
        });

        setGrades(loadedGrades);
        setHasExistingGrades(data.length > 0);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    if (students.length > 0) {
      fetchExistingGrades();
    }
  }, [sectionId, subjectId, semesterId, selectedGradeType, students, toast]);

  const handleGradeChange = (studentId: string, value: string) => {
    const numValue = value === '' ? null : Number(value);

    if (numValue !== null && selectedType && numValue > selectedType.maxGrade) {
      toast({
        title: 'خطأ',
        description: `العلامة القصوى هي ${selectedType.maxGrade}`,
        variant: 'destructive',
      });
      return;
    }

    if (numValue !== null && numValue < 0) {
      toast({
        title: 'خطأ',
        description: 'العلامة لا يمكن أن تكون أقل من صفر',
        variant: 'destructive',
      });
      return;
    }

    setGrades((prev) => ({
      ...prev,
      [studentId]: numValue,
    }));
  };

  const handleSave = async () => {
    if (!selectedGradeType) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار نوع العلامة',
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

    const gradesToSave = students.map((student) => ({
      naturalId: student.naturalId,
      value: grades[student.naturalId] ?? null,
    }));

    setIsSaving(true);

    try {
      const res = await fetch('https://school-portal-backend-new-cfr6.onrender.com/teacher/grades', {
        method: hasExistingGrades ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: Number(sectionId),
          subjectId: Number(subjectId),
          semesterId: Number(semesterId),
          schemeId: Number(selectedGradeType),
          grades: gradesToSave,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حفظ العلامات',
          variant: 'destructive',
        });
        return;
      }

      setHasExistingGrades(true);

      toast({
        title: 'تم الحفظ',
        description: hasExistingGrades
          ? 'تم تعديل العلامات بنجاح'
          : 'تم حفظ العلامات بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="علامات المادة"
      subtitle={`${classData?.subjectName || 'المادة'} | ${classData?.className || 'الصف'} - شعبة ${classData?.sectionName || ''}`}
      showBackButton
      backPath={`/teacher/class/${sectionId}/${subjectId}`}
    >
      <div className="space-y-6" dir="rtl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={20} className="text-primary" />
              إدخال العلامات
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
               <div dir="rtl" className="w-full">
  <Select
    value={selectedGradeType}
    onValueChange={(value) => {
      setSelectedGradeType(value);
      setHasExistingGrades(false);
      setGrades({});
    }}
  >
    <SelectTrigger className="w-full flex-row-reverse text-right [&>span]:w-full [&>span]:text-right">
      <SelectValue placeholder="اختر نوع العلامة" />
    </SelectTrigger>

    <SelectContent dir="rtl" side="bottom" align="end" position="popper">
      {gradeTypes.map((type) => (
        <SelectItem
          key={type.schemeId}
          value={type.schemeId.toString()}
          className="text-right"
        >
          {type.name} (الحد الأقصى: {type.maxGrade})
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
              </div>

              <Button
                onClick={handleSave}
                disabled={!selectedGradeType || isSaving}
              >
                <Save size={18} className="ml-2" />
                {isSaving
                  ? 'جاري الحفظ...'
                  : hasExistingGrades
                  ? 'حفظ التعديلات'
                  : 'حفظ العلامات'}
              </Button>
            </div>

            {hasExistingGrades && (
              <p className="text-sm text-primary mt-4">
                تم تحميل علامات محفوظة مسبقًا ويمكنك تعديلها
              </p>
            )}

            {gradeTypes.length === 0 && (
              <p className="text-sm text-destructive mt-4">
                لا يوجد تقسيم علامات لهذا الفصل الدراسي
              </p>
            )}
          </CardContent>
        </Card>

        {selectedGradeType && (
          <Card className="animate-fade-in">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">#</TableHead>
                      <TableHead className="text-right">اسم الطالب</TableHead>
                      <TableHead className="text-right">
                        العلامة (من {selectedType?.maxGrade})
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {students.map((student, index) => (
                      <TableRow key={student.naturalId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={selectedType?.maxGrade}
                            placeholder="0"
                            value={grades[student.naturalId] ?? ''}
                            onChange={(e) =>
                              handleGradeChange(
                                student.naturalId,
                                e.target.value
                              )
                            }
                            className="w-24"
                          />
                        </TableCell>
                      </TableRow>
                    ))}

                    {students.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-6 text-muted-foreground"
                        >
                          لا يوجد طلاب في هذه الشعبة
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">تقسيم العلامات</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {gradeTypes.map((type) => (
                <div
                  key={type.schemeId}
                  className="p-3 rounded-xl bg-muted text-center"
                >
                  <p className="font-medium text-foreground">{type.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {type.maxGrade} علامة
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}