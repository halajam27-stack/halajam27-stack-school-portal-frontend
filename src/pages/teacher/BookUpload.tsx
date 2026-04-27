import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, FileText, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';

interface UploadedBook {
  name: string;
  uploadDate: string;
  size: string;
  path: string;
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

export default function TeacherBookUpload() {
  const { sectionId, subjectId } = useParams();
  const { toast } = useToast();
  const semesterId = localStorage.getItem('adminSelectedSemester');

  const [uploadedBook, setUploadedBook] = useState<UploadedBook | null>(null);
  const [classData, setClassData] = useState<ClassInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    const fetchCurrentBook = async () => {
      if (!subjectId || !semesterId) return;

      try {
        const res = await fetch(
          `https://school-portal-backend-new-cfr6.onrender.com/teacher/book/${subjectId}/${semesterId}`
        );
        const data = await res.json();

        if (!res.ok) return;

        if (data.BookPath) {
          const fileName = data.BookPath.split('/').pop() || 'book.pdf';

          setUploadedBook({
            name: fileName,
            uploadDate: 'مرفوع سابقًا',
            size: 'غير معروف',
            path: `https://school-portal-backend-new-cfr6.onrender.com${data.BookPath}`,
          });
        } else {
          setUploadedBook(null);
        }
      } catch {
        toast({
          title: 'خطأ',
          description: 'فشل الاتصال بالسيرفر',
          variant: 'destructive',
        });
      }
    };

    fetchCurrentBook();
  }, [subjectId, semesterId, toast]);

  const formatFileSize = (size: number) => {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: 'خطأ',
        description: 'يرجى رفع ملف PDF فقط',
        variant: 'destructive',
      });
      return;
    }

    if (!subjectId || !semesterId) {
      toast({
        title: 'خطأ',
        description: 'بيانات الصفحة ناقصة',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('book', file);
      formData.append('subjectId', subjectId);
      formData.append('semesterId', semesterId);

      const res = await fetch('https://school-portal-backend-new-cfr6.onrender.com/teacher/book-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل رفع الكتاب',
          variant: 'destructive',
        });
        return;
      }

      setUploadedBook({
        name: data.fileName,
        uploadDate: new Date().toISOString().split('T')[0],
        size: formatFileSize(file.size),
        path: `https://school-portal-backend-new-cfr6.onrender.com${data.bookPath}`,
      });

      toast({
        title: 'تم الرفع',
        description: 'تم رفع الكتاب بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!subjectId || !semesterId) return;

    try {
      const res = await fetch(
        `https://school-portal-backend-new-cfr6.onrender.com/teacher/book/${subjectId}/${semesterId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'خطأ',
          description: data.error || 'فشل حذف الكتاب',
          variant: 'destructive',
        });
        return;
      }

      setUploadedBook(null);

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الكتاب بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'فشل الاتصال بالسيرفر',
        variant: 'destructive',
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  return (
    <DashboardLayout
      title="رفع كتاب المادة"
      subtitle={`${classData?.subjectName || 'المادة'} | ${classData?.className || 'الصف'} - شعبة ${classData?.sectionName || ''}`}
      showBackButton
      backPath={`/teacher/class/${sectionId}/${subjectId}`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} className="text-primary" />
              رفع كتاب جديد
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-full bg-baby-blue mx-auto mb-4 flex items-center justify-center">
                <Upload size={28} className="text-foreground" />
              </div>

              <p className="text-lg font-medium text-foreground mb-2">
                اسحب الملف هنا أو اضغط للاختيار
              </p>

              <p className="text-sm text-muted-foreground mb-4">
                يدعم ملفات PDF فقط
              </p>

              <Label htmlFor="file-upload">
                <Button variant="outline" asChild disabled={isUploading}>
                  <span>{isUploading ? 'جاري الرفع...' : 'اختر ملف'}</span>
                </Button>
              </Label>

              <Input
                id="file-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
              />
            </div>
          </CardContent>
        </Card>

        {uploadedBook && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle size={18} className="text-soft-green" />
                الكتاب الحالي
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted">
                <div className="w-12 h-12 rounded-xl bg-peach flex items-center justify-center">
                  <FileText size={24} className="text-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {uploadedBook.name}
                  </p>

                  <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                    <span>الحجم: {uploadedBook.size}</span>
                    <span>تاريخ الرفع: {uploadedBook.uploadDate}</span>
                  </div>

                  <a
                    href={uploadedBook.path}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline mt-2 inline-block"
                  >
                    عرض الكتاب
                  </a>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card variant="flat" className="bg-baby-blue/30">
          <CardContent className="p-4">
            <p className="text-sm text-foreground">
              <strong>ملاحظة:</strong> الكتاب المرفوع سيكون متاحًا لجميع طلاب هذه المادة للاطلاع عليه من خلال صفحة المواد الدراسية.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}