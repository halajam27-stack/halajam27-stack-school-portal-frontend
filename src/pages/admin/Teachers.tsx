import { useState, useRef, useEffect } from 'react';
import { UserPlus, Plus, Pencil, Trash2, User, Camera, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface Teacher {
  id: number;
  naturalId: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  hireDate: string;
  photo: string;
}

export default function AdminTeachers() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState<Omit<Teacher, 'id'>>({
    naturalId: '',
    fullName: '',
    jobTitle: '',
    phone: '',
    hireDate: '',
    photo: '',
  });

  const semesterId = localStorage.getItem("adminSelectedSemester");

  const fetchTeachers = async () => {
    if (!semesterId) return;

    try {
      const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/teachers/${semesterId}`);
      const data = await res.json();

      const formatted = data.map((teacher: any, index: number) => ({
        id: index + 1,
        naturalId: teacher.NaturalID,
        fullName: teacher.FullName,
        jobTitle: teacher.JobTitle || '',
        phone: teacher.Phone || '',
        hireDate: teacher.HireDate ? String(teacher.HireDate).split('T')[0] : '',
        photo: teacher.Photo
          ? `https://school-portal-backend-new-cfr6.onrender.com/uploads/teachers/${teacher.Photo}`
          : '',
      }));

      setTeachers(formatted);
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل بيانات المعلمين',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchTeachers();
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
      const formData = new FormData();

      formData.append('naturalId', form.naturalId);
      formData.append('fullName', form.fullName);
      formData.append('jobTitle', form.jobTitle);
      formData.append('phone', form.phone);
      formData.append('hireDate', form.hireDate);
      formData.append('semesterId', String(semesterId));

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      let res: Response;

      if (editingId) {
        const oldTeacher = teachers.find(t => t.id === editingId);
        if (!oldTeacher) return;

        res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/teachers/${oldTeacher.naturalId}/${semesterId}`,
          {
            method: 'PUT',
            body: formData,
          }
        );
      } else {
        res = await fetch('https://school-portal-backend-new-cfr6.onrender.com/teachers', {
          method: 'POST',
          body: formData,
        });
      }

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || (editingId ? 'فشل تعديل المعلم' : 'فشل إضافة المعلم'),
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: editingId ? 'تم التعديل' : 'تمت الإضافة',
        description: editingId
          ? 'تم تعديل بيانات المعلم بنجاح'
          : 'تم إضافة المعلم بنجاح'
      });

      resetForm();
      fetchTeachers();

    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setForm({
      naturalId: teacher.naturalId,
      fullName: teacher.fullName,
      jobTitle: teacher.jobTitle,
      phone: teacher.phone,
      hireDate: teacher.hireDate,
      photo: teacher.photo,
    });
    setPhotoFile(null);
    setShowForm(true);
  };

  const handleDelete = async (teacher: Teacher) => {
    if (!semesterId) return;

    try {
      const res = await fetch(
        `https://school-portal-backend-new-cfr6.onrender.com/teachers/${teacher.naturalId}/${semesterId}`,
        { method: 'DELETE' }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حذف المعلم',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'تم الحذف',
        description: 'تم حذف المعلم بنجاح'
      });

      fetchTeachers();
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
      jobTitle: '',
      phone: '',
      hireDate: '',
      photo: '',
    });
    setPhotoFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setForm({ ...form, photo: URL.createObjectURL(file) });
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return true;

    return (
      teacher.fullName.toLowerCase().includes(keyword) ||
      teacher.naturalId.includes(keyword)
    );
  });

  return (
    <DashboardLayout title="المعلمين" subtitle="إدارة بيانات المعلمين" showBackButton>
      <div className="max-w-4xl mx-auto space-y-6">
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} variant="peach">
            <Plus size={18} className="ml-2" />
            إضافة معلم جديد
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus size={20} className="text-primary" />
                {editingId ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 flex justify-center">
                  <div className="space-y-2 text-center">
                    <Label>صورة المعلم</Label>
                    <div
                      className="w-24 h-24 mx-auto rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {form.photo ? (
                        <img src={form.photo} alt="صورة المعلم" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={32} className="text-muted-foreground" />
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <p className="text-xs text-muted-foreground">انقر لإضافة صورة</p>
                  </div>
                </div>

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
                  <Label>المسمى الوظيفي</Label>
                  <Input
                    value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                    placeholder="معلم رياضيات"
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاريخ التعيين</Label>
                  <Input
                    type="date"
                    value={form.hireDate}
                    onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
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
            <div className="relative">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم المعلم أو رقم الهوية"
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
                    <TableHead className="text-right">المسمى الوظيفي</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-right w-32">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher, index) => (
                    <TableRow key={`${teacher.naturalId}-${index}`}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-baby-blue flex items-center justify-center overflow-hidden">
                            {teacher.photo ? (
                              <img src={teacher.photo} alt={teacher.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <User size={16} />
                            )}
                          </div>
                          {teacher.fullName}
                        </div>
                      </TableCell>
                      <TableCell>{teacher.naturalId}</TableCell>
                      <TableCell>{teacher.jobTitle}</TableCell>
                      <TableCell dir="ltr">{teacher.phone}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(teacher)}>
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(teacher)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredTeachers.length === 0 && (
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