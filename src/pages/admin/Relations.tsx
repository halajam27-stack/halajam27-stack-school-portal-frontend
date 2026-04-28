import { useState, useEffect } from 'react';
import { Link2, Plus, Trash2, Users, BookOpen, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface ClassItem {
  id: number;
  name: string;
}

interface SectionItem {
  id: number;
  name: string;
  classId: number;
}

interface SubjectItem {
  id: number;
  name: string;
  classId: number;
}

interface StudentItem {
  id: string;
  name: string;
}

interface TeacherItem {
  id: string;
  name: string;
}

interface SectionStudent {
  id: number;
  sectionId: number;
  sectionName: string;
  className: string;
  studentId: string;
  studentName: string;
}

interface SubjectTeacher {
  id: number;
  sectionId: number;
  sectionName: string;
  className: string;
  subjectId: number;
  subjectName: string;
  teacherId: string;
  teacherName: string;
}

export default function AdminRelations() {
  const { toast } = useToast();
  const semesterId = localStorage.getItem('adminSelectedSemester');

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [ssSections, setSsSections] = useState<SectionItem[]>([]);
  const [stSections, setStSections] = useState<SectionItem[]>([]);
  const [stSubjects, setStSubjects] = useState<SubjectItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);

  const [sectionStudents, setSectionStudents] = useState<SectionStudent[]>([]);
  const [ssClass, setSsClass] = useState('');
  const [ssSection, setSsSection] = useState('');
  const [ssStudent, setSsStudent] = useState('');
  const [ssSearch, setSsSearch] = useState('');

  const [subjectTeachers, setSubjectTeachers] = useState<SubjectTeacher[]>([]);
  const [stClass, setStClass] = useState('');
  const [stSection, setStSection] = useState('');
  const [stSubject, setStSubject] = useState('');
  const [stTeacher, setStTeacher] = useState('');
  const [stSearch, setStSearch] = useState('');

  const fetchBaseData = async () => {
    if (!semesterId) return;

    try {
const [classesRes, studentsRes, teachersRes] = await Promise.all([
  fetch(`https://school-portal-backend-new.onrender.com/relations/classes/${semesterId}`),
  fetch(`https://school-portal-backend-new.onrender.com/relations/students/${semesterId}`),
  fetch(`https://school-portal-backend-new.onrender.com/relations/teachers/${semesterId}`)
]);
      const classesData = await classesRes.json();
      const studentsData = await studentsRes.json();
      const teachersData = await teachersRes.json();

      setClasses(
        classesData.map((c: any) => ({
          id: c.ClassID,
          name: c.ClassName
        }))
      );

      setStudents(
        studentsData.map((s: any) => ({
          id: s.NaturalID,
          name: s.FullName
        }))
      );

      setTeachers(
        teachersData.map((t: any) => ({
          id: t.NaturalID,
          name: t.FullName
        }))
      );
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل البيانات الأساسية',
        variant: 'destructive'
      });
    }
  };

  const fetchSectionStudents = async () => {
    if (!semesterId) return;

    try {
      const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/relations/section-students/${semesterId}`);
      const data = await res.json();

      setSectionStudents(
        data.map((item: any, index: number) => ({
          id: index + 1,
          sectionId: item.SectionID,
          sectionName: item.SectionName,
          className: item.ClassName,
          studentId: item.NaturalID,
          studentName: item.StudentName
        }))
      );
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل ربط الطلاب',
        variant: 'destructive'
      });
    }
  };

  const fetchSubjectTeachers = async () => {
    if (!semesterId) return;

    try {
      const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/relations/subject-teachers/${semesterId}`);
      const data = await res.json();

      setSubjectTeachers(
        data.map((item: any, index: number) => ({
          id: index + 1,
          sectionId: item.SectionID,
          sectionName: item.SectionName,
          className: item.ClassName,
          subjectId: item.SubjectID,
          subjectName: item.SubjectName,
          teacherId: item.NaturalID,
          teacherName: item.TeacherName
        }))
      );
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل ربط المعلمين',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchBaseData();
    fetchSectionStudents();
    fetchSubjectTeachers();
  }, [semesterId]);

  useEffect(() => {
    if (!ssClass || !semesterId) {
      setSsSections([]);
      setSsSection('');
      return;
    }

    fetch(`https://school-portal-backend-new-cfr6.onrender.com/relations/sections/${ssClass}/${semesterId}`)
      .then((res) => res.json())
      .then((data) => {
        setSsSections(
          data.map((s: any) => ({
            id: s.SectionID,
            name: s.SectionName,
            classId: s.ClassID
          }))
        );
      })
      .catch(() => {
        toast({
          title: 'خطأ',
          description: 'فشل تحميل الشعب',
          variant: 'destructive'
        });
      });
  }, [ssClass, semesterId, toast]);

  useEffect(() => {
    if (!stClass || !semesterId) {
      setStSections([]);
      setStSubjects([]);
      setStSection('');
      setStSubject('');
      return;
    }

    fetch(`https://school-portal-backend-new-cfr6.onrender.com/relations/sections/${stClass}/${semesterId}`)
      .then((res) => res.json())
      .then((data) => {
        setStSections(
          data.map((s: any) => ({
            id: s.SectionID,
            name: s.SectionName,
            classId: s.ClassID
          }))
        );
      });

    fetch(`https://school-portal-backend-new-cfr6.onrender.com/relations/subjects/${stClass}/${semesterId}`)
      .then((res) => res.json())
      .then((data) => {
        setStSubjects(
          data.map((s: any) => ({
            id: s.SubjectID,
            name: s.SubjectName,
            classId: s.ClassID
          }))
        );
      })
      .catch(() => {
        toast({
          title: 'خطأ',
          description: 'فشل تحميل المواد أو الشعب',
          variant: 'destructive'
        });
      });
  }, [stClass, semesterId, toast]);

  const handleAddSectionStudent = async () => {
    if (!ssClass || !ssSection || !ssStudent || !semesterId) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    try {
      const res = await fetch('https://school-portal-backend-new-cfr6.onrender.com/relations/section-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: Number(ssSection),
          naturalId: ssStudent,
          semesterId: Number(semesterId)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل إضافة الطالب للشعبة',
          variant: 'destructive'
        });
        return;
      }

      setSsSection('');
      setSsStudent('');
      fetchSectionStudents();

      toast({
        title: 'تم الإضافة',
        description: 'تم إضافة الطالب للشعبة بنجاح'
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSectionStudent = async (item: SectionStudent) => {
    if (!semesterId) return;

    try {
      const res = await fetch(
        `https://school-portal-backend-new-cfr6.onrender.com/relations/section-students/${item.sectionId}/${item.studentId}/${semesterId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل الحذف',
          variant: 'destructive'
        });
        return;
      }

      fetchSectionStudents();

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الطالب من الشعبة بنجاح'
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive'
      });
    }
  };

  const handleAddSubjectTeacher = async () => {
    if (!stClass || !stSection || !stSubject || !stTeacher || !semesterId) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    try {
      const res = await fetch('https://school-portal-backend-new-cfr6.onrender.com/relations/subject-teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: Number(stSection),
          subjectId: Number(stSubject),
          naturalId: stTeacher,
          semesterId: Number(semesterId)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل إضافة المعلم للمادة',
          variant: 'destructive'
        });
        return;
      }

      setStSection('');
      setStSubject('');
      setStTeacher('');
      fetchSubjectTeachers();

      toast({
        title: 'تم الإضافة',
        description: 'تم إضافة المعلم للمادة بنجاح'
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSubjectTeacher = async (item: SubjectTeacher) => {
    if (!semesterId) return;

    try {
      const res = await fetch(
        `https://school-portal-backend-new-cfr6.onrender.com/relations/subject-teachers/${item.sectionId}/${item.subjectId}/${item.teacherId}/${semesterId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل الحذف',
          variant: 'destructive'
        });
        return;
      }

      fetchSubjectTeachers();

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الربط بنجاح'
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive'
      });
    }
  };

  const selectedSsClassName = classes.find((c) => c.id.toString() === ssClass)?.name;
  const selectedStClassName = classes.find((c) => c.id.toString() === stClass)?.name;

  const filteredSectionStudents = sectionStudents.filter((item) => {
    const matchesClass = !ssClass || item.className === selectedSsClassName;
    const matchesSection = !ssSection || item.sectionId.toString() === ssSection;
    const matchesStudent = !ssStudent || item.studentId === ssStudent;
    const matchesSearch =
      !ssSearch ||
      item.studentName.toLowerCase().includes(ssSearch.toLowerCase()) ||
      item.studentId.includes(ssSearch);

    return matchesClass && matchesSection && matchesStudent && matchesSearch;
  });

  const filteredSubjectTeachers = subjectTeachers.filter((item) => {
    const matchesClass = !stClass || item.className === selectedStClassName;
    const matchesSection = !stSection || item.sectionId.toString() === stSection;
    const matchesSubject = !stSubject || item.subjectId.toString() === stSubject;
    const matchesTeacher = !stTeacher || item.teacherId === stTeacher;
    const matchesSearch =
      !stSearch ||
      item.teacherName.toLowerCase().includes(stSearch.toLowerCase()) ||
      item.teacherId.includes(stSearch);

    return matchesClass && matchesSection && matchesSubject && matchesTeacher && matchesSearch;
  });

  return (
    <DashboardLayout
      title="إدارة العلاقات"
      subtitle="ربط الطلاب بالشعب والمعلمين بالمواد"
      showBackButton
    >
      <div className="max-w-5xl mx-auto" dir="rtl">
        <Tabs defaultValue="students" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users size={18} />
              طلاب الشعبة
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <BookOpen size={18} />
              معلمين المادة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Link2 size={20} className="text-primary" />
                  إضافة طالب للشعبة
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end" dir="rtl">
                  <div>
                    <Select
                      value={ssClass}
                      onValueChange={(v) => {
                        setSsClass(v);
                        setSsSection('');
                        setSsStudent('');
                      }}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="الصف" />
                      </SelectTrigger>
                      <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={ssSection} onValueChange={setSsSection} disabled={!ssClass}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="الشعبة" />
                      </SelectTrigger>
                      <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                        {ssSections.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            شعبة {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={ssStudent} onValueChange={setSsStudent}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="الطالب" />
                      </SelectTrigger>
                      <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Button onClick={handleAddSectionStudent} className="w-full">
                      <Plus size={18} className="ml-2" />
                      إضافة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0" dir="rtl">
                <div className="p-6 border-b border-border">
                  <div className="relative w-full sm:w-96">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="ابحث باسم الطالب أو رقم الهوية"
                      value={ssSearch}
                      onChange={(e) => setSsSearch(e.target.value)}
                      className="pl-10 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الصف</TableHead>
                        <TableHead className="text-right">الشعبة</TableHead>
                        <TableHead className="text-right">الطالب</TableHead>
                        <TableHead className="text-right w-20">حذف</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredSectionStudents.map((item) => (
                        <TableRow key={`${item.sectionId}-${item.studentId}`}>
                          <TableCell className="text-right">{item.className}</TableCell>
                          <TableCell className="text-right">شعبة {item.sectionName}</TableCell>
                          <TableCell className="text-right">{item.studentName}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteSectionStudent(item)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredSectionStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            لا يوجد بيانات مطابقة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-right">
                  <Link2 size={20} className="text-primary" />
                  إضافة معلم للمادة
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end" dir="rtl">
                  <div>
                    <Select
                      value={stClass}
                      onValueChange={(v) => {
                        setStClass(v);
                        setStSection('');
                        setStSubject('');
                        setStTeacher('');
                      }}
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="الصف" />
                      </SelectTrigger>
                      <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={stSection} onValueChange={setStSection} disabled={!stClass}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="الشعبة" />
                      </SelectTrigger>
                      <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                        {stSections.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            شعبة {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={stSubject} onValueChange={setStSubject} disabled={!stClass}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="المادة" />
                      </SelectTrigger>
                      <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                        {stSubjects.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={stTeacher} onValueChange={setStTeacher}>
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="المعلم" />
                      </SelectTrigger>
                      <SelectContent side="bottom" sideOffset={5} position="popper" avoidCollisions={false}>
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Button onClick={handleAddSubjectTeacher} className="w-full">
                      <Plus size={18} className="ml-2" />
                      إضافة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0" dir="rtl">
                <div className="p-6 border-b border-border">
                  <div className="relative w-full sm:w-96">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="ابحث باسم المعلم أو رقم الهوية"
                      value={stSearch}
                      onChange={(e) => setStSearch(e.target.value)}
                      className="pl-10 text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table dir="rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الصف</TableHead>
                        <TableHead className="text-right">الشعبة</TableHead>
                        <TableHead className="text-right">المادة</TableHead>
                        <TableHead className="text-right">المعلم</TableHead>
                        <TableHead className="text-right w-20">حذف</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredSubjectTeachers.map((item) => (
                        <TableRow key={`${item.sectionId}-${item.subjectId}-${item.teacherId}`}>
                          <TableCell className="text-right">{item.className}</TableCell>
                          <TableCell className="text-right">شعبة {item.sectionName}</TableCell>
                          <TableCell className="text-right">{item.subjectName}</TableCell>
                          <TableCell className="text-right">{item.teacherName}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteSubjectTeacher(item)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredSubjectTeachers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            لا يوجد بيانات مطابقة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}