import logo from '@/assets/school-logo-banner.png';

interface SchoolLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function SchoolLogo({ size = 'md', showText = true }: SchoolLogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Logo Image بدل الأيقونة */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-card`}>
        <img
          src={logo}
          alt="School Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {/* النص */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizes[size]} font-bold text-foreground italic`}>
            إسلام
          </span>
          <span className="text-xs text-muted-foreground">
            النموذجية
          </span>
        </div>
      )}
    </div>
  );
}