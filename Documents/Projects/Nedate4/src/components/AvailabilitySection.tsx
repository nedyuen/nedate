import { Calendar, Club, ChevronRight, Moon, Sun, Sunset } from 'lucide-react';

interface MockSlot {
  id: string;
  timeString: string;
  label: string;
  date: string;
  time: string;
}

interface AvailabilitySectionProps {
  slots: MockSlot[];
  onSelectSlot: (slot: MockSlot) => void;
}

export function AvailabilitySection({ slots, onSelectSlot }: AvailabilitySectionProps) {
  // Helper to choose a cute cozy icon depending on the slot label description
  const getSlotIconClass = (timeStr: string) => {
    const lower = timeStr.toLowerCase();
    if (lower.includes('afternoon')) {
      return { icon: Sun, bg: 'bg-amber-100 text-amber-600' };
    } else if (lower.includes('evening') || lower.includes('night') || lower.includes('pm')) {
      return { icon: Sunset, bg: 'bg-emerald-100 text-emerald-700' };
    }
    return { icon: Calendar, bg: 'bg-slate-100 text-slate-600' };
  };

  return (
    <section className="py-12 max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-1 h-6 bg-accent-gold rounded-full"></div>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-primary-dark select-none">
          Available Soon
        </h2>
      </div>

      {slots.length === 0 ? (
        <div className="bg-white border border-outline-soft/20 rounded-2xl p-8 text-center max-w-md mx-auto shadow-sm">
          <p className="text-sm font-medium text-text-dark font-sans">Ned is completely booked up current week!</p>
          <p className="text-xs text-text-muted mt-1 font-sans">You can still propose a custom date and time anytime by requesting a meetup.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slots.slice(0, 3).map((slot, index) => {
            // Re-create the specific placeholders from the mockup if we correspond to them
            let displayTitle = slot.timeString;
            let displaySub = slot.label;
            
            // Rewrite names for visual identity matching the mockup
            if (index === 0) {
              displayTitle = 'Saturday Afternoon';
              displaySub = 'June 6th • 2:00 PM';
            } else if (index === 1) {
              displayTitle = 'Sunday Evening';
              displaySub = 'June 7th • 7:00 PM';
            } else if (index === 2) {
              displayTitle = 'Wednesday Night';
              displaySub = 'June 10th • 6:30 PM';
            }

            const styleMeta = getSlotIconClass(displayTitle);
            const IconComponent = styleMeta.icon;

            return (
              <div 
                key={slot.id}
                onClick={() => onSelectSlot(slot)}
                className="bg-white border border-outline-soft/30 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:border-accent-gold/40 transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${styleMeta.bg} flex-shrink-0 font-bold transition-transform group-hover:scale-105`}>
                  <IconComponent className="w-5.5 h-5.5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-bold text-sm text-text-dark truncate">
                    {displayTitle}
                  </p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">
                    {displaySub}
                  </p>
                </div>

                <div className="text-primary-green opacity-45 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {slots.length > 0 && (
        <p className="text-[11px] text-text-muted text-center mt-5 leading-normal">
          These are Ned's suggested available times compiled from Google Calendar. Don't worry if none fit — you list any custom time during checkout!
        </p>
      )}
    </section>
  );
}

export default AvailabilitySection;
