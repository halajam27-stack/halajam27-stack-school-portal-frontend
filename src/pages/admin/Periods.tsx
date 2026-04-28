import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const periodNumbers = [1, 2, 3, 4, 5, 6, 7];

interface ClassItem {
  ClassID: number;
  ClassName: string;
}

interface SectionItem {
  SectionID: number;
  SectionName: string;
  ClassID?: number;
}

interface SubjectItem {
  SubjectID: number;
  SubjectName: string;
}

interface PeriodItem {
  id: number;
  className: string;
  sectionName: string;
  subjectName: string;
  day: string;
  periodNumber: number;
}

const subjectColors = [
  'bg-red-100 text-red-700 border-red-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-green-100 text-green-700 border-green-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-pink-100 text-pink-700 border-pink-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
];

export default function AdminPeriods() {
  const { toast } = useToast();
  const semesterId = localStorage.getItem('adminSelectedSemester');

  const [periodsList, setPeriodsList] = useState<PeriodItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

  const [viewClass, setViewClass] = useState('');
  const [viewSection, setViewSection] = useState('');

  const [addDay, setAddDay] = useState('');
  const [addPeriod, setAddPeriod] = useState('');
  const [addSubject, setAddSubject] = useState('');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addDialogDay, setAddDialogDay] = useState('');
  const [addDialogPeriod, setAddDialogPeriod] = useState('');
  const [addFromCellSubject, setAddFromCellSubject] = useState('');

  const fetchPeriods = async () => {
    if (!semesterId) return;

    try {
      const res = await fetch(`https://school-portal-backend-new.onrender.com/periods/${semesterId}`);
      const data = await res.json();

      const formatted = data.map((p: any) => ({
        id: p.PeriodID,
        className: p.ClassName,
        sectionName: p.SectionName,
        subjectName: p.SubjectName,
        day: p.DayOfWeek,
        periodNumber: p.PeriodNumber,
      }));

      setPeriodsList(formatted);
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الحصص',
        variant: 'destructive',
      });
    }
  };

  const fetchClasses = async () => {
    if (!semesterId) return;

    try {
      const res = await fetch(`https://school-portal-backend-new.onrender.com/classes/${semesterId}`);
      const data = await res.json();

      const sorted = data.sort((a: any, b: any) => Number(a.ClassID) - Number(b.ClassID));
      setClasses(sorted);
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الصفوف',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!semesterId) {
      toast({
        title: 'خطأ',
        description: 'لم يتم تحديد الفصل الدراسي',
        variant: 'destructive',
      });
      return;
    }

    fetchClasses();
    fetchPeriods();
  }, [semesterId]);

  useEffect(() => {
    if (!viewClass || !semesterId) {
      setSections([]);
      setSubjects([]);
      setViewSection('');
      return;
    }

    const fetchRelatedData = async () => {
      try {
        const [sectionsRes, subjectsRes] = await Promise.all([
          fetch(`https://school-portal-backend-new.onrender.com/periods/sections/${viewClass}/${semesterId}`),
          fetch(`https://school-portal-backend-new.onrender.com/periods/subjects/${viewClass}/${semesterId}`),
        ]);

        const sectionsData = await sectionsRes.json();
        const subjectsData = await subjectsRes.json();

        setSections(sectionsData);
        setSubjects(subjectsData);
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل تحميل الشعب أو المواد',
          variant: 'destructive',
        });
      }
    };

    fetchRelatedData();
  }, [viewClass, semesterId]);

  const selectedClassName =
    classes.find((c) => c.ClassID.toString() === viewClass)?.ClassName || '';

  const selectedSectionName =
    sections.find((s) => s.SectionID.toString() === viewSection)?.SectionName || '';

  const filteredPeriods = periodsList.filter(
    (p) =>
      (!viewClass || p.className === selectedClassName) &&
      (!viewSection || p.sectionName === selectedSectionName)
  );

  const getSubjectColor = (subjectName: string) => {
    const index = subjects.findIndex((s) => s.SubjectName === subjectName);
    return subjectColors[index >= 0 ? index % subjectColors.length : 0];
  };

  const getPeriodForCell = (day: string, periodNum: number) => {
    return filteredPeriods.find((p) => p.day === day && p.periodNumber === periodNum);
  };

  const handleAddFromCell = (day: string, periodNum: number) => {
    setAddDialogDay(day);
    setAddDialogPeriod(periodNum.toString());
    setAddFromCellSubject('');
    setShowAddDialog(true);
  };

  const handleConfirmAdd = async () => {
    if (!viewSection || !addFromCellSubject || !semesterId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار المادة',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('https://school-portal-backend-new.onrender.com/periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: Number(viewSection),
          subjectId: Number(addFromCellSubject),
          semesterId: Number(semesterId),
          day: addDialogDay,
          periodNumber: Number(addDialogPeriod),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل إضافة الحصة',
          variant: 'destructive',
        });
        return;
      }

      setShowAddDialog(false);
      await fetchPeriods();

      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة الحصة بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الإضافة',
        variant: 'destructive',
      });
    }
  };

  const handleQuickAdd = async () => {
    if (!viewClass || !viewSection || !addDay || !addPeriod || !addSubject || !semesterId) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('https://school-portal-backend-new.onrender.com/periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId: Number(viewSection),
          subjectId: Number(addSubject),
          semesterId: Number(semesterId),
          day: addDay,
          periodNumber: Number(addPeriod),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل إضافة الحصة',
          variant: 'destructive',
        });
        return;
      }

      setAddDay('');
      setAddPeriod('');
      setAddSubject('');
      await fetchPeriods();

      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة الحصة بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الإضافة',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`https://school-portal-backend-new.onrender.com/periods/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل الحذف',
          variant: 'destructive',
        });
        return;
      }

      setPeriodsList((prev) => prev.filter((p) => p.id !== id));

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الحصة بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الحذف',
        variant: 'destructive',
      });
    }
  };

  const showSchedule = viewClass && viewSection;

  return (
    <DashboardLayout title="الجدول الدراسي" subtitle="إدارة الحصص الأسبوعية" showBackButton>
      <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                <span className="font-semibold text-foreground">عرض جدول:</span>
              </div>

              <div className="flex flex-wrap gap-3 flex-1">
                <Select
                  value={viewClass}
                  onValueChange={(v) => {
                    setViewClass(v);
                    setViewSection('');
                    setAddDay('');
                    setAddPeriod('');
                    setAddSubject('');
                  }}
                >
                  <SelectTrigger className="w-44 text-right">
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                    {classes.map((c) => (
                      <SelectItem key={c.ClassID} value={c.ClassID.toString()}>
                        {c.ClassName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={viewSection} onValueChange={setViewSection} disabled={!viewClass}>
                  <SelectTrigger className="w-44 text-right">
                    <SelectValue placeholder="اختر الشعبة" />
                  </SelectTrigger>
                  <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                    {sections.map((s) => (
                      <SelectItem key={s.SectionID} value={s.SectionID.toString()}>
                        شعبة {s.SectionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!showSchedule ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Eye size={36} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">اختر الصف والشعبة</h3>
              <p className="text-muted-foreground">اختر الصف والشعبة لعرض الجدول الدراسي الأسبوعي</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plus size={18} className="text-primary" />
                  <span className="font-semibold text-sm text-foreground">إضافة سريعة</span>
                </div>

                <div className="flex flex-wrap gap-3 items-end">
                  <Select value={addSubject} onValueChange={setAddSubject}>
                    <SelectTrigger className="w-40 text-right">
                      <SelectValue placeholder="المادة" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                      {subjects.map((s) => (
                        <SelectItem key={s.SubjectID} value={s.SubjectID.toString()}>
                          {s.SubjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={addDay} onValueChange={setAddDay}>
                    <SelectTrigger className="w-36 text-right">
                      <SelectValue placeholder="اليوم" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                      {days.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={addPeriod} onValueChange={setAddPeriod}>
                    <SelectTrigger className="w-32 text-right">
                      <SelectValue placeholder="الحصة" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                      {periodNumbers.map((p) => (
                        <SelectItem key={p} value={p.toString()}>
                          الحصة {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button onClick={handleQuickAdd} size="sm" className="h-10 px-6">
                    <Plus size={16} className="ml-1" />
                    إضافة
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  {selectedClassName} - شعبة {selectedSectionName}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-2 sm:p-4">
                <div className="overflow-x-auto">
                  <div className="min-w-[700px]">
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
                      <div className="h-10 flex items-center justify-center rounded-lg bg-muted font-bold text-xs text-muted-foreground">
                        اليوم / الحصة
                      </div>

                      {periodNumbers.map((p) => (
                        <div
                          key={p}
                          className="h-10 flex items-center justify-center rounded-lg bg-primary/10 font-bold text-xs text-primary"
                        >
                          الحصة {p}
                        </div>
                      ))}
                    </div>

                    {days.map((day) => (
                      <div key={day} className="grid gap-1.5 mt-1.5" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
                        <div className="min-h-[72px] flex items-center justify-center rounded-lg bg-muted/60 font-bold text-sm text-foreground">
                          {day}
                        </div>

                        {periodNumbers.map((periodNum) => {
                          const period = getPeriodForCell(day, periodNum);

                          if (period) {
                            return (
                              <div
                                key={periodNum}
                                className={`min-h-[72px] rounded-xl border-2 p-2 flex flex-col justify-between transition-all hover:shadow-md group ${getSubjectColor(period.subjectName)}`}
                              >
                                <span className="font-bold text-xs leading-tight line-clamp-2">
                                  {period.subjectName}
                                </span>

                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                    onClick={() => handleDelete(period.id)}
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={periodNum}
                              onClick={() => handleAddFromCell(day, periodNum)}
                              className="min-h-[72px] rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group"
                            >
                              <Plus size={18} className="text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-muted-foreground ml-2">المواد:</span>

                  {subjects.map((s, index) => (
                    <Badge
                      key={s.SubjectID}
                      variant="outline"
                      className={`${subjectColors[index % subjectColors.length]} border text-xs`}
                    >
                      {s.SubjectName}
                    </Badge>
                  ))}

                  <span className="text-xs text-muted-foreground mr-auto">
                    {filteredPeriods.length} حصة مسجلة
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">
                إضافة حصة - {addDialogDay} (الحصة {addDialogPeriod})
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <Select value={addFromCellSubject} onValueChange={setAddFromCellSubject}>
                <SelectTrigger className="text-right">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                  {subjects.map((s) => (
                    <SelectItem key={s.SubjectID} value={s.SubjectID.toString()}>
                      {s.SubjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleConfirmAdd}>
                  <Plus size={16} className="ml-1" />
                  إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}