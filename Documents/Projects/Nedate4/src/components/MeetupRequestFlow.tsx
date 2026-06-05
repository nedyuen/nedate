import React, { useState, useEffect } from 'react';
import { 
  Coffee, Utensils, GlassWater, Landmark, Footprints, Gamepad2, Ticket, MoreHorizontal,
  ArrowLeft, Send, Check, Star, CheckCircle, Smartphone, Mail, User, MapPin, Calendar,
  MessageSquare, CheckSquare
} from 'lucide-react';
import { Activity, Venue } from '../types';

interface SuggestedSlot {
  id: string;
  timeString: string;
  label: string;
  date: string;
  time: string;
}

interface MeetupRequestFlowProps {
  initialActivity?: Activity;
  initialSlot?: SuggestedSlot;
  activities: Activity[];
  venues: Venue[];
  suggestedSlots: SuggestedSlot[];
  onSubmitSuccess: (refCode: string, publicToken: string) => void;
  onGoBack: () => void;
}

export function MeetupRequestFlow({
  initialActivity,
  initialSlot,
  activities,
  venues,
  suggestedSlots,
  onSubmitSuccess,
  onGoBack
}: MeetupRequestFlowProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Form states
  const [selectedActivityType, setSelectedActivityType] = useState<string>('');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [timeOption, setTimeOption] = useState<'suggested' | 'custom'>('suggested');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>('');
  const [customTime, setCustomTime] = useState<string>('');

  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [customVenue, setCustomVenue] = useState<string>('');

  // Prefill hook if initial parameters are sent
  useEffect(() => {
    if (initialActivity) {
      const bucketListCategory = "ned's bucket list";
      setSelectedActivityType(bucketListCategory);
      setSelectedActivityId(initialActivity.id);
      setSelectedVenueId(initialActivity.id); // set the selected bucket list item as active in Step 4
      
      setNotes(`i want to help tick off your bucket list (for "${initialActivity.title}")`);
      setStep(1); // Keep them on step 1 so they have to select manually
    }
  }, [initialActivity]);

  useEffect(() => {
    if (initialSlot) {
      setTimeOption('suggested');
      setSelectedSlotId(initialSlot.id);
      if (step === 1 && selectedActivityType) {
        // Stay on step 1 to let them manual confirm the prefill choice.
      }
    }
  }, [initialSlot]);

  // Pre-populate Notes based on Selected Activity Category
  useEffect(() => {
    if (selectedActivityType && !initialActivity) {
      const lower = selectedActivityType.toLowerCase();
      if (lower === 'breakfast') {
        setNotes("i want to do breakfast with you");
      } else if (lower === 'lunch') {
        setNotes("i want to do lunch with you");
      } else if (lower === 'coffee') {
        setNotes("i want to grab coffee with you");
      } else if (lower === 'dinner') {
        setNotes("i want to go for dinner with you");
      } else if (lower === 'chat') {
        setNotes("i want to have a chat with you");
      } else if (lower === 'walk') {
        setNotes("i want to go for a walk with you");
      } else if (lower === 'day trip') {
        setNotes("i want to go on a day trip with you");
      } else if (lower === "ned's bucket list") {
        setNotes("i want to help tick off your bucket list");
      } else if (lower === 'other activities') {
        setNotes("i want to do an adventure with you");
      }
    }
  }, [selectedActivityType, initialActivity]);

  // Activity type definitions
  const activityChoices = [
    { type: 'breakfast', label: 'Breakfast', icon: Coffee },
    { type: 'lunch', label: 'Lunch', icon: Utensils },
    { type: 'coffee', label: 'Coffee', icon: Coffee },
    { type: 'dinner', label: 'Dinner', icon: GlassWater },
    { type: 'chat', label: 'Chat', icon: MessageSquare },
    { type: 'walk', label: 'Walk', icon: Footprints },
    { type: 'day trip', label: 'Day Trip', icon: Landmark },
    { type: "ned's bucket list", label: "Ned's Bucket List", icon: CheckSquare },
    { type: 'other activities', label: 'Other Activities', icon: MoreHorizontal },
  ];

  const handleSelectActivityType = (type: string) => {
    setSelectedActivityType(type);
    
    // Find matching activity inspiration if any matches category name
    const match = activities.find(a => a.category.toLowerCase() === type.toLowerCase());
    if (match) {
      setSelectedActivityId(match.id);
    } else {
      setSelectedActivityId('');
    }

    if (type.toLowerCase() === "ned's bucket list") {
      const firstBucket = activities.find(a => a.category.toLowerCase() === "ned's bucket list" && a.active !== false);
      if (firstBucket) {
        setSelectedVenueId(firstBucket.id);
      } else {
        setSelectedVenueId('custom');
      }
    } else {
      const matchingVenue = venues.find(v => v.category.toLowerCase() === type.toLowerCase() && v.active !== false);
      if (matchingVenue) {
        setSelectedVenueId(matchingVenue.id);
      } else {
        setSelectedVenueId('custom');
      }
    }
    
    setTimeout(() => {
      setStep(2);
    }, 250);
  };

  // Filter venues / activities depending on selected activity key
  const recommendedOptions = selectedActivityType?.toLowerCase() === "ned's bucket list"
    ? activities.filter(a => a.category.toLowerCase() === "ned's bucket list" && a.active !== false).map(a => ({
        id: a.id,
        name: a.title,
        address: a.description,
        imageUrl: a.imageUrl,
        isActivity: true
      }))
    : venues.filter(v => v.category.toLowerCase() === selectedActivityType?.toLowerCase() && v.active !== false).map(v => ({
        id: v.id,
        name: v.name,
        address: v.address,
        imageUrl: v.imageUrl,
        isActivity: false
      }));

  // Steps validations
  const validateStep2 = () => {
    if (!name.trim()) return 'Name is required';
    if (!email.trim() || !email.includes('@')) return 'A valid email is required';
    return '';
  };

  const validateStep3 = () => {
    if (timeOption === 'suggested' && !selectedSlotId) {
      return 'Please choose one of the available suggested slots or pick a custom date';
    }
    if (timeOption === 'custom' && (!customDate || !customTime)) {
      return 'Please fill in both the custom Date and Time values';
    }
    return '';
  };

  const executeGoToStep3 = () => {
    const error = validateStep2();
    if (error) {
      setErrorMsg(error);
    } else {
      setErrorMsg('');
      setStep(3);
    }
  };

  const executeGoToStep4 = () => {
    const error = validateStep3();
    if (error) {
      setErrorMsg(error);
    } else {
      setErrorMsg('');
      setStep(4);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Build representation of requestedTime
    let finalRequestedTime = '';
    if (timeOption === 'suggested') {
      const match = suggestedSlots.find(s => s.id === selectedSlotId);
      finalRequestedTime = match ? match.label : 'Saturday Afternoon Slots';
    } else {
      const dateObj = new Date(`${customDate}T${customTime}`);
      const prettyDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      const prettyTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      finalRequestedTime = `${prettyDate} • ${prettyTime}`;
    }

    const isBucket = selectedActivityType?.toLowerCase() === "ned's bucket list";
    const payload = {
      name,
      email,
      phone,
      activityType: selectedActivityType,
      activityId: isBucket && selectedVenueId !== 'custom' ? selectedVenueId : (selectedActivityId || undefined),
      venueId: !isBucket && selectedVenueId && selectedVenueId !== 'custom' ? selectedVenueId : undefined,
      venueCustom: selectedVenueId === 'custom' ? customVenue : undefined,
      notes,
      requestedTime: finalRequestedTime
    };

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      onSubmitSuccess(data.referenceCode, data.publicToken);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Network error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Back button and progress dots */}
      <div className="flex flex-col gap-4 mb-8">
        <button 
          onClick={step > 1 ? () => setStep(step - 1) : onGoBack}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary-green select-none cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? 'Back to previous step' : 'Back to explore'}
        </button>

        {/* Beautiful wizard dots */}
        <nav className="flex flex-col gap-2 bg-white/60 p-4 rounded-2xl border border-outline-soft/10">
          <div className="flex justify-between items-center relative">
            <div className="absolute inset-x-0 top-1.5 h-0.5 bg-outline-soft/20 z-0"></div>
            {[1, 2, 3, 4].map(num => (
              <div 
                key={num}
                className={`w-3.5 h-3.5 rounded-full z-10 transition-all ${
                  step === num ? 'bg-primary-green ring-4 ring-primary-green/20 scale-110' :
                  step > num ? 'bg-accent-gold scale-100' : 'bg-outline-soft/45'
                }`}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-text-muted select-none mt-1">
            <span className={step === 1 ? 'text-primary-green font-bold' : ''}>Activity</span>
            <span className={step === 2 ? 'text-primary-green font-bold' : ''}>Details</span>
            <span className={step === 3 ? 'text-primary-green font-bold' : ''}>Time</span>
            <span className={step === 4 ? 'text-primary-green font-bold' : ''}>Venue</span>
          </div>
        </nav>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-xs mb-6 font-medium">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: ACTIVITY SELECTION */}
      {step === 1 && (
        <div className="animate-fade-in space-y-6">
          <div className="text-center md:text-left">
            <h2 className="font-serif text-2xl md:text-3xl font-black text-primary-dark">
              What would you like to do?
            </h2>
            <p className="text-sm text-text-muted mt-1 font-sans">
              Choose the vibe for your next experience with Ned.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-4">
            {activityChoices.map(choice => {
              const IconComponent = choice.icon;
              const isSelected = selectedActivityType === choice.type;
              return (
                <button
                  key={choice.type}
                  onClick={() => handleSelectActivityType(choice.type)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all h-32 cursor-pointer ${
                    isSelected ? 'bg-white border-accent-gold shadow-md ring-2 ring-accent-gold/10' : 'bg-white/80 border-outline-soft/20 text-slate-700 hover:border-outline-soft/50 hover:bg-white'
                  }`}
                >
                  <IconComponent className={`w-8 h-8 mb-2 ${isSelected ? 'text-accent-gold scale-110' : 'text-primary-green'}`} />
                  <span className="font-sans font-bold text-sm text-text-dark">{choice.label}</span>
                </button>
              );
            })}
          </div>

          {selectedActivityType && (
            <div className="animate-fade-in pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-primary-green hover:bg-primary-dark text-white rounded-full py-4 text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Continue with {activityChoices.find(c => c.type === selectedActivityType)?.label}
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: ABOUT YOU */}
      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-black text-primary-dark">
              Tell me about yourself.
            </h2>
            <p className="text-sm text-text-muted mt-1 font-sans">
              Let Ned check who is inviting him on this adventure!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/65">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-outline-soft/30 rounded-xl focus:outline-none focus:border-primary-green text-sm transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/65">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-outline-soft/30 rounded-xl focus:outline-none focus:border-primary-green text-sm transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" htmlFor="phone">
                Phone Number <span className="text-text-muted/50 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/65">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white border border-outline-soft/30 rounded-xl focus:outline-none focus:border-primary-green text-sm transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5" htmlFor="notes">
                Pitch me the date
              </label>
              <textarea
                id="notes"
                rows={4}
                placeholder="Pitch me of what we will do, see, or chat about..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-outline-soft/30 rounded-xl focus:outline-none focus:border-primary-green text-sm transition-colors resize-none shadow-sm"
              ></textarea>
            </div>
          </div>

          <button
            type="button"
            onClick={executeGoToStep3}
            className="w-full bg-primary-green text-white rounded-full py-4 font-semibold hover:bg-primary-dark transition-all shadow-md active:scale-[0.98] cursor-pointer mt-2"
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 3: CHOOSE A TIME */}
      {step === 3 && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-black text-primary-dark">
              Choose a time.
            </h2>
            <p className="text-sm text-text-muted mt-1 font-sans">
              Choose a pre-defined available slot or suggest your own.
            </p>
          </div>

          {/* Time mode selector */}
          <div className="flex rounded-xl bg-outline-soft/10 p-1 border border-outline-soft/10">
            <button
              type="button"
              onClick={() => setTimeOption('suggested')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${timeOption === 'suggested' ? 'bg-white text-primary-green shadow-sm' : 'text-text-muted'}`}
            >
              Suggested Slots
            </button>
            <button
              type="button"
              onClick={() => setTimeOption('custom')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${timeOption === 'custom' ? 'bg-white text-primary-green shadow-sm' : 'text-text-muted'}`}
            >
              Custom Suggestion
            </button>
          </div>

          {timeOption === 'suggested' ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                Available Open Slates
              </h3>
              {suggestedSlots.length === 0 ? (
                <div className="bg-white rounded-xl border border-outline-soft/25 p-4 text-center">
                  <p className="text-xs font-medium text-text-dark">No open availability soon on calendar.</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Please switch to "Custom Suggestion" to propose any custom slot!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto no-scrollbar pr-1">
                  {suggestedSlots.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border font-sans text-sm cursor-pointer transition-colors ${
                        selectedSlotId === slot.id ? 'bg-accent-light border-accent-gold text-accent-gold font-semibold' : 'bg-white border-outline-soft/20 text-slate-800 hover:border-outline-soft/55'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-accent-gold" />
                        <span>{slot.label}</span>
                      </div>
                      {selectedSlotId === slot.id && <Check className="w-4 h-4 text-accent-gold shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-outline-soft/25 rounded-2xl p-4 md:p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted">
                Propose Your Own Custom Slot
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1" htmlFor="date">
                    Desired Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-outline-soft/5 border border-outline-soft/30 rounded-xl focus:outline-none focus:border-primary-green text-sm shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1" htmlFor="time">
                    Desired Time
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={customTime}
                    onChange={e => setCustomTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-outline-soft/5 border border-outline-soft/30 rounded-xl focus:outline-none focus:border-primary-green text-sm shadow-inner"
                  />
                </div>
              </div>
              <p className="text-[10px] text-text-muted/80 leading-normal">
                Ned is open to interesting, respectful requests even if outside of standard hours! Give it a try.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={executeGoToStep4}
            className="w-full bg-primary-green text-white rounded-full py-4 font-semibold hover:bg-primary-dark transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            Next: Venue Suggestions
          </button>
        </div>
      )}

      {/* STEP 4: VENUE / ACTIVITY SUGGESTIONS */}
      {step === 4 && (
        <form onSubmit={handleFormSubmit} className="animate-fade-in space-y-6">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-black text-primary-dark">
              Venue / Activity Suggestions
            </h2>
            <p className="text-sm text-text-muted mt-1 font-sans">
              Recommended places for your "{selectedActivityType}" request.
            </p>
          </div>

          <div className="space-y-3">
            {recommendedOptions.length === 0 ? (
              <p className="text-xs text-text-muted italic">No predefined recommendations found for this category category. Please use a custom suggestion below.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto no-scrollbar">
                {recommendedOptions.map(option => {
                  const isSelected = selectedVenueId === option.id;
                  return (
                    <label key={option.id} className="relative block cursor-pointer group">
                      <input
                        type="radio"
                        name="venueOption"
                        className="peer sr-only"
                        checked={isSelected}
                        onChange={() => setSelectedVenueId(option.id)}
                      />
                      <div className="flex bg-white rounded-2xl overflow-hidden border transition-all peer-checked:border-accent-gold peer-checked:ring-2 peer-checked:ring-accent-gold/20 shadow-sm hover:shadow-md">
                        {option.imageUrl && (
                          <div className="w-24 xs:w-28 overflow-hidden shrink-0">
                            <img
                              alt={option.name}
                              src={option.imageUrl}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-sans font-bold text-sm text-primary-dark truncate capitalize leading-tight">
                              {option.name}
                            </h4>
                            {option.isActivity ? (
                              <span className="text-[9px] font-bold text-primary-green bg-primary-green/10 border border-primary-green/25 px-1.5 py-0.5 rounded uppercase">
                                Action
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-accent-gold shrink-0">
                                4.8 ★
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted truncate mt-0.5" title={option.address}>
                            {option.address}
                          </p>
                          <span className="text-[10px] text-accent-gold font-bold uppercase tracking-wider mt-1 block">
                            {option.isActivity ? "Ned's Bucket List Item" : "Ned's Recommended Spot"}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Custom venue option */}
            <label className="relative block cursor-pointer group pt-1">
              <input
                type="radio"
                name="venueOption"
                className="peer sr-only"
                checked={selectedVenueId === 'custom'}
                onChange={() => setSelectedVenueId('custom')}
              />
              <div className="bg-white rounded-2xl p-4 border transition-all peer-checked:border-accent-gold peer-checked:ring-2 peer-checked:ring-accent-gold/20 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${selectedVenueId === 'custom' ? 'border-accent-gold' : 'border-outline-soft'}`}>
                    {selectedVenueId === 'custom' && <div className="w-2 h-2 rounded-full bg-accent-gold"></div>}
                  </div>
                  <span className="font-sans font-bold text-sm text-text-dark">Or propose a custom venue/spot</span>
                </div>
                
                {selectedVenueId === 'custom' && (
                  <div className="mt-3">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/65">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. My favorite local coffee shop, or Richmond Park entrance"
                        value={customVenue}
                        onChange={e => setCustomVenue(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-outline-soft/5 border border-outline-soft/30 rounded-xl focus:outline-none focus:border-primary-green text-sm shadow-inner"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedVenueId}
            className="w-full bg-primary-green disabled:bg-primary-green/45 text-white rounded-full py-4 font-semibold hover:bg-primary-dark transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Send Request to Ned</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default MeetupRequestFlow;
