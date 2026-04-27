import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface ClassItem {
  id: number;
  name: string;
}

export default function AdminClasses() {
  const { toast } = useToast();

  const selectedSemester = localStorage.getItem("adminSelectedSemester");

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  // 🔥 جلب الصفوف حسب السمستر
  const fetchClasses = () => {
    if (!selectedSemester) return;

    fetch(`https://school-portal-backend-new-cfr6.onrender.com/classes?semesterId=${selectedSemester}`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: any, b: any) => a.ClassID - b.ClassID);
        const formatted = data.map((c: any) => ({
          id: c.ClassID,
          name: c.ClassName
        }));
        setClasses(formatted);
      })
      .catch(() => {
        toast({ title: "خطأ", description: "فشل تحميل البيانات", variant: "destructive" });
      });
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedSemester]);

  // ➕ إضافة صف
  const handleAdd = async () => {
    if (!newClassName.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم الصف', variant: 'destructive' });
      return;
    }

    if (!selectedSemester) {
      toast({ title: "خطأ", description: "لم يتم اختيار السمستر", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("https://school-portal-backend-new-cfr6.onrender.com/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ClassName: newClassName,
          SemesterID: Number(selectedSemester) // 🔥 أهم سطر
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "خطأ", description: data.error, variant: "destructive" });
        return;
      }

      fetchClasses();

      setNewClassName('');

      toast({ title: 'تم الإضافة', description: 'تم إضافة الصف بنجاح' });

    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال بالسيرفر", variant: "destructive" });
    }
  };

  // ✏️ تعديل صف
  const handleEdit = (item: ClassItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) return;

    try {
      const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/classes/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ClassName: editingName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "خطأ", description: data.error, variant: "destructive" });
        return;
      }

      fetchClasses();
      setEditingId(null);

      toast({ title: 'تم التعديل', description: 'تم تعديل الصف بنجاح' });

    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال", variant: "destructive" });
    }
  };

  // 🗑️ حذف صف
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/classes/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "خطأ", description: data.error, variant: "destructive" });
        return;
      }

      fetchClasses();

      toast({ title: 'تم الحذف', description: 'تم حذف الصف بنجاح' });

    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="الصفوف" subtitle="إدارة الصفوف الدراسية" showBackButton>
      <div className="max-w-3xl mx-auto space-y-6">

        {/* إضافة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap size={20} className="text-primary" />
              إضافة صف جديد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-3">
              <Input
                placeholder="اسم الصف (مثال: الصف الأول)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
              <Button onClick={handleAdd}>
                <Plus size={18} className="ml-2" />
                إضافة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* الجدول */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">#</TableHead>
                  <TableHead className="text-right">اسم الصف</TableHead>
                  <TableHead className="text-right w-32">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {classes.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                      ) : (
                        item.name
                      )}
                    </TableCell>

                    <TableCell>
                      {editingId === item.id ? (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                            <Check size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(item)}>
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}