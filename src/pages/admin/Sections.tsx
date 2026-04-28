import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface Section {
  id: number;
  name: string;
  classId: number;
  className: string;
}

export default function AdminSections() {
  const { toast } = useToast();

  const selectedSemester = localStorage.getItem("adminSelectedSemester");

  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const fetchData = async () => {
    if (!selectedSemester) return;

    try {
      const resClasses = await fetch(`https://school-portal-backend-new.onrender.com/classes?semesterId=${selectedSemester}`);
      const dataClasses = await resClasses.json();
      setClasses(dataClasses);

      const resSections = await fetch(`https://school-portal-backend-new.onrender.com/sections?semesterId=${selectedSemester}`);
      const dataSections = await resSections.json();

      const formatted = dataSections.map((s: any) => ({
        id: s.SectionID,
        name: s.SectionName,
        classId: s.ClassID,
        className: s.ClassName
      }));

      setSections(formatted);
    } catch {
      toast({ title: "خطأ", description: "فشل تحميل البيانات", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  const handleAdd = async () => {
    if (!selectedClass || !newSectionName.trim()) {
      toast({ title: 'خطأ', description: 'اختار الصف واكتب اسم الشعبة', variant: 'destructive' });
      return;
    }

    if (!selectedSemester) {
      toast({ title: "خطأ", description: "ما في سمستر", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("https://school-portal-backend-new.onrender.com/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          SectionName: newSectionName,
          ClassID: Number(selectedClass),
          SemesterID: Number(selectedSemester)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "خطأ", description: data.error, variant: "destructive" });
        return;
      }

      setNewSectionName('');
      fetchData();

      toast({ title: 'تم', description: 'تمت إضافة الشعبة' });
    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال", variant: "destructive" });
    }
  };

  const handleEdit = (item: Section) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) return;

    try {
      const res = await fetch(`https://school-portal-backend-new.onrender.com/sections/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          SectionName: editingName
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "خطأ", description: data.error, variant: "destructive" });
        return;
      }

      setEditingId(null);
      fetchData();

      toast({ title: 'تم', description: 'تم تعديل الشعبة' });
    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`https://school-portal-backend-new.onrender.com/sections/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "خطأ", description: data.error, variant: "destructive" });
        return;
      }

      fetchData();

      toast({ title: 'تم', description: 'تم حذف الشعبة' });
    } catch {
      toast({ title: "خطأ", description: "فشل الاتصال", variant: "destructive" });
    }
  };

  const filteredSections = selectedClass
    ? sections.filter((section) => section.classId === Number(selectedClass))
    : sections;

  return (
    <DashboardLayout title="الشُعب" subtitle="إدارة الشعب الدراسية" showBackButton>
      <div className="max-w-3xl mx-auto space-y-6">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              إضافة شعبة جديدة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">

              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="اختر الصف" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (
                    <SelectItem key={c.ClassID} value={c.ClassID.toString()}>
                      {c.ClassName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="اسم الشعبة (مثال: أ، ب، ج)"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />

              <Button onClick={handleAdd}>
                <Plus size={18} className="ml-2" />
                إضافة
              </Button>

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">#</TableHead>
                  <TableHead className="text-right">الصف</TableHead>
                  <TableHead className="text-right">الشعبة</TableHead>
                  <TableHead className="text-right w-32">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSections.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>{item.className}</TableCell>

                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="max-w-[100px]"
                        />
                      ) : (
                        `شعبة ${item.name}`
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
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredSections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      لا توجد شُعب لهذا الصف
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}