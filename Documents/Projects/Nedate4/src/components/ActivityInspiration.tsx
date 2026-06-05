import { Sparkles, ArrowRight } from 'lucide-react';
import { Activity } from '../types';

interface ActivityInspirationProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
}

export function ActivityInspiration({ activities, onSelectActivity }: ActivityInspirationProps) {
  // Sort activities so that we try to recreate the asymmetric grid layout
  // based on the IDs act-1, act-2, etc. If admin adds more, they append dynamically.
  const mainActivity = activities.find(a => a.id === 'act-1') || activities[0];
  const secActivity1 = activities.find(a => a.id === 'act-2') || activities[1];
  const secActivity2 = activities.find(a => a.id === 'act-3') || activities[2];
  const panoramaActivity = activities.find(a => a.id === 'act-4') || activities[3];

  // Remaining list items (to display additional admin-added activities cleanly as standard bento blocks)
  const knownIds = [mainActivity?.id, secActivity1?.id, secActivity2?.id, panoramaActivity?.id].filter(Boolean);
  const additionalActivities = activities.filter(a => !knownIds.includes(a.id));

  return (
    <section className="py-12 bg-[#F3EFE4]/60 border-y border-outline-soft/40 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-dark tracking-tight">
              Activity Inspiration
            </h2>
            <p className="text-xs text-text-muted mt-1 font-medium font-sans">
              Needs inspirations? Here is Ned's bucket list of things he has been wanting to do
            </p>
          </div>
          <div className="bg-accent-gold/10 p-2 rounded-full text-accent-gold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Asymmetric Bento-style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Card 1: Main (Sunset Rollercoaster / Thorpe Park) */}
          {mainActivity && (
            <div 
              onClick={() => onSelectActivity(mainActivity)}
              className="col-span-2 md:col-span-2 group cursor-pointer"
            >
              <div className="aspect-[16/9] relative rounded-2xl overflow-hidden shadow-md border border-outline-soft/10 group-hover:shadow-lg transition-transform duration-300">
                <img 
                  alt={mainActivity.title} 
                  src={mainActivity.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-0.5 bg-accent-gold/25 backdrop-blur-md rounded-full text-[9px] text-white font-bold mb-1 border border-white/20 uppercase tracking-widest font-sans">
                    {mainActivity.category}
                  </span>
                  <p className="text-white font-serif text-xl md:text-2xl font-bold leading-tight flex items-center gap-1.5 group-hover:text-accent-gold transition-colors">
                    {mainActivity.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </p>
                  <p className="text-white/70 text-xs mt-1 max-w-sm line-clamp-2 md:block hidden">
                    {mainActivity.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Medium Portrait (BBQ wagyu meat sizzling) */}
          {secActivity1 && (
            <div 
              onClick={() => onSelectActivity(secActivity1)}
              className="col-span-1 md:col-span-1 group cursor-pointer"
            >
              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-md border border-outline-soft/10 group-hover:shadow-lg transition-transform duration-300">
                <img 
                  alt={secActivity1.title} 
                  src={secActivity1.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-0.5 bg-accent-gold/25 backdrop-blur-md rounded-full text-[9px] text-white font-bold mb-1 border border-white/20 uppercase tracking-widest font-sans">
                    {secActivity1.category}
                  </span>
                  <p className="text-white font-serif text-lg font-bold leading-tight group-hover:text-accent-gold transition-colors flex items-center gap-1">
                    {secActivity1.title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Medium Portrait (Board games candle lights) */}
          {secActivity2 && (
            <div 
              onClick={() => onSelectActivity(secActivity2)}
              className="col-span-1 md:col-span-1 group cursor-pointer"
            >
              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-md border border-outline-soft/10 group-hover:shadow-lg transition-transform duration-300">
                <img 
                  alt={secActivity2.title} 
                  src={secActivity2.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-0.5 bg-accent-gold/25 backdrop-blur-md rounded-full text-[9px] text-white font-bold mb-1 border border-white/20 uppercase tracking-widest font-sans">
                    {secActivity2.category}
                  </span>
                  <p className="text-white font-serif text-lg font-bold leading-tight group-hover:text-accent-gold transition-colors flex items-center gap-1">
                    {secActivity2.title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Wide Panoramic (Misty Hills Richmond Park walk) */}
          {panoramaActivity && (
            <div 
              onClick={() => onSelectActivity(panoramaActivity)}
              className="col-span-2 md:col-span-4 group cursor-pointer"
            >
              <div className="aspect-[21/9] relative rounded-2xl overflow-hidden shadow-md border border-outline-soft/10 group-hover:shadow-lg transition-transform duration-300">
                <img 
                  alt={panoramaActivity.title} 
                  src={panoramaActivity.imageUrl} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/95 via-primary-dark/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <span className="inline-block px-3 py-0.5 bg-accent-gold/25 backdrop-blur-md rounded-full text-[9px] text-white font-bold mb-1 border border-white/20 uppercase tracking-widest font-sans">
                      {panoramaActivity.category}
                    </span>
                    <p className="text-white font-serif text-xl md:text-2xl font-bold leading-tight group-hover:text-accent-gold transition-colors flex items-center gap-1.5">
                      {panoramaActivity.title}
                    </p>
                    <p className="text-white/70 text-xs mt-1 md:block hidden max-w-xl">
                      {panoramaActivity.description}
                    </p>
                  </div>
                  <span className="text-white/60 text-xs hidden sm:flex items-center gap-1 hover:text-white transition-colors">
                    Click to Prefill <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Dynamic additionals (for customized admin-created ones outside of bento layout) */}
        {additionalActivities.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs text-text-muted font-bold uppercase tracking-widest mb-3 font-sans">
              More Ideas Added By Ned
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {additionalActivities.map(activity => (
                <div 
                  key={activity.id}
                  onClick={() => onSelectActivity(activity)}
                  className="bg-white rounded-2xl overflow-hidden border border-outline-soft/20 flex flex-row p-3 gap-3 cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      alt={activity.title}
                      src={activity.imageUrl}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <span className="text-[10px] text-accent-gold font-bold uppercase tracking-wider">
                      {activity.category}
                    </span>
                    <h4 className="font-serif font-bold text-base text-primary-dark group-hover:text-accent-gold transition-colors truncate">
                      {activity.title}
                    </h4>
                    <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ActivityInspiration;
