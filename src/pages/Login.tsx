import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, HelpCircle, BookOpen, Users, Calendar, MessageCircle } from 'lucide-react';
import schoolChildrenImg from '@/assets/school-children.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolLogo } from '@/components/SchoolLogo';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('الرجاء إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'فشل تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-hero" dir="rtl">
      {/* Header */}
      <header className="w-full py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>islam.com</span>
        </div>
        <SchoolLogo size="sm" />
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left Side - Info */}
        <div className="flex-1 max-w-xl text-center lg:text-right animate-slide-up">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            أهلاً بكم في الموقع الإلكتروني
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gradient mb-6">
            لمدرسة إسلام النموذجية
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            يساعدكم هذا التطبيق على متابعة أبنائكم بسهولة من خلال:
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-soft animate-slide-up-delay-1">
              <div className="w-10 h-10 rounded-full bg-peach flex items-center justify-center">
                <BookOpen size={20} className="text-foreground" />
              </div>
              <span className="text-sm font-medium">الواجبات اليومية</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-soft animate-slide-up-delay-1">
              <div className="w-10 h-10 rounded-full bg-baby-blue flex items-center justify-center">
                <Users size={20} className="text-foreground" />
              </div>
              <span className="text-sm font-medium">الحضور والغياب</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-soft animate-slide-up-delay-2">
              <div className="w-10 h-10 rounded-full bg-soft-yellow flex items-center justify-center">
                <MessageCircle size={20} className="text-foreground" />
              </div>
              <span className="text-sm font-medium">التواصل مع المعلمين</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-soft animate-slide-up-delay-2">
              <div className="w-10 h-10 rounded-full bg-soft-pink flex items-center justify-center">
                <Calendar size={20} className="text-foreground" />
              </div>
              <span className="text-sm font-medium">الجداول الدراسية</span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            هدفنا أن نبقيكم دائماً على تواصل مع المدرسة خطوة بخطوة في مسيرة تعلم أطفالكم
          </p>

          <div className="hidden lg:block">
            <img 
              src={schoolChildrenImg} 
              alt="أطفال المدرسة" 
              className="w-full max-w-md mx-auto animate-float rounded-2xl shadow-card"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md animate-slide-up-delay-1">
          <Card className="shadow-card border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2 pt-4">
              <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">اسم المستخدم</label>
                  <Input
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-right"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-right"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'جاري التحميل...' : 'دخول'}
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-xl bg-muted">
                <div className="flex items-start gap-3">
                  <HelpCircle size={20} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      هل تواجه مشكلة في تسجيل الدخول؟
                    </p>
                    <p className="text-sm text-muted-foreground">
                      تواصل مع الإدارة
                    </p>
                    <a 
                      href="tel:0568236526" 
                      className="flex items-center gap-2 mt-2 text-primary hover:underline"
                      dir="ltr"
                    >
                      <Phone size={16} />
                      056-823-6526
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
