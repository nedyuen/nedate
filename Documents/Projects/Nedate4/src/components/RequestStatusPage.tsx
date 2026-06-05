import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, XCircle, Calendar, MapPin, 
  User, Send, MessageCircle, RefreshCw, Smile, Trash2, CheckCircle
} from 'lucide-react';
import { MeetupRequest, RequestComment } from '../types';

interface RequestStatusPageProps {
  publicToken: string;
  onGoBack: () => void;
}

export function RequestStatusPage({ publicToken, onGoBack }: RequestStatusPageProps) {
  const [request, setRequest] = useState<MeetupRequest | null>(null);
  const [comments, setComments] = useState<RequestComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Comment typing state
  const [commentText, setCommentText] = useState<string>('');

  // Fetch request data
  const fetchRequestDetails = async () => {
    try {
      const res = await fetch(`/api/requests/${publicToken}`);
      if (!res.ok) {
        throw new Error('Meetup request tracking link not found');
      }
      const data = await res.json();
      setRequest(data.request);
      setComments(data.comments);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error loading status page details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
    // Poll every 10 seconds to make it real-time and responsive if admin updates status
    const interval = setInterval(fetchRequestDetails, 10000);
    return () => clearInterval(interval);
  }, [publicToken]);

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !request) return;
    setSubmitLoading(true);

    try {
      const res = await fetch(`/api/requests/${publicToken}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authorType: 'User',
          message: commentText
        })
      });

      if (!res.ok) throw new Error('Failed to post message');
      const newComment = await res.json();
      
      setComments(prev => [...prev, newComment]);
      setCommentText('');
    } catch (err: any) {
      alert(err.message || 'Error posting message');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Accept alternative time proposed by admin
  const handleAcceptAlternative = async () => {
    if (!request) return;
    setActionLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/requests/${publicToken}/user-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'accept_alternative',
          message: `User confirmed alternative proposed slot: ${request.alternativeTime}. Event locked on calendar!`
        })
      });

      if (!res.ok) throw new Error('Failed to confirm slot change');
      const data = await res.json();
      
      setRequest(data.request);
      fetchRequestDetails(); // reload timeline comments
      alert('Meetup successfully scheduled and confirmed!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error accepting proposed time');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel request voluntarily
  const handleCancelRequest = async () => {
    if (!request) return;
    if (!window.confirm('Are you sure you want to cancel this meetup invitation with Ned?')) return;
    setActionLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/requests/${publicToken}/user-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'cancel'
        })
      });

      if (!res.ok) throw new Error('Error processing cancellation request');
      const data = await res.json();
      
      setRequest(data.request);
      fetchRequestDetails();
      alert('Request cancelled successfully');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error cancelling request');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-accent-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-text-muted font-sans/50">Compiling your request status credentials...</p>
      </div>
    );
  }

  if (errorMsg && !request) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-xl font-bold text-primary-dark">Link Expired or Invalid Token</h2>
        <p className="text-sm text-text-muted font-sans">
          The meetup reference token is incorrect or this link has been deleted.
        </p>
        <button 
          onClick={onGoBack}
          className="bg-primary-green text-white rounded-full px-6 py-2.5 text-xs font-semibold cursor-pointer"
        >
          Return to home
        </button>
      </div>
    );
  }

  if (!request) return null;

  // Render pretty helper box context
  const getHelperMessageAndIcon = () => {
    switch (request.status) {
      case 'Pending':
        return {
          icon: AlertCircle,
          text: "Awaiting review. Ned is busy evaluating his calendar rules and will respond shortly.",
          color: "bg-amber-50 text-amber-800 border-amber-200"
        };
      case 'Approved':
        return {
          icon: CheckCircle2,
          text: "Excellent! Your adventure with Ned is scheduled and active on Google Calendar.",
          color: "bg-green-50 text-green-800 border-green-200"
        };
      case 'Alternative Proposed':
        return {
          icon: RefreshCw,
          text: `Awaiting your confirmation of the proposed alternative time: ${request.alternativeTime}`,
          color: "bg-sky-50 text-sky-800 border-sky-200"
        };
      case 'Rejected':
        return {
          icon: XCircle,
          text: "Closed. Ned could not host this specific date. Please try scheduling another time!",
          color: "bg-red-50 text-red-800 border-red-200"
        };
      case 'Cancelled':
        return {
          icon: XCircle,
          text: "This invitation was withdrawn or cancelled by request.",
          color: "bg-slate-50 text-slate-800 border-slate-200"
        };
      case 'Completed':
        return {
          icon: CheckCircle2,
          text: "Completed request. Thanks for the amazing physical hangouts memory!",
          color: "bg-primary-green/10 text-primary-green border-primary-green/20"
        };
    }
  };

  const helper = getHelperMessageAndIcon();
  const IconComponent = helper.icon;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Alternative Proposed': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      {/* Back button and page intro */}
      <div className="flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-outline-soft/10">
        <button 
          onClick={onGoBack}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-primary-green select-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </button>
        <span className="text-[11px] font-mono text-text-muted/75 tracking-wider uppercase font-semibold">
          REF: {request.referenceCode}
        </span>
      </div>

      <div className="space-y-2">
        <span className="text-accent-gold text-xs font-bold uppercase tracking-widest block font-sans">
          Invitation Status
        </span>
        <h2 className="font-serif text-3xl font-black text-primary-dark">
          Track Meetup Progress
        </h2>
      </div>

      {/* Main Status Float Card */}
      <div className="bg-white rounded-3xl p-6 border border-outline-soft/25 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 border-b border-outline-soft/15 pb-4">
          <div>
            <span className="text-xs text-text-muted uppercase tracking-wider block font-sans">
              Activity Type
            </span>
            <span className="font-serif text-2xl font-bold text-primary-dark block mt-0.5">
              {request.activityType} with Ned
            </span>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(request.status)} font-sans mt-1 sm:mt-0 w-fit`}>
            {request.status}
          </span>
        </div>

        {/* Dynamic Context Helpers */}
        <div className={`p-4 rounded-2xl border-l-4 flex items-start gap-3 text-xs leading-normal font-medium ${helper.color}`}>
          <IconComponent className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Next steps</p>
            <p className="mt-0.5 opacity-90">{helper.text}</p>
          </div>
        </div>

        {/* Bento Details Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Details list */}
          <div className="bg-bg-warm/40 border border-outline-soft/15 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-outline-soft/15 pb-2 font-sans">
              Details
            </h4>
            
            <div className="space-y-3 font-sans">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Host Guest</span>
                <span className="text-sm text-text-dark font-semibold block">{request.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Email Address</span>
                <span className="text-sm text-text-dark font-medium block truncate select-all">{request.email}</span>
              </div>
              {request.phone && (
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Phone Contact</span>
                  <span className="text-sm text-text-dark font-medium block select-all">{request.phone}</span>
                </div>
              )}
              {request.approvedTime ? (
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Locked Event Time</span>
                  <span className="text-sm text-emerald-700 font-bold block">{request.approvedTime}</span>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest block">Proposed Time</span>
                  <span className="text-sm text-accent-gold font-bold block">{request.requestedTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* User notes */}
          <div className="bg-bg-warm/40 border border-outline-soft/15 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted border-b border-outline-soft/15 pb-2 font-sans">
                Activity Notes
              </h4>
              <p className="text-xs text-text-muted leading-relaxed mt-3 whitespace-pre-wrap font-sans">
                {request.notes || "No custom details entered."}
              </p>
            </div>
            {request.venueCustom && (
              <div className="mt-4 pt-3 border-t border-outline-soft/10">
                <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest block">Suggested Spot</span>
                <span className="text-xs text-primary-green font-bold block mt-0.5">{request.venueCustom}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Zone for alternative proposed state */}
      {request.status === 'Alternative Proposed' && request.alternativeTime && (
        <div className="bg-accent-light/65 border-2 border-dashed border-accent-gold/45 rounded-3xl p-6 text-center space-y-4 shadow-sm">
          <p className="font-serif text-lg font-bold text-primary-dark">
            Do you accept Ned's proposed alternative slot?
          </p>
          <div className="max-w-sm mx-auto bg-white p-3 rounded-xl border border-accent-gold/20 shadow-inner font-mono text-xs font-semibold text-accent-gold">
            {request.alternativeTime}
          </div>
          {request.alternativeComment && (
            <p className="font-sans text-xs italic text-text-muted max-w-md mx-auto leading-relaxed">
              &ldquo;{request.alternativeComment}&rdquo;
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
            <button
              onClick={handleAcceptAlternative}
              disabled={actionLoading}
              className="flex-1 bg-primary-green text-white rounded-full py-3 text-xs font-bold hover:bg-primary-dark shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm Propose Slot</span>
            </button>
            <button
              onClick={handleCancelRequest}
              disabled={actionLoading}
              className="flex-1 border border-red-200 text-red-600 rounded-full py-3 text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer"
            >
              Cancel Meetup
            </button>
          </div>
        </div>
      )}

      {/* Timeline of messages and logs */}
      <div className="bg-white border border-outline-soft/20 rounded-3xl p-6 shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-bold text-primary-dark border-b border-outline-soft/10 pb-2 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-accent-gold shrink-0 animate-pulse" />
          Adventures Conversation Timeline
        </h3>

        {/* Messaging thread */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-outline-soft/30 min-h-[50px]">
          {comments.map((comment, index) => {
            const isAdmin = comment.authorType === 'Admin';
            const isSystem = comment.authorType === 'System';
            
            return (
              <div key={comment.id || index} className="relative group">
                {/* Visual marker dot */}
                <div className={`absolute -left-7 top-1.5 w-3.5 h-3.5 rounded-full border border-white z-10 shadow-sm ${
                  isSystem ? 'bg-accent-gold' : isAdmin ? 'bg-primary-green' : 'bg-slate-500'
                }`}></div>

                {isSystem ? (
                  <div className="text-[11px] text-text-muted italic flex items-center gap-1.5">
                    <span className="font-mono text-[9px] text-accent-gold/80 font-bold">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{comment.message}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isAdmin ? 'text-primary-green' : 'text-slate-600'}`}>
                        {isAdmin ? 'Ned' : request.name}
                      </span>
                      <span className="text-[8px] text-text-muted font-mono font-semibold">
                        {new Date(comment.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`p-3 rounded-2xl text-xs max-w-sm font-sans leading-normal ${
                      isAdmin ? 'bg-primary-green/5 border border-primary-green/10 rounded-tl-none font-medium' : 'bg-slate-100 rounded-tr-none'
                    }`}>
                      {comment.message}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input box to add message to discussion thread if request is active */}
        {request.status !== 'Cancelled' && request.status !== 'Completed' && (
          <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-outline-soft/10 flex gap-2">
            <input
              type="text"
              placeholder="Type a message to discuss with Ned..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              disabled={submitLoading}
              className="flex-1 px-4 py-2 bg-outline-soft/10 border border-outline-soft/25 rounded-full text-xs font-sans focus:outline-none focus:border-accent-gold transition-colors"
            />
            <button
              type="submit"
              disabled={submitLoading || !commentText.trim()}
              className="bg-accent-gold disabled:bg-accent-gold/45 text-white p-2.5 rounded-full hover:bg-yellow-600 transition-colors active:scale-95 cursor-pointer shrink-0"
              title="Send comment"
            >
              {submitLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        )}
      </div>

      {/* Voluntarily Cancel option for active requests */}
      {request.status !== 'Cancelled' && request.status !== 'Completed' && request.status !== 'Rejected' && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleCancelRequest}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:underline select-none cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Cancel adventure request
          </button>
        </div>
      )}
    </div>
  );
}

export default RequestStatusPage;
