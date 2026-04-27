import { useState, useEffect } from 'react';
import { BookOpen, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { subjectIcons, getIconById } from '@/lib/subjectIcons';

interface Subject {
  id: number;
  name: string;
  classId: number;
  className: string;
  iconId: string;
}

export default function AdminSubjects() {
  const { toast } = useToast();

  const selectedSemester = localStorage.getItem('adminSelectedSemester');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('book');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIconId, setEditingIconId] = useState('book');
  const [editIconPickerOpen, setEditIconPickerOpen] = useState(false);

  const fetchData = async () => {
    if (!selectedSemester) return;

    try {
      const resClasses = await fetch(
        `https://school-portal-backend-new-cfr6.onrender.com/classes?semesterId=${selectedSemester}`
      );
      const dataClasses = await resClasses.json();
      setClasses(dataClasses);

      const resSubjects = await fetch(
        `https://school-portal-backend-new-cfr6.onrender.com/subjects?semesterId=${selectedSemester}`
      );
      const dataSubjects = await resSubjects.json();

      const formatted = dataSubjects.map((s: any) => ({
        id: s.SubjectID,
        name: s.SubjectName,
        classId: s.ClassID,
        className: s.ClassName,
        iconId: s.IconId || 'book',
      }));

      setSubjects(formatted);
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل تحميل البيانات',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  const handleAdd = async () => {
    if (!selectedClass || !newSubjectName.trim()) {
      toast({
        title: 'خطأ',
        description: 'اختار الصف واكتب اسم المادة',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedSemester) {
      toast({
        title: 'خطأ',
        description: 'ما في سمستر',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('https://school-portal-backend-new-cfr6.onrender.com/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SubjectName: newSubjectName,
          ClassID: Number(selectedClass),
          SemesterID: Number(selectedSemester),
          IconId: selectedIconId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل إضافة المادة',
          variant: 'destructive',
        });
        return;
      }

      setNewSubjectName('');
      setSelectedIconId('book');
      fetchData();

      toast({
        title: 'تم',
        description: 'تمت إضافة المادة',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: Subject) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingIconId(item.iconId || 'book');
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim() || !editingId) return;

    try {
      const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/subjects/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SubjectName: editingName,
          IconId: editingIconId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل تعديل المادة',
          variant: 'destructive',
        });
        return;
      }

      setEditingId(null);
      setEditingName('');
      setEditingIconId('book');
      fetchData();

      toast({
        title: 'تم',
        description: 'تم تعديل المادة',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/subjects/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حذف المادة',
          variant: 'destructive',
        });
        return;
      }

      fetchData();

      toast({
        title: 'تم',
        description: 'تم حذف المادة',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال',
        variant: 'destructive',
      });
    }
  };

  const filteredSubjects = selectedClass
    ? subjects.filter((subject) => subject.classId === Number(selectedClass))
    : subjects;

  const IconGrid = ({
    selected,
    onSelect,
    onClose,
  }: {
    selected: string;
    onSelect: (id: string) => void;
    onClose: () => void;
  }) => (
    <div className="grid grid-cols-6 gap-1 p-2 max-h-48 overflow-y-auto">
      {subjectIcons.map((icon) => (
        <button
          key={icon.id}
          type="button"
          onClick={() => {
            onSelect(icon.id);
            onClose();
          }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:bg-accent transition-colors ${
            selected === icon.id ? 'bg-primary/20 ring-2 ring-primary' : ''
          }`}
          title={icon.label}
        >
          {icon.emoji}
        </button>
      ))}
    </div>
  );

  return (
    <DashboardLayout title="المواد" subtitle="إدارة المواد الدراسية" showBackButton>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              إضافة مادة جديدة
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-12 h-12 text-2xl p-0 shrink-0">
                    {getIconById(selectedIconId)}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-72 p-0" align="start">
                  <p className="text-sm font-medium text-muted-foreground p-2 pb-0">
                    اختر أيقونة المادة
                  </p>
                  <IconGrid
                    selected={selectedIconId}
                    onSelect={setSelectedIconId}
                    onClose={() => setIconPickerOpen(false)}
                  />
                </PopoverContent>
              </Popover>

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
                placeholder="اسم المادة"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
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
                  <TableHead className="text-right">الأيقونة</TableHead>
                  <TableHead className="text-right">الصف</TableHead>
                  <TableHead className="text-right">المادة</TableHead>
                  <TableHead className="text-right w-32">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredSubjects.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      {editingId === item.id ? (
                        <Popover open={editIconPickerOpen} onOpenChange={setEditIconPickerOpen}>
                          <PopoverTrigger asChild>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-xl hover:bg-accent transition-colors">
                              {getIconById(editingIconId)}
                            </button>
                          </PopoverTrigger>

                          <PopoverContent className="w-72 p-0" align="start">
                            <p className="text-sm font-medium text-muted-foreground p-2 pb-0">
                              اختر أيقونة المادة
                            </p>
                            <IconGrid
                              selected={editingIconId}
                              onSelect={setEditingIconId}
                              onClose={() => setEditIconPickerOpen(false)}
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className="text-xl">{getIconById(item.iconId)}</span>
                      )}
                    </TableCell>

                    <TableCell>{item.className}</TableCell>

                    <TableCell>
                      {editingId === item.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="max-w-xs"
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
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName('');
                              setEditingIconId('book');
                            }}
                          >
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

                {filteredSubjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      لا توجد مواد لهذا الصف
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