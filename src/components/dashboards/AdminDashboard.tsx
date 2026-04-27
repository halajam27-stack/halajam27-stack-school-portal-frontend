import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  UserPlus, 
  UsersRound,
  Link2,
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/DashboardLayout';
import { toast } from 'sonner';

interface SemesterItem {
  id: number;
  name: string;
}

const adminMenuItems = [
  { id: 'classes', title: 'الصفوف', icon: GraduationCap, variant: 'peach' as const },
  { id: 'sections', title: 'الشُعب', icon: Users, variant: 'babyBlue' as const },
  { id: 'subjects', title: 'المواد', icon: BookOpen, variant: 'yellow' as const },
  { id: 'gradeScheme', title: 'تقسيم العلامات', icon: Award, variant: 'green' as const },
  { id: 'teachers', title: 'المعلمين', icon: UserPlus, variant: 'purple' as const },
  { id: 'students', title: 'الطلاب', icon: UsersRound, variant: 'peach' as const },
  { id: 'relations', title: 'إدارة العلاقات', icon: Link2, variant: 'babyBlue' as const },
  { id: 'periods', title: 'الحصص', icon: Calendar, variant: 'pink' as const },
];

export default function AdminDashboard() {
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
 const fetchSemesters = () => {
  fetch("https://school-portal-backend-new-cfr6.onrender.com/semesters")
    .then(res => res.json())
    .then(data => {
      const formatted = data.map((item: any) => ({
        id: item.SemesterID,
        name: item.SemesterName
      }));
      setSemesters(formatted);
    })
    .catch(() => {
      toast.error("فشل تحميل الفصول");
    });
};
useEffect(() => {
  fetchSemesters();
}, []); 
  const [selectedSemester, setSelectedSemester] = useState<number | null>(() => {
    const saved = localStorage.getItem('adminSelectedSemester');
    return saved ? parseInt(saved, 10) : null;
  });
  const [showNewSemester, setShowNewSemester] = useState(false);
  const [newSemesterId, setNewSemesterId] = useState('');
  const [newSemesterName, setNewSemesterName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const navigate = useNavigate();

  const handleSelectSemester = (id: number) => {
    setSelectedSemester(id);
    localStorage.setItem('adminSelectedSemester', id.toString());
  };

  const handleChangeSemester = () => {
    setSelectedSemester(null);
    localStorage.removeItem('adminSelectedSemester');
  };
const handleAddSemester = async () => {
  const idNum = parseInt(newSemesterId, 10);

  if (!newSemesterId.trim() || isNaN(idNum)) {
    toast.error('أدخل رقم صحيح');
    return;
  }

  if (!newSemesterName.trim()) {
    toast.error('أدخل اسم الفصل');
    return;
  }

  try {
    const res = await fetch("https://school-portal-backend-new-cfr6.onrender.com/semesters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        SemesterID: idNum,
        SemesterName: newSemesterName
      })
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
      return;
    }

    fetchSemesters(); // 🔥 تحديث من DB

    toast.success("تمت الإضافة ✅");

    setNewSemesterId('');
    setNewSemesterName('');
    setShowNewSemester(false);

  } catch {
    toast.error("خطأ في السيرفر");
  }
};
  const handleStartEdit = (semester: SemesterItem) => {
    setEditingId(semester.id);
    setEditingName(semester.name);
  };

  const handleSaveEdit = async () => {
  if (!editingName.trim()) return;

  try {
    const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/semesters/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        SemesterName: editingName
      })
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
      return;
    }

    fetchSemesters();

    setEditingId(null);
    toast.success("تم التعديل ✅");

  } catch {
    toast.error("خطأ في السيرفر");
  }
};

const handleDelete = async (id: number) => {
  try {
    const res = await fetch(`https://school-portal-backend-new-cfr6.onrender.com/semesters/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error);
      return;
    }

    fetchSemesters();

    if (selectedSemester === id) {
      setSelectedSemester(null);
      localStorage.removeItem('adminSelectedSemester');
    }

    toast.success("تم الحذف ✅");

  } catch {
    toast.error("خطأ في السيرفر");
  }
};

  const handleMenuClick = (id: string) => {
    navigate(`/admin/${id}`);
  };

  if (!selectedSemester) {
    return (
      <DashboardLayout 
        title="لوحة تحكم المدير"
        subtitle="اختر الفصل الدراسي للمتابعة"
      >
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={24} />
                الفصول الدراسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {semesters.map((semester) => (
                <div key={semester.id} className="flex items-center gap-2">
                  {editingId === semester.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1"
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                        <Check size={16} className="text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 justify-between h-auto py-4 px-6"
                        onClick={() => handleSelectSemester(semester.id)}
                      >
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-lg">{semester.name}</span>
                          <span className="text-xs text-muted-foreground">رقم الفصل: {semester.id}</span>
                        </div>
                        <ChevronLeft size={20} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleStartEdit(semester)}>
                        <Pencil size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(semester.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              ))}

              {showNewSemester ? (
                <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                  <div className="flex gap-2">
                    <Input
                      placeholder="رقم الفصل (مثال: 20251)"
                      value={newSemesterId}
                      onChange={(e) => setNewSemesterId(e.target.value)}
                      className="w-48"
                      type="number"
                    />
                    <Input
                      placeholder="اسم الفصل الدراسي"
                      value={newSemesterName}
                      onChange={(e) => setNewSemesterName(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={handleAddSemester}>حفظ</Button>
                    <Button variant="ghost" onClick={() => { setShowNewSemester(false); setNewSemesterId(''); setNewSemesterName(''); }}>إلغاء</Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => setShowNewSemester(true)}
                >
                  <Plus size={20} className="ml-2" />
                  إضافة فصل دراسي جديد
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const currentSemester = semesters.find(s => s.id === selectedSemester);

  return (
    <DashboardLayout 
      title="البيانات"
      subtitle={currentSemester?.name}
    >
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={handleChangeSemester}
      >
        <ChevronLeft size={20} className="rotate-180" />
        تغيير الفصل الدراسي
      </Button>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {adminMenuItems.map((item, index) => (
          <Card
            key={item.id}
            variant={item.variant}
            onClick={() => handleMenuClick(item.id)}
            className="group animate-scale-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-card/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <item.icon size={24} className="text-foreground sm:w-7 sm:h-7" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-foreground">{item.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
