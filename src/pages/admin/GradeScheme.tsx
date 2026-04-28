import { useState, useEffect } from 'react';
import { Award, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface GradeType {
  id: number;
  name: string;
  maxGrade: number;
}

export default function AdminGradeScheme() {
  const { toast } = useToast();

  const selectedSemester = localStorage.getItem("adminSelectedSemester");

  const [gradeTypes, setGradeTypes] = useState<GradeType[]>([]);
  const [newName, setNewName] = useState('');
  const [newMaxGrade, setNewMaxGrade] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingMaxGrade, setEditingMaxGrade] = useState('');

  const fetchData = async () => {
    if (!selectedSemester) {
      toast({
        title: 'خطأ',
        description: 'لم يتم تحديد الفصل الدراسي',
        variant: 'destructive'
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/grade-scheme/${selectedSemester}`);
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل تحميل البيانات',
          variant: 'destructive'
        });
        return;
      }

      const formatted = data.map((item: any) => ({
        id: item.SchemeID,
        name: item.GradeTypeName,
        maxGrade: Number(item.MaxGrade)
      }));

      setGradeTypes(formatted);
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل البيانات',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  const totalGrade = gradeTypes.reduce(
    (sum, g) => sum + Number(g.maxGrade),
    0
  );

  const isTotalCorrect = totalGrade === 100;

  const handleAdd = async () => {
    if (!newName.trim() || !newMaxGrade) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedSemester) {
      toast({
        title: 'خطأ',
        description: 'لم يتم تحديد الفصل الدراسي',
        variant: 'destructive'
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/grade-scheme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newName,
          maxGrade: parseFloat(newMaxGrade),
          semesterId: Number(selectedSemester)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل الإضافة',
          variant: 'destructive'
        });
        return;
      }

      setNewName('');
      setNewMaxGrade('');
      fetchData();

      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة نوع العلامة بنجاح'
      });

    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الإضافة',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (item: GradeType) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingMaxGrade(item.maxGrade.toString());
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim() || !editingMaxGrade) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/grade-scheme/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: editingName,
          maxGrade: parseFloat(editingMaxGrade)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل التعديل',
          variant: 'destructive'
        });
        return;
      }

      setEditingId(null);
      fetchData();

      toast({
        title: 'تم التعديل',
        description: 'تم تعديل نوع العلامة بنجاح'
      });

    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل التعديل',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/grade-scheme/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل الحذف',
          variant: 'destructive'
        });
        return;
      }

      setGradeTypes(prev => prev.filter(g => g.id !== id));

      toast({
        title: 'تم الحذف',
        description: 'تم حذف نوع العلامة بنجاح'
      });

    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الحذف',
        variant: 'destructive'
      });
    }
  };

  return (
    <DashboardLayout
      title="تقسيم العلامات"
      subtitle="إدارة أنواع العلامات والحد الأقصى لكل منها"
      showBackButton
    >
      <div className="max-w-3xl mx-auto space-y-6">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={20} className="text-primary" />
              إضافة نوع علامة جديد
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="اسم العلامة (مثال: شهري 1)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1"
              />

              <Input
                type="number"
                placeholder="الحد الأقصى"
                value={newMaxGrade}
                onChange={(e) => setNewMaxGrade(e.target.value)}
                className="w-32"
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
                  <TableHead className="text-right">اسم العلامة</TableHead>
                  <TableHead className="text-right">الحد الأقصى</TableHead>
                  <TableHead className="text-right w-32">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {gradeTypes.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="max-w-[150px]"
                        />
                      ) : (
                        item.name
                      )}
                    </TableCell>

                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          value={editingMaxGrade}
                          onChange={(e) => setEditingMaxGrade(e.target.value)}
                          className="max-w-[80px]"
                        />
                      ) : (
                        item.maxGrade
                      )}
                    </TableCell>

                    <TableCell>
                      {editingId === item.id ? (
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                            <Check size={16} className="text-soft-green" />
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
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow className="bg-muted/50">
                  <TableCell colSpan={2} className="font-bold">
                    المجموع
                  </TableCell>

                  <TableCell
                    className={`font-bold ${
                      isTotalCorrect ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {totalGrade}
                  </TableCell>

                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}