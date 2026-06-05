import React, { useState, useEffect } from 'react';
import { 
  Header, BottomNav, Footer 
} from './components/Navigation';
import { Hero } from './components/Hero';
import { ActivityInspiration } from './components/ActivityInspiration';
import { AvailabilitySection } from './components/AvailabilitySection';
import { MeetupRequestFlow } from './components/MeetupRequestFlow';
import { RequestStatusPage } from './components/RequestStatusPage';
import { AdminPanel } from './components/AdminPanel';
import { 
  Activity, Venue, MeetupRequest, AvailabilityRule, AppStateData 
} from './types';
import { Bell, Mail, ArrowLeft, Check, Compass, CalendarDays, ExternalLink } from 'lucide-react';

export default function App() {
  // Navigation states
  const [currentView, setCurrentView] = useState<string>('explore');
  const [statusToken, setStatusToken] = useState<string>('');
  
  // App data catalogs from public API
  const [activities, setActivities] = useState<Activity[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [suggestedSlots, setSuggestedSlots] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ currentlyIn: string; profilePhoto: string; slotDuration: string }>({
    currentlyIn: 'London, UK',
    profilePhoto: 'https://media.licdn.com/dms/image/v2/D4E03AQGdnQW1KbHd3g/profile-displayphoto-scale_400_400/B4EZ2254gLKYAk-/0/1776890123502?e=1782345600&v=beta&t=wgq2XRTdlQl0lAIQFBX_VNjaBRqmGpZBYOWO6b_P0nk',
    slotDuration: '120'
  });
  
  // Loading & interactive states
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Selected parameters for prefilling the checkout request flow
  const [prefilledActivity, setPrefilledActivity] = useState<Activity | undefined>(undefined);
  const [prefilledSlot, setPrefilledSlot] = useState<any | undefined>(undefined);

  // Admin session-state password credentials
  const [adminPasswordToken, setAdminPasswordToken] = useState<string>(() => {
    return localStorage.getItem('nedate_admin_token') || '';
  });

  // Client-facing simulated email view list
  const [publicEmails, setPublicEmails] = useState<any[]>([]);

  // Pull public catalog
  const loadPublicCatalog = async () => {
    try {
      const res = await fetch('/api/public-data');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities);
        setVenues(data.venues);
        setSuggestedSlots(data.suggestedSlots);
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error('Failed to retrieve active catalog lists', err);
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch client-view simulated emails (keeps guest checking convenient)
  const loadPublicEmails = async () => {
    if (!adminPasswordToken) return;
    try {
      const res = await fetch('/api/admin/emails', {
        headers: { 'X-Admin-Password': adminPasswordToken }
      });
      if (res.ok) {
        const data = await res.json();
        setPublicEmails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Check for shared direct links or ref status values on mount
  useEffect(() => {
    loadPublicCatalog();
    
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('token');
    if (ref) {
      setStatusToken(ref);
      setCurrentView('status');
    }
  }, []);

  // Sync token value in localStorage
  useEffect(() => {
    if (adminPasswordToken) {
      localStorage.setItem('nedate_admin_token', adminPasswordToken);
      loadPublicEmails();
    } else {
      localStorage.removeItem('nedate_admin_token');
    }
  }, [adminPasswordToken]);

  // Quick action: Selected Activity Inspiration Card click
  const handleSelectInspiration = (activity: Activity) => {
    setPrefilledActivity(activity);
    setPrefilledSlot(undefined);
    setCurrentView('request');
  };

  // Quick action: Selected Availability Slot card click
  const handleSelectSlot = (slot: any) => {
    setPrefilledSlot(slot);
    setPrefilledActivity(undefined);
    setCurrentView('request');
  };

  // Handle successful signup flow checkout
  const handleSubmissionSuccess = (refCode: string, publicToken: string) => {
    setStatusToken(publicToken);
    setCurrentView('success-splash');
    loadPublicCatalog(); // refresh slots and lists
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-accent-gold/20 select-none pb-20 sm:pb-0">
      
      {/* Dynamic header navigation */}
      <Header 
        currentlyIn={profile.currentlyIn}
        profilePhoto={profile.profilePhoto}
        onNavigate={(v) => {
          if (v === 'explore') {
            setPrefilledActivity(undefined);
            setPrefilledSlot(undefined);
          }
          setCurrentView(v);
        }}
        currentView={currentView}
        isAdmin={!!adminPasswordToken}
      />

      {/* Main body area */}
      <main className="flex-grow">
        {dataLoading ? (
          <div className="max-w-xl mx-auto px-4 py-24 text-center">
            <div className="w-10 h-10 border-4 border-primary-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-text-muted font-sans">Curating Nedate social club catalogs...</p>
          </div>
        ) : (
          <div className="transition-all duration-300">
            
            {/* EXPLORE (LANDING BOARD) VIEW */}
            {currentView === 'explore' && (
              <div className="space-y-6 animate-fade-in">
                {/* Hero section */}
                <Hero 
                  currentlyIn={profile.currentlyIn}
                  nedPhotoUrl={profile.profilePhoto}
                  onRequestMeetup={() => {
                    setPrefilledActivity(undefined);
                    setPrefilledSlot(undefined);
                    setCurrentView('request');
                  }}
                  onBrowseActivities={() => {
                    const el = document.getElementById('inspiration');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* Inspiration segment */}
                <div id="inspiration">
                  <ActivityInspiration 
                    activities={activities.filter(act => act.category.toLowerCase() === "ned's bucket list" && act.active !== false)}
                    onSelectActivity={handleSelectInspiration}
                  />
                </div>

                {/* Availability segment */}
                <AvailabilitySection 
                  slots={suggestedSlots}
                  onSelectSlot={handleSelectSlot}
                />
              </div>
            )}

            {/* REQUESTFlow CHCKOUT WIZARD VIEW */}
            {currentView === 'request' && (
              <div className="py-6">
                <MeetupRequestFlow 
                  initialActivity={prefilledActivity}
                  initialSlot={prefilledSlot}
                  activities={activities}
                  venues={venues}
                  suggestedSlots={suggestedSlots}
                  onGoBack={() => setCurrentView('explore')}
                  onSubmitSuccess={handleSubmissionSuccess}
                />
              </div>
            )}

            {/* REQUEST SUBMISSION SPLASH SUCCESS PAGE */}
            {currentView === 'success-splash' && (
              <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-fade-in font-sans">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <h2 className="font-serif text-3xl font-black text-primary-dark">Request Dispatched!</h2>
                  <p className="text-xs text-text-muted uppercase tracking-widest leading-normal">
                    Your social proposal code has been assigned
                  </p>
                </div>

                <div className="bg-white p-4 border border-outline-soft/25 rounded-2xl shadow-inner max-w-xs mx-auto">
                  <p className="text-[11px] text-text-muted uppercase tracking-wide">Tracking reference</p>
                  <p className="font-mono text-xl font-bold text-accent-gold mt-1 select-all hover:scale-102 transition-transform cursor-pointer">
                    NED-ACTIVE
                  </p>
                  <p className="text-[10px] text-text-muted font-normal mt-1 leading-normal">
                    Bookmark or copy this link directly anytime. A simulated verification notification is generated!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center">
                  <button
                    onClick={() => {
                      // Navigate client directly to track page using status views
                      setCurrentView('status');
                    }}
                    className="flex-1 bg-primary-green hover:bg-primary-dark text-white rounded-full py-3.5 text-xs font-bold leading-none cursor-pointer flex items-center justify-center gap-1 shadow"
                  >
                    <span>Track Request Status</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setPrefilledActivity(undefined);
                      setPrefilledSlot(undefined);
                      setCurrentView('explore');
                    }}
                    className="flex-1 border border-outline-soft/40 hover:bg-slate-50 text-text-dark rounded-full py-3.5 text-xs font-bold leading-none cursor-pointer"
                  >
                    Browse more
                  </button>
                </div>

                <p className="text-[10px] text-text-muted max-w-xs mx-auto leading-normal">
                  💡 Sandbox Tip: Tap the <strong>Bell Icon</strong> in the header navigation above to read simulated emails immediately!
                </p>
              </div>
            )}

            {/* TRACKING STATUS PAGE VIEW */}
            {currentView === 'status' && (
              <RequestStatusPage 
                publicToken={statusToken || 'tok-julian-0012'} // Fallback placeholder if empty
                onGoBack={() => setCurrentView('explore')}
              />
            )}

            {/* ADMIN LOGIN */}
            {currentView === 'admin-login' && (
              <AdminPanel 
                adminPasswordToken={adminPasswordToken}
                onSetPasswordToken={(token) => {
                  setAdminPasswordToken(token);
                  if (token) setCurrentView('admin-dashboard');
                }}
                onGoBack={() => setCurrentView('explore')}
                activitiesList={activities}
                venuesList={venues}
                suggestedSlots={suggestedSlots}
                onRefreshData={loadPublicCatalog}
              />
            )}

            {/* ADMIN CONSOLE DASHBOARD VIEW */}
            {currentView === 'admin-dashboard' && (
              <AdminPanel 
                adminPasswordToken={adminPasswordToken}
                onSetPasswordToken={(token) => {
                  setAdminPasswordToken(token);
                  if (!token) setCurrentView('explore');
                }}
                onGoBack={() => setCurrentView('explore')}
                activitiesList={activities}
                venuesList={venues}
                suggestedSlots={suggestedSlots}
                onRefreshData={loadPublicCatalog}
              />
            )}

            {/* NOTIFICATIONS CONTAINER SANDBOX LOGS */}
            {currentView === 'notifications' && (
              <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in space-y-6">
                <button 
                  onClick={() => setCurrentView('explore')}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-primary-green select-none cursor-pointer w-fit"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to explore
                </button>

                <div className="space-y-1">
                  <span className="text-xs text-accent-gold font-bold uppercase tracking-widest block font-sans">
                    Email Sandbox
                  </span>
                  <h2 className="font-serif text-3xl font-black text-primary-dark">
                    Dispatched Notification Logs
                  </h2>
                  <p className="text-xs text-text-muted leading-tight font-sans">
                    Live capture of emails generated by user checkouts, admin custom proposals, or systemic confirmations.
                  </p>
                </div>

                {publicEmails.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 border border-outline-soft/25 text-center leading-relaxed">
                    <Mail className="w-8 h-8 text-accent-gold/45 mx-auto mb-3" />
                    <p className="text-xs font-semibold text-text-dark font-sans">Simulated Inbox is empty.</p>
                    <p className="text-[11px] text-text-muted mt-0.5">Please log into the Ned Admin Console first (using default password) to activate capturing notification queues, or submit a request to see real emails appear!</p>
                  </div>
                ) : (
                  <div className="space-y-4 font-sans">
                    {publicEmails.map(log => (
                      <div key={log.id} className="bg-white border border-outline-soft/20 rounded-2xl p-5 shadow-sm space-y-2">
                        <div className="flex justify-between items-center border-b border-outline-soft/10 pb-2">
                          <span className="text-xs font-bold text-accent-gold">Recipient: {log.to}</span>
                          <span className="text-[9px] text-text-muted font-mono">{new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs font-bold text-primary-dark">Subject: {log.subject}</p>
                        <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap p-3 bg-bg-warm/35 rounded-xl border border-outline-soft/10">
                          {log.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>

      {/* Shared bottom navigation layer (mobile layout) */}
      <BottomNav 
        currentView={currentView}
        onNavigate={(v) => {
          if (v === 'explore') {
            setPrefilledActivity(undefined);
            setPrefilledSlot(undefined);
          }
          setCurrentView(v);
        }}
        isAdmin={!!adminPasswordToken}
      />

      {/* Decorative Brand Footer */}
      <Footer 
        currentlyIn={profile.currentlyIn} 
        onNavigate={setCurrentView}
      />

    </div>
  );
}
export { App };
