import { Calendar, Compass } from 'lucide-react';

interface HeroProps {
  currentlyIn: string;
  nedPhotoUrl: string;
  onRequestMeetup: () => void;
  onBrowseActivities: () => void;
}

export function Hero({ currentlyIn, nedPhotoUrl, onRequestMeetup, onBrowseActivities }: HeroProps) {
  return (
    <section className="py-8 md:py-12 flex flex-col md:flex-row gap-8 items-center max-w-4xl mx-auto px-4">
      {/* Text column */}
      <div className="w-full md:w-1/2 order-2 md:order-1 flex flex-col items-start gap-5">
        <h1 className="font-serif text-4xl md:text-5xl font-black text-primary-dark leading-tight tracking-tight">
          Hang out with Ned.
        </h1>
        <p className="font-sans text-base md:text-lg text-text-muted leading-relaxed">
          Want to grab dinner, visit a theme park, try a new restaurant, or do something interesting together? Send me a request.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
          <button 
            onClick={onRequestMeetup}
            className="w-full sm:w-auto bg-primary-green text-white rounded-full px-8 py-4 font-semibold hover:bg-primary-dark shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            Request a Meetup
          </button>
          <button 
            onClick={onBrowseActivities}
            className="w-full sm:w-auto border-2 border-accent-gold text-accent-gold hover:bg-accent-gold/5 rounded-full px-8 py-4 font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Browse Activities
          </button>
        </div>
      </div>

      {/* Picture column */}
      <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center">
        <div className="aspect-[4/5] w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white transform hover:rotate-1 transition-transform duration-300">
          <img 
            alt="Ned laughing at coffee cafe house" 
            src={nedPhotoUrl} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Subtle bottom shadow overlay to ensure typography readability */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Currently located badge */}
          <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-accent-gold/20 shadow-md">
            <span className="text-[9px] text-accent-gold font-bold uppercase tracking-widest block leading-3">
              Currently In
            </span>
            <span className="font-serif text-lg font-bold text-primary-dark leading-tight block">
              {currentlyIn}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
