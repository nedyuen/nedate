import React, { useState, useEffect } from 'react';
import { 
  Key, Calendar, CheckSquare, Clock, Users, ArrowRight, Star, Plus,
  Trash2, ToggleLeft, ToggleRight, Check, X, ShieldCheck, Landmark,
  MapPin, Coffee, Utensils, MessageSquare, Send, Settings, UserMinus, PlusCircle, Link, Mail
} from 'lucide-react';
import { 
  MeetupRequest, RequestComment, Activity, Venue, 
  TrustedEmail, AvailabilityRule, SystemSettings 
} from '../types';

interface AdminPanelProps {
  adminPasswordToken: string;
  onSetPasswordToken: (token: string) => void;
  onGoBack: () => void;
  activitiesList: Activity[];
  venuesList: Venue[];
  suggestedSlots: any[];
  onRefreshData: () => void;
}

export function AdminPanel({
  adminPasswordToken,
  onSetPasswordToken,
  onGoBack,
  activitiesList,
  venuesList,
  suggestedSlots,
  onRefreshData
}: AdminPanelProps) {
  // Login phase
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);

  // Authenticated state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'curations' | 'trusted' | 'settings'>('requests');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Filtering and searching requests
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Selected request for detail drawer
  const [selectedRequest, setSelectedRequest] = useState<MeetupRequest | null>(null);
  const [selectedRequestComments, setSelectedRequestComments] = useState<RequestComment[]>([]);
  const [adminCommentInput, setAdminCommentInput] = useState<string>('');
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  
  // Admin detailed actions
  const [showAltForm, setShowAltForm] = useState<boolean>(false);
  const [altTimeText, setAltTimeText] = useState<string>('');
  const [altCommentText, setAltCommentText] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Email simulation logs
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // Editing curation form state
  const [editingCuration, setEditingCuration] = useState<any>(null);
  
  // Custom additions inputs
  const [newTrustedEmail, setNewTrustedEmail] = useState<string>('');
  const [newTrustedNotes, setNewTrustedNotes] = useState<string>('');

  // Settings inputs
  const [currentlyIn, setCurrentlyIn] = useState<string>('');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [settingsStatusMsg, setSettingsStatusMsg] = useState<string>('');

  // Load dashboard dataset
  const fetchDashboard = async () => {
    if (!adminPasswordToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard', {
        headers: {
          'X-Admin-Password': adminPasswordToken
        }
      });
      if (!res.ok) {
        // Token must be expired or invalid
        onSetPasswordToken('');
        throw new Error('Unauthorized credentials');
      }
      const data = await res.json();
      setDashboardData(data);
      
      // Auto pre-populate settings fields
      if (data.settings) {
        setCurrentlyIn(data.settings.currentlyIn);
        setProfilePhoto(data.settings.profilePhoto);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch simulated email logs
  const fetchEmailLogs = async () => {
    try {
      const res = await fetch('/api/admin/emails', {
        headers: {
          'X-Admin-Password': adminPasswordToken
        }
      });
      if (res.ok) {
        const logs = await res.json();
        setEmailLogs(logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (adminPasswordToken) {
      fetchDashboard();
      fetchEmailLogs();
    }
  }, [adminPasswordToken]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }
      onSetPasswordToken(passwordInput);
    } catch (err: any) {
      setLoginError(err.message || 'Error occurred');
    } finally {
      setLoginLoading(false);
    }
  };

  // Logged-out screen
  if (!adminPasswordToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border border-outline-soft/20 shadow-md text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 text-accent-gold flex items-center justify-center mx-auto text-xl">
            <Key className="w-6 h-6 animate-pulse" />
          </div>
          
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-primary-dark">Ned Private Access</h2>
            <p className="text-xs text-text-muted font-sans uppercase tracking-widest leading-normal">
              Enter your secure administrator password
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1.5" htmlFor="adminpass">
                Password credentials
              </label>
              <input
                id="adminpass"
                type="password"
                placeholder="••••••••"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 bg-bg-warm/30 border border-outline-soft/30 rounded-xl focus:outline-none focus:border-primary-green text-sm shadow-inner"
              />
            </div>

            {loginError && (
              <div className="text-red-600 text-xs font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary-green text-white rounded-full py-3 text-xs font-bold hover:bg-primary-dark shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer font-sans"
            >
              {loginLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Unlock Admin Dashboard'
              )}
            </button>
          </form>
          
          <p className="text-[10px] text-text-muted leading-tight font-sans">
            Note: The default secure local test password is: <span className="font-semibold text-text-dark select-all font-mono">nedatepassword2026</span>
          </p>
        </div>
      </div>
    );
  }

  if (loading || !dashboardData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-text-muted font-sans">Mapping administrator datalogs...</p>
      </div>
    );
  }

  // Dashboard Stats calculations
  const totalRequestsCount = dashboardData.requests.length;
  const pendingRequests = dashboardData.requests.filter((r: any) => r.status === 'Pending');
  const approvedRequests = dashboardData.requests.filter((r: any) => r.status === 'Approved');
  const completedRequests = dashboardData.requests.filter((r: any) => r.status === 'Completed');
  // Upcoming is Approved and scheduled in future (or simply approved ones for prototype simplicity)
  const upcomingCount = approvedRequests.length;

  // Filter requests table list
  const filteredRequestsList = dashboardData.requests.filter((r: any) => {
    // Search filter
    const matchesSearch = 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.activityType.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle detailed request selection
  const handleSelectRequest = (req: MeetupRequest) => {
    setSelectedRequest(req);
    setSelectedRequestComments(dashboardData.commentsMap[req.id] || []);
    setShowAltForm(false);
    setAltTimeText('');
    setAltCommentText('');
  };

  // Submit admin comment details
  const handleAdminCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCommentInput.trim() || !selectedRequest) return;
    setCommentSubmitting(true);

    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPasswordToken
        },
        body: JSON.stringify({
          authorType: 'Admin',
          message: adminCommentInput
        })
      });

      if (!res.ok) throw new Error('Failed to post message comment');
      const newComment = await res.json();
      
      setSelectedRequestComments(prev => [...prev, newComment]);
      setAdminCommentInput('');
      fetchDashboard(); // reload statistics and lists
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Admin Request status update (Approve, Reject, or Suggest Alternative)
  const handleRequestAction = async (action: 'approve' | 'reject' | 'suggest_alternative' | 'complete', messageToClient?: string) => {
    if (!selectedRequest) return;
    setActionLoading(true);

    const payload: any = { action };
    if (action === 'suggest_alternative') {
      payload.alternativeTime = altTimeText;
      payload.alternativeComment = altCommentText;
    }
    if (messageToClient) {
      payload.message = messageToClient;
    }

    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPasswordToken
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to execute request action');
      const data = await res.json();
      
      // Update local states
      const updatedReq = data.request;
      setSelectedRequest(updatedReq);
      fetchDashboard();
      fetchEmailLogs();
      setShowAltForm(false);
      alert(`Request has been successfully marked as: ${updatedReq.status}`);
    } catch (err: any) {
      alert(err.message || 'Error executing client update status action');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Trusted email
  const handleAddTrustedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrustedEmail.trim()) return;

    try {
      const res = await fetch('/api/admin/trusted', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPasswordToken
        },
        body: JSON.stringify({ email: newTrustedEmail, notes: newTrustedNotes })
      });
      if (!res.ok) throw new Error('Failed to add trusted email');
      setNewTrustedEmail('');
      setNewTrustedNotes('');
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  };

  // Delete Trusted email
  const handleDeleteTrustedEmail = async (id: string) => {
    if (!window.confirm('Remove from auto-approve trusted email logs?')) return;
    try {
      const res = await fetch(`/api/admin/trusted/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPasswordToken
        }
      });
      if (!res.ok) throw new Error('Failed to remove');
      fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  };

  // Save Curation (unified handler)
  const handleSaveCuration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCuration || !editingCuration.name) return;

    const isBucket = editingCuration.category.toLowerCase() === "ned's bucket list";
    const endpoint = isBucket ? '/api/admin/activities' : '/api/admin/venues';
    const payload = isBucket
      ? {
          id: editingCuration.id,
          title: editingCuration.name,
          category: editingCuration.category,
          description: editingCuration.detail || '',
          imageUrl: editingCuration.imageUrl || '',
          active: editingCuration.active !== false
        }
      : {
          id: editingCuration.id,
          name: editingCuration.name,
          category: editingCuration.category,
          address: editingCuration.detail || '',
          imageUrl: editingCuration.imageUrl || '',
          active: editingCuration.active !== false
        };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPasswordToken
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to save curated option');
      setEditingCuration(null);
      fetchDashboard();
      onRefreshData(); // refresh public list
    } catch (err: any) {
      alert(err.message || 'Error saving curation');
    }
  };

  // Save general Settings info
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsStatusMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPasswordToken
        },
        body: JSON.stringify({
          currentlyIn,
          profilePhoto,
          adminPassword: newAdminPassword || undefined
        })
      });
      if (!res.ok) throw new Error('Failed to update Settings entries');
      setSettingsStatusMsg('Settings updated successfully!');
      if (newAdminPassword) {
        onSetPasswordToken(newAdminPassword);
        setNewAdminPassword('');
      }
      fetchDashboard();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-8 font-sans">
      
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-5 rounded-3xl border border-outline-soft/20 shadow-sm gap-4">
        <div>
          <h2 className="font-serif text-2xl font-black text-primary-dark">
            Ned's Private Host Suite
          </h2>
          <p className="text-xs text-text-muted leading-tight font-sans mt-0.5">
            Admin console for approvals, trusted automated rules, and experience curation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onGoBack} 
            className="px-4 py-2 text-xs border border-outline-soft/40 hover:bg-bg-warm font-semibold text-text-dark rounded-full cursor-pointer font-sans"
          >
            Exit Console
          </button>
          <button 
            type="button"
            onClick={() => onSetPasswordToken('')} 
            className="px-4 py-2 text-xs text-red-600 bg-red-50 hover:bg-red-100 font-semibold rounded-full cursor-pointer font-sans"
          >
            Lock Dashboard
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-outline-soft/15 shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></span>
            <span className="font-serif text-2xl font-bold text-primary-dark">{pendingRequests.length}</span>
          </div>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block mt-2 font-sans">Pending Review</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-soft/15 border-l-4 border-l-primary-green shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckSquare className="w-4 h-4" /></span>
            <span className="font-serif text-2xl font-bold text-primary-dark">{approvedRequests.length}</span>
          </div>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block mt-2 font-sans">Approved Dates</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-soft/15 shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-sky-50 text-sky-600 rounded-lg"><Calendar className="w-4 h-4" /></span>
            <span className="font-serif text-2xl font-bold text-primary-dark">{upcomingCount}</span>
          </div>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block mt-2 font-sans">Upcoming Slates</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-outline-soft/15 shadow-sm flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users className="w-4 h-4" /></span>
            <span className="font-serif text-2xl font-bold text-primary-dark">{completedRequests.length}</span>
          </div>
          <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block mt-2 font-sans">Completed adventures</span>
        </div>
      </section>

      {/* Admin tabs */}
      <div className="flex rounded-xl bg-white p-1.5 border border-outline-soft/15 shadow-sm overflow-x-auto no-scrollbar">
        {[
          { id: 'requests', label: 'Requests', count: pendingRequests.length },
          { id: 'curations', label: 'Events/Venues List' },
          { id: 'trusted', label: 'Auto-Approvals' },
          { id: 'settings', label: 'Profile Settings' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSelectedRequest(null); }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === tab.id ? 'bg-primary-green text-white shadow-sm' : 'text-text-muted hover:text-text-dark'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === tab.id ? 'bg-white text-primary-green' : 'bg-red-500 text-white'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* LEFT: Requests Interactive Table List */}
          <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-outline-soft/20 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="font-serif text-lg font-bold text-primary-dark">
                Requested Activities Logs
              </h3>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search guest or activity..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 bg-outline-soft/5 border border-outline-soft/20 rounded-lg text-xs leading-none focus:outline-none focus:border-accent-gold w-full sm:w-36 shadow-inner"
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-2 py-1.5 bg-outline-soft/5 border border-outline-soft/20 rounded-lg text-xs leading-none text-text-dark"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Alternative Proposed">Proposed</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {filteredRequestsList.length === 0 ? (
              <p className="text-xs text-text-muted italic py-6 text-center">No matching meetup requests matched filters.</p>
            ) : (
              <div className="border border-outline-soft/10 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-bg-warm/35 border-b border-outline-soft/15 font-bold uppercase tracking-wider text-text-muted">
                      <th className="p-3">Reference</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Activity</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-soft/10">
                    {filteredRequestsList.map((req: any) => (
                      <tr 
                        key={req.id} 
                        onClick={() => handleSelectRequest(req)}
                        className={`hover:bg-bg-warm/25 cursor-pointer transition-colors ${selectedRequest?.id === req.id ? 'bg-accent-light/40 font-medium' : ''}`}
                      >
                        <td className="p-3 font-mono font-bold text-accent-gold">{req.referenceCode}</td>
                        <td className="p-3">
                          <p className="font-bold text-text-dark">{req.name}</p>
                          <p className="text-[10px] text-text-muted truncate max-w-[110px]">{req.email}</p>
                        </td>
                        <td className="p-3 capitalize">{req.activityType}</td>
                        <td className="p-3 text-text-muted">{req.requestedTime}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            req.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200 font-extrabold' :
                            req.status === 'Alternative Proposed' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                            req.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {req.status === 'Alternative Proposed' ? 'Alt Proposed' : req.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* RIGHT: Selected Request Detail Action Console */}
          <div className="bg-white rounded-3xl p-5 border border-outline-soft/20 shadow-sm space-y-5">
            {selectedRequest ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-outline-soft/15 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-accent-gold font-bold uppercase">{selectedRequest.referenceCode}</span>
                    <h3 className="font-serif text-lg font-bold text-primary-dark mt-0.5">{selectedRequest.name}</h3>
                  </div>
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 border rounded-full uppercase tracking-wider ${
                    selectedRequest.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>

                {/* Details box */}
                <div className="space-y-3 font-sans text-xs border-b border-outline-soft/10 pb-4">
                  <div>
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Email Contact</span>
                    <span className="text-text-dark font-medium select-all">{selectedRequest.email}</span>
                  </div>
                  {selectedRequest.phone && (
                    <div>
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Phone Contact</span>
                      <span className="text-text-dark font-medium select-all">{selectedRequest.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Activity notes</span>
                    <p className="text-text-muted bg-outline-soft/5 border border-outline-soft/10 p-2.5 rounded-xl text-[11px] whitespace-pre-wrap leading-relaxed">
                      {selectedRequest.notes || 'No comments left.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Event time slot</span>
                    <span className="text-primary-green font-bold block bg-primary-green/5 py-1 px-2.5 border border-primary-green/10 rounded-lg w-fit mt-1 text-[11px]">
                      {selectedRequest.approvedTime || selectedRequest.requestedTime}
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[9px] text-accent-gold font-bold uppercase block tracking-wider">Access Token Tracking Link</span>
                    <div className="flex gap-1.5 items-center mt-1">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}/?ref=${selectedRequest.publicToken}`} 
                        className="p-1 px-2 bg-slate-50 border border-slate-200 rounded text-[10px] flex-1 select-all"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${selectedRequest.publicToken}`);
                          alert('Copied status tracking URL for guest safely!');
                        }}
                        className="bg-slate-100 border border-slate-300 p-1 rounded text-text-dark cursor-pointer text-[10px] font-bold"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action zone */}
                <div className="space-y-2 border-b border-outline-soft/10 pb-4">
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Admin Actions</span>
                  
                  {selectedRequest.status === 'Pending' && (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestAction('approve')}
                          disabled={actionLoading}
                          className="flex-1 bg-primary-green text-white py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer"
                        >
                          Approve Slot
                        </button>
                        <button
                          onClick={() => handleRequestAction('reject')}
                          disabled={actionLoading}
                          className="flex-1 bg-red-100 text-red-700 py-2.5 rounded-full text-xs font-bold hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                      
                      <button
                        onClick={() => setShowAltForm(!showAltForm)}
                        className="w-full bg-slate-100 border border-slate-300 text-text-dark text-xs font-bold py-2.5 rounded-full cursor-pointer hover:bg-slate-200"
                      >
                        Propose Alternative Date
                      </button>
                    </div>
                  )}

                  {selectedRequest.status === 'Approved' && (
                    <button
                      onClick={() => handleRequestAction('complete')}
                      disabled={actionLoading}
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                    >
                      Mark Activity Completed
                    </button>
                  )}

                  {selectedRequest.status === 'Alternative Proposed' && (
                    <div className="space-y-1 bg-sky-50 border border-sky-100 p-3 rounded-2xl text-[11px]">
                      <p className="font-bold text-sky-800">Alternative Proposed</p>
                      <p className="text-text-muted">Propose text: {selectedRequest.alternativeTime}</p>
                      <p className="text-text-muted mt-1 leading-normal italic">&ldquo;{selectedRequest.alternativeComment}&rdquo;</p>
                    </div>
                  )}

                  {showAltForm && (
                    <div className="bg-bg-warm/35 border border-accent-gold/25 p-4 rounded-2xl mt-2 space-y-3 font-sans text-xs animate-fade-in">
                      <p className="font-bold text-primary-dark">Suggest Alternative Time</p>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Proposed Slot Description</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Sunday 3:00 PM"
                            value={altTimeText}
                            onChange={e => setAltTimeText(e.target.value)}
                            className="w-full p-2 bg-white border border-outline-soft/30 rounded-lg focus:outline-none focus:border-accent-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-text-muted uppercase tracking-wider mb-1">Comment explanation to User</label>
                          <textarea 
                            rows={3}
                            placeholder="e.g. Saturday afternoon is fully busy. Can we explore Sunday instead?"
                            value={altCommentText}
                            onChange={e => setAltCommentText(e.target.value)}
                            className="w-full p-2 bg-white border border-outline-soft/30 rounded-lg focus:outline-none focus:border-accent-gold resize-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRequestAction('suggest_alternative')}
                          disabled={actionLoading || !altTimeText.trim()}
                          className="w-full bg-accent-gold text-white text-xs font-bold py-2.5 rounded-full cursor-pointer hover:bg-yellow-600"
                        >
                          Send Alternative Proposal
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Inline discussions timeline */}
                <div className="space-y-3">
                  <h4 className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Comment Thread</h4>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2.5 pr-1 text-[11px] no-scrollbar">
                    {selectedRequestComments.map(comment => {
                      const isSystem = comment.authorType === 'System';
                      const isNed = comment.authorType === 'Admin';
                      return (
                        <div key={comment.id} className="p-2 border border-outline-soft/10 bg-slate-50 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-text-muted">
                            <span className={`font-bold ${isNed ? 'text-primary-green' : 'text-slate-600'}`}>{isNed ? 'Ned' : isSystem ? 'System State' : selectedRequest.name}</span>
                            <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-text-dark font-sans leading-normal">{comment.message}</p>
                        </div>
                      );
                    })}
                  </div>

                  <form onSubmit={handleAdminCommentSubmit} className="flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Comment back to user..."
                      value={adminCommentInput}
                      onChange={e => setAdminCommentInput(e.target.value)}
                      disabled={commentSubmitting}
                      className="flex-1 px-3 py-1.5 bg-outline-soft/5 border border-outline-soft/20 rounded-full text-xs focus:outline-none focus:border-accent-gold"
                    />
                    <button
                      type="submit"
                      disabled={commentSubmitting || !adminCommentInput.trim()}
                      className="bg-primary-green text-white p-2 rounded-full cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-text-muted text-xs leading-relaxed max-w-xs mx-auto">
                <Users className="w-8 h-8 text-accent-gold/45 mb-3 mx-auto" />
                <p>Click any row on the left table list to inspect request parameters and schedule dates.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CURATIONS MANAGER TAB */}
      {activeTab === 'curations' && (
        <div className="bg-white rounded-3xl p-6 border border-outline-soft/20 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-outline-soft/15 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-primary-dark">Curation Directory</h3>
              <p className="text-xs text-text-muted">
                Manage suggested activities for "Ned's Bucket List" and recommended venues for other categories.
              </p>
            </div>
            {!editingCuration && (
              <button
                onClick={() => setEditingCuration({ name: '', category: 'coffee', detail: '', imageUrl: '', active: true })}
                className="bg-primary-green text-white px-4 py-2 text-xs font-bold rounded-full cursor-pointer flex items-center gap-1.5 hover:bg-primary-dark transition-all"
              >
                <Plus className="w-4 h-4" /> Add Curated Item
              </button>
            )}
          </div>

          {editingCuration && (
            <form onSubmit={handleSaveCuration} className="bg-bg-warm/35 border border-accent-gold/20 p-5 rounded-3xl space-y-4 text-xs font-sans">
              <h4 className="font-bold text-sm text-primary-dark font-serif">
                {editingCuration.id ? 'Edit Curated Item' : 'Create New Curated Item'}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-text-muted mb-1 font-sans">Activity Category *</label>
                  <select
                    value={editingCuration.category || 'coffee'}
                    onChange={e => setEditingCuration({ ...editingCuration, category: e.target.value })}
                    className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl font-sans"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="coffee">Coffee</option>
                    <option value="dinner">Dinner</option>
                    <option value="chat">Chat</option>
                    <option value="walk">Walk</option>
                    <option value="day trip">Day Trip</option>
                    <option value="ned's bucket list">Ned's Bucket List</option>
                    <option value="other activities">Other Activities</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-text-muted mb-1 font-sans">
                    {editingCuration.category?.toLowerCase() === "ned's bucket list" ? 'Bucket List Idea / Activity Name *' : 'Venue / Spot Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={editingCuration.category?.toLowerCase() === "ned's bucket list" ? 'e.g. Thorpe Park Rollercoaster Day' : 'e.g. Caravan Fitzrovia'}
                    value={editingCuration.name || ''}
                    onChange={e => setEditingCuration({ ...editingCuration, name: e.target.value })}
                    className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text-muted mb-1 font-sans">
                  {editingCuration.category?.toLowerCase() === "ned's bucket list" ? 'Describe the experience / activity detail' : 'Spot Address or Note description'}
                </label>
                <input
                  type="text"
                  placeholder={editingCuration.category?.toLowerCase() === "ned's bucket list" ? 'Tell potential dates what exciting highlights this adventure carries!' : 'e.g. 5 Plough Pl, London EC4A 1DE, United Kingdom'}
                  value={editingCuration.detail || ''}
                  onChange={e => setEditingCuration({ ...editingCuration, detail: e.target.value })}
                  className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-text-muted mb-1 font-sans">Image URL (hotlink address)</label>
                <input
                  type="text"
                  placeholder="Insert image hotlink address"
                  value={editingCuration.imageUrl || ''}
                  onChange={e => setEditingCuration({ ...editingCuration, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl font-sans"
                />
              </div>

              <div className="flex justify-between items-center pt-2 font-sans">
                <label className="flex items-center gap-2 cursor-pointer font-sans">
                  <input
                    type="checkbox"
                    checked={editingCuration.active !== false}
                    onChange={e => setEditingCuration({ ...editingCuration, active: e.target.checked })}
                    className="rounded border-outline-soft text-primary-green focus:ring-primary-green"
                  />
                  <span className="font-bold text-text-dark font-sans select-none">Active suggestion enabled</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCuration(null)}
                    className="px-4 py-2 border border-outline-soft/30 rounded-full font-bold hover:bg-bg-warm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-green text-white font-bold rounded-full cursor-pointer hover:bg-primary-dark transition-all"
                  >
                    Save Curated Option
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-6 font-sans">
            {[
              { value: 'breakfast', label: 'Breakfast' },
              { value: 'lunch', label: 'Lunch' },
              { value: 'coffee', label: 'Coffee' },
              { value: 'dinner', label: 'Dinner' },
              { value: 'chat', label: 'Chat' },
              { value: 'walk', label: 'Walk' },
              { value: 'day trip', label: 'Day Trip' },
              { value: "ned's bucket list", label: "Ned's Bucket List" },
              { value: 'other activities', label: 'Other Activities' }
            ].map(cat => {
              // Extract items falling under this category
              const items: any[] = [];
              
              if (dashboardData?.activities) {
                dashboardData.activities
                  .filter((a: any) => a.category?.toLowerCase() === cat.value)
                  .forEach((act: any) => {
                    items.push({
                      id: act.id,
                      sourceType: 'activity',
                      category: act.category,
                      name: act.title,
                      detail: act.description,
                      imageUrl: act.imageUrl,
                      active: act.active !== false,
                      raw: act
                    });
                  });
              }

              if (dashboardData?.venues) {
                dashboardData.venues
                  .filter((v: any) => v.category?.toLowerCase() === cat.value)
                  .forEach((ven: any) => {
                    items.push({
                      id: ven.id,
                      sourceType: 'venue',
                      category: ven.category,
                      name: ven.name,
                      detail: ven.address,
                      imageUrl: ven.imageUrl,
                      active: ven.active !== false,
                      raw: ven
                    });
                  });
              }

              if (items.length === 0) return null;

              return (
                <div key={cat.value} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#B08968] border-b border-outline-soft/10 pb-1.5 pt-2 font-serif font-sans">
                    {cat.label} {cat.value === "ned's bucket list" ? "Suggested Activities" : "Recommended Venues / Spots"}
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                    {items.map(item => (
                      <div key={`${item.sourceType}-${item.id}`} className="p-3.5 border border-outline-soft/20 rounded-2xl flex gap-3 bg-slate-50 items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 min-w-0 font-sans">
                          {item.imageUrl && (
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                              <img alt={item.name} src={item.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div className="min-w-0 font-sans">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-sm text-text-dark truncate leading-tight select-none font-sans">{item.name}</h4>
                            </div>
                            <p className="text-[10px] text-text-muted truncate max-w-[150px] sm:max-w-[250px] mt-0.5 font-sans" title={item.detail}>{item.detail}</p>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded border font-semibold inline-block mt-1 select-none font-sans ${item.active ? 'bg-green-50 text-green-700 border-green-150' : 'bg-slate-100 text-slate-500'}`}>
                              {item.active ? 'Active' : 'Draft'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingCuration({
                              id: item.id,
                              type: item.sourceType,
                              category: item.category,
                              name: item.name,
                              detail: item.detail,
                              imageUrl: item.imageUrl,
                              active: item.active !== false
                            })}
                            className="px-3 py-1.5 text-[11px] font-bold border border-outline-soft/35 rounded-full hover:bg-bg-warm cursor-pointer transition-all bg-white font-sans"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${item.name}" curated option?`)) {
                                const delEndpoint = item.sourceType === 'activity' ? `/api/admin/activities/${item.id}` : `/api/admin/venues/${item.id}`;
                                fetch(delEndpoint, {
                                  method: 'DELETE',
                                  headers: { 'X-Admin-Password': adminPasswordToken }
                                }).then(() => {
                                  fetchDashboard();
                                  onRefreshData();
                                });
                              }
                            }}
                            className="p-1 px-2 text-red-500 rounded hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* AUTO APPROVAL TRUSTED EMAILS TAB */}
      {activeTab === 'trusted' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start font-sans">
          
          {/* Add form */}
          <div className="bg-white rounded-3xl p-5 border border-outline-soft/20 shadow-sm space-y-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-primary-dark">Register trusted contact</h3>
              <p className="text-xs text-text-muted">Trusted emails bypass manual review if selecting open calendar slots!</p>
            </div>

            <form onSubmit={handleAddTrustedEmail} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-text-muted mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="friend@email.com"
                  value={newTrustedEmail}
                  onChange={e => setNewTrustedEmail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-text-muted mb-1">Relation Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Brother John, Best Friend"
                  value={newTrustedNotes}
                  onChange={e => setNewTrustedNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-green hover:bg-primary-dark text-white rounded-full py-3 font-semibold shadow"
              >
                Save Trusted Contact
              </button>
            </form>
          </div>

          {/* List display */}
          <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-outline-soft/20 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary-dark">
              Automated Auto-Approval Registry
            </h3>

            {dashboardData.trustedEmails.length === 0 ? (
              <p className="text-xs text-text-muted italic py-6 text-center">List is empty currently.</p>
            ) : (
              <div className="divide-y divide-outline-soft/10">
                {dashboardData.trustedEmails.map((elem: TrustedEmail) => (
                  <div key={elem.id} className="flex justify-between items-center py-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-primary-green/10 text-primary-green rounded-full shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-text-dark select-all">{elem.email}</p>
                        <p className="text-[10px] text-text-muted">{elem.notes}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTrustedEmail(elem.id)}
                      className="text-red-500 font-bold p-1 hover:bg-red-50 rounded cursor-pointer shrink-0"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILE SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start font-sans">
          
          {/* Setup parameters forms */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-outline-soft/20 shadow-sm space-y-5 text-xs">
            <div>
              <h3 className="font-serif text-lg font-bold text-primary-dark">Ned's Public profile config</h3>
              <p className="text-xs text-text-muted">Control location badges and administrator credentials</p>
            </div>

            {settingsStatusMsg && (
              <div className="p-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold">
                {settingsStatusMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-text-muted mb-1">Floating Location Badge *</label>
                  <input
                    type="text"
                    required
                    value={currentlyIn}
                    onChange={e => setCurrentlyIn(e.target.value)}
                    className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl font-medium text-text-dark"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text-muted mb-1">Ned's Portrait photo URL *</label>
                  <input
                    type="text"
                    required
                    value={profilePhoto}
                    onChange={e => setProfilePhoto(e.target.value)}
                    className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-muted mb-1">Update Secure Admin Password <span className="font-normal opacity-65">(leave empty to keep current)</span></label>
                <input
                  type="password"
                  placeholder="Type new secure passphrase"
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  className="w-full p-2.5 bg-white border border-outline-soft/30 rounded-xl font-mono text-sm shadow-inner"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-primary-green hover:bg-primary-dark text-white rounded-full px-6 py-3 font-semibold transition-all shadow-md cursor-pointer"
                >
                  Save Settings Bundle
                </button>
              </div>
            </form>
          </div>

          {/* Profile Previews */}
          <div className="bg-bg-warm rounded-3xl p-5 border border-outline-soft/15 flex flex-col items-center text-center space-y-4 shadow-inner">
            <h4 className="font-serif text-sm font-bold text-primary-dark">Active Avatar Card Preview</h4>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-gold shadow-md">
              <img alt="Ned avatar preview" src={profilePhoto} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-1">
              <p className="font-serif font-black text-lg text-primary-dark leading-none">Nedate</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-[10px] font-bold bg-primary-green text-white">
                <MapPin className="w-3 h-3" />
                {currentlyIn}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATED EMAIL SANDBOX LOGS */}
      <div className="bg-primary-dark text-white rounded-3xl p-6 shadow-xl space-y-5 font-sans">
        <div>
          <h3 className="font-serif text-lg font-bold text-accent-gold">Simulated Sandbox Email Notifications Box</h3>
          <p className="text-[11px] text-white/70 leading-normal max-w-xl">
            Because a real Resend email API key belongs to Ned's personal environment variable panel, we have compiled an active notification queue! Every email dispatched dynamically is caught here for visual inspection.
          </p>
        </div>

        {emailLogs.length === 0 ? (
          <p className="text-xs text-white/50 italic py-4">No emails have been captured in this thread yet. Submit or confirm a request to generate transaction logs!</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
            {emailLogs.map(log => (
              <div key={log.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1.5 text-xs text-white/95">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="font-bold text-accent-gold shrink-0">TO: {log.to}</span>
                  <span className="text-[10px] text-white/60 font-mono shrink-0">Captured {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-bold text-stone-200">Subject: {log.subject}</p>
                <p className="text-[11px] text-white/80 whitespace-pre-wrap leading-relaxed mt-2 p-2 bg-black/10 rounded-xl select-all font-sans">
                  {log.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminPanel;
