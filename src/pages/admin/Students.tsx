import { useState, useEffect } from 'react';
import { UsersRound, Plus, Pencil, Trash2, User, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: number;
  naturalId: string;
  fullName: string;
  birthDate: string;
  address: string;
  guardianPhone: string;
  enrollmentDate: string;
}

export default function AdminStudents() {
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState<Omit<Student, 'id'>>({
    naturalId: '',
    fullName: '',
    birthDate: '',
    address: '',
    guardianPhone: '',
    enrollmentDate: '',
  });

  const semesterId = localStorage.getItem("adminSelectedSemester");

  const fetchStudents = async () => {
    if (!semesterId) return;

    try {
      const res = await fetch(`https://school-portal-backend-new.onrender.com/students/${semesterId}`);
      const data = await res.json();

      const formatted = data.map((student: any, index: number) => ({
        id: index + 1,
        naturalId: student.NaturalID,
        fullName: student.FullName,
        birthDate: student.BirthDate ? String(student.BirthDate).split('T')[0] : '',
        address: student.Address || '',
        guardianPhone: student.GuardianPhone || '',
        enrollmentDate: student.EnrollmentDate ? String(student.EnrollmentDate).split('T')[0] : '',
      }));

      setStudents(formatted);
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات الطلاب',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [semesterId]);

  const handleAdd = async () => {
    if (!form.naturalId || !form.fullName) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    if (!semesterId) {
      toast({
        title: 'خطأ',
        description: 'لم يتم تحديد الفصل الدراسي',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingId) {
        const oldStudent = students.find(s => s.id === editingId);
        if (!oldStudent) return;

        const res = await fetch(
          `https://school-portal-backend-new.onrender.com/students/${oldStudent.naturalId}/${semesterId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fullName: form.fullName,
              birthDate: form.birthDate,
              address: form.address,
              guardianPhone: form.guardianPhone,
              enrollmentDate: form.enrollmentDate,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل تعديل الطالب',
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: 'تم التعديل',
          description: 'تم تعديل بيانات الطالب بنجاح'
        });
      } else {
        const res = await fetch('https://school-portal-backend-new.onrender.com/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            naturalId: form.naturalId,
            fullName: form.fullName,
            birthDate: form.birthDate,
            address: form.address,
            guardianPhone: form.guardianPhone,
            enrollmentDate: form.enrollmentDate,
            semesterId: Number(semesterId),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast({
            title: 'خطأ',
            description: data.error || 'فشل إضافة الطالب',
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: 'تمت الإضافة',
          description: 'تم إضافة الطالب بنجاح'
        });
      }

      resetForm();
      fetchStudents();

    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setForm({
      naturalId: student.naturalId,
      fullName: student.fullName,
      birthDate: student.birthDate,
      address: student.address,
      guardianPhone: student.guardianPhone,
      enrollmentDate: student.enrollmentDate,
    });
    setShowForm(true);
  };

  const handleDelete = async (student: Student) => {
    if (!semesterId) return;

    try {
      const res = await fetch(
        `https://school-portal-backend-new.onrender.com/students/${student.naturalId}/${semesterId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حذف الطالب',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الطالب بنجاح'
      });

      fetchStudents();
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setForm({
      naturalId: '',
      fullName: '',
      birthDate: '',
      address: '',
      guardianPhone: '',
      enrollmentDate: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredStudents = students.filter((student) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return true;

    return (
      student.fullName.toLowerCase().includes(keyword) ||
      student.naturalId.includes(keyword)
    );
  });

  return (
    <DashboardLayout title="الطلاب" subtitle="إدارة بيانات الطلاب" showBackButton>
      <div className="max-w-5xl mx-auto space-y-6">
{!showForm && (
  <Button onClick={() => setShowForm(true)} variant="peach">
    <Plus size={18} className="ml-2" />
    إضافة طالب جديد
  </Button>
)}

{showForm && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <UsersRound size={20} className="text-primary" />
        {editingId ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>رقم الهوية *</Label>
          <Input
            value={form.naturalId}
            onChange={(e) => setForm({ ...form, naturalId: e.target.value })}
            placeholder="رقم الهوية"
            disabled={editingId !== null}
          />
        </div>

        <div className="space-y-2">
          <Label>الاسم الكامل *</Label>
          <Input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="الاسم الكامل"
          />
        </div>

        <div className="space-y-2">
          <Label>تاريخ الميلاد</Label>
          <Input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>العنوان</Label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="العنوان"
          />
        </div>

        <div className="space-y-2">
          <Label>هاتف ولي الأمر</Label>
          <Input
            value={form.guardianPhone}
            onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
            placeholder="05xxxxxxxx"
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label>تاريخ التسجيل</Label>
          <Input
            type="date"
            value={form.enrollmentDate}
            onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={handleAdd}>
          {editingId ? 'حفظ التعديلات' : 'إضافة'}
        </Button>
        <Button variant="ghost" onClick={resetForm}>إلغاء</Button>
      </div>
    </CardContent>
  </Card>
)}

<Card>
  <CardHeader className="pb-3">
    <div className="relative w-full sm:w-80">
      <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="ابحث باسم الطالب أو رقم الهوية"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pr-10"
      />
    </div>
  </CardHeader>

  <CardContent className="p-0">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">#</TableHead>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">رقم الهوية</TableHead>
            <TableHead className="text-right">هاتف ولي الأمر</TableHead>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right w-32">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student, index) => (
            <TableRow key={`${student.naturalId}-${index}`}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-peach flex items-center justify-center">
                    <User size={16} />
                  </div>
                  {student.fullName}
                </div>
              </TableCell>
              <TableCell>{student.naturalId}</TableCell>
              <TableCell dir="ltr">{student.guardianPhone}</TableCell>
              <TableCell>{student.address}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(student)}>
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(student)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredStudents.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                لا يوجد نتائج مطابقة
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </CardContent>
</Card>
      </div>
    </DashboardLayout>
  );
}