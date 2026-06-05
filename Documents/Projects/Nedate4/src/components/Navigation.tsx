import { Compass, User, CalendarDays, Bell, Mail, Share2, MapPin } from 'lucide-react';

interface HeaderProps {
  currentlyIn: string;
  profilePhoto: string;
  onNavigate: (view: string) => void;
  currentView: string;
  isAdmin: boolean;
}

export function Header({ currentlyIn, profilePhoto, onNavigate, currentView, isAdmin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-55 w-full bg-bg-warm/80 backdrop-blur-md border-b border-outline-soft/20 px-5 py-3">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('explore')} 
            className="w-10 h-10 rounded-full overflow-hidden border border-accent-gold/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <img 
              alt="Ned Profile" 
              src={profilePhoto} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
          <div className="flex flex-col items-start leading-none">
            <button 
              onClick={() => onNavigate('explore')}
              className="font-serif text-2xl font-bold tracking-tight text-primary-dark select-none cursor-pointer"
            >
              Nedate
            </button>
            <span className="text-[10px] text-accent-gold font-medium uppercase tracking-wider mt-0.5">
              Hang out with Ned
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <button 
              onClick={() => onNavigate('explore')}
              className={`hover:text-primary-green transition-colors cursor-pointer ${currentView === 'explore' ? 'text-primary-green font-bold border-b-2 border-primary-green' : 'text-text-muted'}`}
            >
              Explore
            </button>
            <button 
              onClick={() => onNavigate('request')}
              className={`hover:text-primary-green transition-colors cursor-pointer ${currentView === 'request' ? 'text-primary-green font-bold border-b-2 border-primary-green' : 'text-text-muted'}`}
            >
              New Request
            </button>
            <button 
              onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login')}
              className={`hover:text-primary-green transition-colors cursor-pointer ${currentView.startsWith('admin') ? 'text-primary-green font-bold border-b-2 border-primary-green' : 'text-text-muted'}`}
            >
              {isAdmin ? 'Admin Console' : 'Ned Admin'}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-green/10 text-primary-green">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              {currentlyIn}
            </span>
            <button 
              onClick={() => onNavigate('notifications')}
              className="p-2 text-text-muted hover:text-primary-green transition-colors rounded-full hover:bg-black/5 relative cursor-pointer"
              title="View Simulated Emails Received"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-accent-gold border border-bg-warm"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdmin: boolean;
}

export function BottomNav({ currentView, onNavigate, isAdmin }: BottomNavProps) {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-warm/90 backdrop-blur-lg border-t border-outline-soft/30 py-2 px-4 shadow-[0_-4px_20px_rgba(30,77,61,0.08)] flex justify-around">
      <button 
        onClick={() => onNavigate('explore')}
        className={`flex flex-col items-center gap-0.5 cursor-pointer ${currentView === 'explore' ? 'text-primary-green font-bold' : 'text-text-muted'}`}
      >
        <Compass className="w-5.5 h-5.5" />
        <span className="text-[10px] font-medium font-sans">Explore</span>
      </button>
      
      <button 
        onClick={() => onNavigate('request')}
        className={`flex flex-col items-center gap-0.5 cursor-pointer ${currentView === 'request' ? 'text-primary-green font-bold' : 'text-text-muted'}`}
      >
        <CalendarDays className="w-5.5 h-5.5" />
        <span className="text-[10px] font-medium font-sans">Request</span>
      </button>

      <button 
        onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login')}
        className={`flex flex-col items-center gap-0.5 cursor-pointer ${currentView.startsWith('admin') ? 'text-primary-green font-bold' : 'text-text-muted'}`}
      >
        <User className="w-5.5 h-5.5" />
        <span className="text-[10px] font-medium font-sans">{isAdmin ? 'Admin' : 'Ned Admin'}</span>
      </button>
    </nav>
  );
}

export function Footer({ currentlyIn, onNavigate }: { currentlyIn: string; onNavigate: (view: string) => void }) {
  return (
    <footer className="bg-primary-dark text-white pt-10 pb-20 sm:pb-10 px-5 mt-16 rounded-t-3xl shadow-inner">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
        <h3 className="font-serif text-3xl font-bold tracking-tight select-none">Nedate</h3>
        <p className="font-sans italic text-primary-green-dim/80 text-sm max-w-sm text-lime-100">
          "Life is better when shared with curious company."
        </p>
        
        <div className="flex gap-6 py-2">
          <a href="mailto:nedate@example.com" className="hover:text-accent-gold transition-colors">
            <Mail className="w-5 h-5" />
          </a>
          <button onClick={() => alert('Shareable platform URL copied!')} className="hover:text-accent-gold transition-colors cursor-pointer">
            <Share2 className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 hover:text-accent-gold transition-colors cursor-pointer" onClick={() => alert(`Ned is currently hosting meetups in ${currentlyIn}`)}>
            <MapPin className="w-5 h-5" />
          </div>
        </div>
        
        <div className="w-full pt-6 border-t border-white/10 text-[11px] text-white/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>Handcrafted with care. Dedicated to physical-world hangouts. © 2026</p>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('admin-login')} className="hover:underline text-[11px] cursor-pointer text-white/50">Admin Page</button>
            <button onClick={() => onNavigate('notifications')} className="hover:underline text-[11px] cursor-pointer text-white/50">Email Notifications Sandbox</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Header;
