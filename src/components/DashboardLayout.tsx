import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchoolLogo } from '@/components/SchoolLogo';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backPath?: string;
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = false,
  backPath = '/dashboard'
}: DashboardLayoutProps) {
  const { logout, student, employee, userType } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userName = student?.fullName || employee?.fullName || 'المستخدم';
  const userTypeLabel = userType === 'admin' ? 'مدير' : userType === 'teacher' ? 'معلم' : 'طالب';

  return (
    <div className="min-h-screen flex flex-col bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(backPath)}
                className="rounded-full"
              >
                <ArrowRight size={20} />
              </Button>
            )}
            <SchoolLogo size="sm" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{userTypeLabel}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {children}
      </main>

      <Footer />
    </div>
  );
}
