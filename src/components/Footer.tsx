import { Phone, MapPin, Youtube, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-right">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin size={16} />
              <span className="text-sm">رام الله - قطنة - مقابل مخبز الطيبات</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone size={16} />
              <a href="tel:0568236526" className="text-sm hover:text-primary transition-colors" dir="ltr">
                056-823-6526
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://www.facebook.com/share/17Z5idWsK4/?mibextid=wwXIfr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-baby-blue flex items-center justify-center hover:bg-baby-blue-dark transition-colors"
            >
              <Facebook size={20} className="text-foreground" />
            </a>
            <a 
              href="https://youtube.com/@islamjamhour58?si=Uqxhx5YL4P2zpurO" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-soft-pink flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <Youtube size={20} className="text-foreground" />
            </a>
          </div>
          
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              مدرسة إسلام النموذجية © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-muted-foreground">
              جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
