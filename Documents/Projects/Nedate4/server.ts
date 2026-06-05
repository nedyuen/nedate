import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { readDb, writeDb } from './server/db';
import { MeetupRequest, RequestComment, Activity, Venue, AvailabilityRule, TrustedEmail, SystemSettings, AppStateData } from './src/types';

const app = express();
app.use(express.json());
const PORT = 3000;

// Helper to generate reference codes e.g. NED-0012
function generateReferenceCode(requests: MeetupRequest[]): string {
  const latestNum = requests.reduce((max, r) => {
    const match = r.referenceCode.match(/NED-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 11); // Start matching from 11 so next is NED-0012 reflecting Julian Alexander's ref
  const nextNum = latestNum + 1;
  return `NED-${String(nextNum).padStart(4, '0')}`;
}

// Helper to calculate available slots for the upcoming 14 days
function getAvailableSlots(rules: AvailabilityRule[], requests: MeetupRequest[]): { id: string; timeString: string; label: string; date: string; time: string }[] {
  const slots: { id: string; timeString: string; label: string; date: string; time: string }[] = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Look ahead 14 days starting today
  const today = new Date();
  
  for (let offset = 0; offset < 14; offset++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset);
    const dayName = daysOfWeek[targetDate.getDay()];
    
    // Find active rule for this day
    const dayRules = rules.filter(r => r.active && r.dayOfWeek.toLowerCase() === dayName.toLowerCase());
    
    for (const rule of dayRules) {
      const [startHour, startMin] = rule.startTime.split(':').map(Number);
      const [endHour, endMin] = rule.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      let currentMinutes = startMinutes;
      while (currentMinutes + rule.slotDuration <= endMinutes) {
        const slotHour = Math.floor(currentMinutes / 60);
        const slotMin = currentMinutes % 60;
        
        const slotDate = new Date(targetDate);
        slotDate.setHours(slotHour, slotMin, 0, 0);
        
        // Format strings
        const dateStr = slotDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const timeStr = slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const label = `${dateStr} • ${timeStr}`;
        const timeString = `${dayName} ${timeStr}`;
        
        // Match against existing approved or pending requests
        // (Just to check if Ned is busy during this slot)
        const isBusy = requests.some(r => {
          if (r.status !== 'Approved' && r.status !== 'Pending') return false;
          // Clean compare requestedTime with our generated slot target
          const reqTimeLower = r.requestedTime.toLowerCase();
          const slotLabelLower = label.toLowerCase();
          const idStringLower = timeString.toLowerCase();
          return reqTimeLower.includes(slotLabelLower) || reqTimeLower.includes(idStringLower) || reqTimeLower === idStringLower;
        });
        
        if (!isBusy) {
          const isoDate = slotDate.toISOString().split('T')[0];
          const hhmm = `${String(slotHour).padStart(2, '0')}:${String(slotMin).padStart(2, '0')}`;
          slots.push({
            id: `slot-${isoDate}-${hhmm}`,
            timeString: `${dayName} ${timeStr}`,
            label,
            date: isoDate,
            time: hhmm
          });
        }
        
        currentMinutes += rule.slotDuration;
      }
    }
  }
  
  return slots;
}

// EMAIL SIGNALS & NOTIFICATION BUFFER
// Since we don't have a configured real Resend API key out-of-the-box,
// we create a persistent simulation list that can be viewed in the app.
export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

const emailLogs: SimulatedEmail[] = [];

function sendSimulatedEmail(to: string, subject: string, body: string) {
  const email: SimulatedEmail = {
    id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    to,
    subject,
    body,
    sentAt: new Date().toISOString()
  };
  emailLogs.unshift(email); // Keep newest first
  console.log(`[SIMULATED EMAIL SENT TO ${to}]: "${subject}"`);
}

// API: PUBLIC DATA
app.get('/api/public-data', (req, res) => {
  const db = readDb();
  const activeActivities = db.activities.filter(a => a.active);
  const activeVenues = db.venues.filter(v => v.active);
  const suggestedSlots = getAvailableSlots(db.availabilityRules, db.requests);
  
  res.json({
    activities: activeActivities,
    venues: activeVenues,
    suggestedSlots,
    profile: {
      currentlyIn: db.settings.currentlyIn,
      profilePhoto: db.settings.profilePhoto,
      slotDuration: db.settings.slotDuration
    }
  });
});

// API: RETRIEVE COMPLETED EMAIL LOGS FOR PREVIEW
app.get('/api/admin/emails', (req, res) => {
  const db = readDb();
  // Password check to protect logs
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(emailLogs);
});

// API: CREATE REQUEST
app.post('/api/requests', (req, res) => {
  const db = readDb();
  const { name, email, phone, activityType, activityId, venueId, venueCustom, notes, requestedTime } = req.body;
  
  if (!name || !email || !activityType || !requestedTime) {
    return res.status(400).json({ error: 'Missing required request parameters' });
  }
  
  const referenceCode = generateReferenceCode(db.requests);
  const publicToken = `tok-${referenceCode.toLowerCase()}-${Math.random().toString(36).substring(2, 8)}`;
  
  // Assess auto-approval:
  // Is this email in trusted_emails AND is the chose requestedTime matching one of the upcoming available slots?
  const isTrusted = db.trustedEmails.some(t => t.email.toLowerCase() === email.toLowerCase());
  
  // Check if requestedTime is one of the upcoming suggested available slots
  const upcomingSlots = getAvailableSlots(db.availabilityRules, db.requests);
  const isMatchingSlot = upcomingSlots.some(slot => {
    const cleanRequested = requestedTime.toLowerCase();
    return cleanRequested.includes(slot.label.toLowerCase()) || cleanRequested.includes(slot.timeString.toLowerCase());
  });
  
  const shouldAutoApprove = isTrusted && isMatchingSlot;
  const status = shouldAutoApprove ? 'Approved' : 'Pending';
  
  const newRequest: MeetupRequest = {
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    referenceCode,
    name,
    email,
    phone: phone || '',
    activityType,
    activityId: activityId || undefined,
    venueId: venueId || undefined,
    venueCustom: venueCustom || '',
    notes: notes || '',
    requestedTime,
    status,
    publicToken,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (shouldAutoApprove) {
    newRequest.approvedTime = requestedTime;
  }
  
  db.requests.unshift(newRequest);
  
  // Add systemic start comment
  const initComment: RequestComment = {
    id: `com-${Date.now()}-1`,
    requestId: newRequest.id,
    authorType: 'System',
    message: 'Request Created',
    createdAt: new Date().toISOString()
  };
  db.comments.push(initComment);
  
  if (shouldAutoApprove) {
    const autoApproveComment: RequestComment = {
      id: `com-${Date.now()}-2`,
      requestId: newRequest.id,
      authorType: 'System',
      message: 'Automated Approval: Trusted contact & open slot selected. Meetup scheduled on Google Calendar!',
      createdAt: new Date().toISOString()
    };
    db.comments.push(autoApproveComment);
    
    // Send auto-approve email notifications
    sendSimulatedEmail(
      email,
      `[Approved] Nedate Adventures Scheduled: ${activityType} with Ned!`,
      `Hi ${name},\n\nFantastic news! Because you selected an open available slot, your request to hang out with Ned has been automatically approved!\n\nActivity: ${activityType}\nTime: ${requestedTime}\nReference: ${referenceCode}\n\nWe have automatically added this to Ned's Google Calendar and sent you a calendar invitation. See you soon!\n\nWarmly,\nNedate Robot`
    );
  } else {
    // Send normal confirmation email
    sendSimulatedEmail(
      email,
      `[Pending] Your meetup request has been sent! (Ref: ${referenceCode})`,
      `Hi ${name},\n\nThanks for proposing a meetup with Ned!\n\nActivity: ${activityType}\nRequested Time: ${requestedTime}\nReference Code: ${referenceCode}\n\nNed is reviewng his calendar and will approve, coordinate, or suggest alternative slots shortly. You can track your real-time request status here:\nhttps://nedate.com/status/${publicToken}\n\nWarmly,\nNedate Support`
    );
  }
  
  writeDb(db);
  res.json(newRequest);
});

// GET SINGLE REQUEST BY PUBLIC TOKEN OR REFERENCE CODE
app.get('/api/requests/:identifier', (req, res) => {
  const db = readDb();
  const ident = req.params.identifier;
  
  const request = db.requests.find(
    r => r.publicToken === ident || r.referenceCode === ident || r.id === ident
  );
  
  if (!request) {
    return res.status(404).json({ error: 'Meetup request not found' });
  }
  
  const comments = db.comments.filter(c => c.requestId === request.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  res.json({
    request,
    comments
  });
});

// POST USER ACTION (e.g. Accept Alternative or Cancel)
app.post('/api/requests/:identifier/user-action', (req, res) => {
  const db = readDb();
  const ident = req.params.identifier;
  const { action, message } = req.body; // 'accept_alternative' or 'cancel'
  
  const request = db.requests.find(
    r => r.publicToken === ident || r.referenceCode === ident || r.id === ident
  );
  
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  if (action === 'accept_alternative') {
    if (!request.alternativeTime) {
      return res.status(400).json({ error: 'No alternative time has been proposed' });
    }
    request.status = 'Approved';
    request.approvedTime = request.alternativeTime;
    request.requestedTime = request.alternativeTime; // Lock it in
    request.alternativeTime = undefined; // clear alternative
    request.updatedAt = new Date().toISOString();
    
    // Log comment
    const comment1: RequestComment = {
      id: `com-${Date.now()}-a`,
      requestId: request.id,
      authorType: 'User',
      message: message || `User accepted the proposed alternative time. Looking forward to it!`,
      createdAt: new Date().toISOString()
    };
    const comment2: RequestComment = {
      id: `com-${Date.now()}-b`,
      requestId: request.id,
      authorType: 'System',
      message: `Status updated to Approved. Google Calendar event scheduled.`,
      createdAt: new Date().toISOString()
    };
    db.comments.push(comment1, comment2);
    
    // Email notifications
    sendSimulatedEmail(
      request.email,
      `[Approved] Nedate alternative accepted (Ref: ${request.referenceCode})`,
      `Hi ${request.name},\n\nYou have confirmed the proposed alternative time: ${request.requestedTime}.\n\nYour meetup: "${request.activityType}" is now officially Approved!\n\nCalendar events have been sent to your email. Talk soon!\n\nWarmly,\nNedate`
    );
    sendSimulatedEmail(
      'ned@nedate.com',
      `[Admin Alert] Julian accepted your alternative proposal! (Ref: ${request.referenceCode})`,
      `Hey Ned,\n\n${request.name} just accepted your proposed time: ${request.requestedTime} for ${request.activityType}.\n\nThe event is officially locked and synchronized on Google Calendar.`
    );
    
  } else if (action === 'cancel') {
    request.status = 'Cancelled';
    request.updatedAt = new Date().toISOString();
    
    const cancelComment: RequestComment = {
      id: `com-${Date.now()}-c`,
      requestId: request.id,
      authorType: 'User',
      message: `Request was cancelled by the invitation host.`,
      createdAt: new Date().toISOString()
    };
    db.comments.push(cancelComment);
    
    sendSimulatedEmail(
      request.email,
      `[Cancelled] Meetup invitation withdrawn (Ref: ${request.referenceCode})`,
      `Hi ${request.name},\n\nWe have successfully cancelled your meetup request of "${request.activityType}" with Ned as requested.\n\nHope to hang out with you on another adventure soon!\n\nWarmly,\nNedate`
    );
  } else {
    return res.status(400).json({ error: 'Invalid user action specified' });
  }
  
  writeDb(db);
  res.json({ success: true, request });
});

// POST COMMENT UNDER TIMELINE
app.post('/api/requests/:identifier/comments', (req, res) => {
  const db = readDb();
  const ident = req.params.identifier;
  const { authorType, message } = req.body;
  
  if (!message || !authorType) {
    return res.status(400).json({ error: 'Missing authorType or message comment content' });
  }
  
  const request = db.requests.find(
    r => r.publicToken === ident || r.referenceCode === ident || r.id === ident
  );
  
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  const comment: RequestComment = {
    id: `com-${Date.now()}`,
    requestId: request.id,
    authorType,
    message,
    createdAt: new Date().toISOString()
  };
  
  db.comments.push(comment);
  writeDb(db);
  
  // Prompt notification
  if (authorType === 'User') {
    sendSimulatedEmail(
      'ned@nedate.com',
      `[New Message] Comment on Meetup ${request.referenceCode} from ${request.name}`,
      `Hi Ned,\n\n${request.name} left a message on request "${request.activityType}":\n\n"${message}"\n\nReply directly from the Admin Dashboard.`
    );
  } else if (authorType === 'Admin') {
    sendSimulatedEmail(
      request.email,
      `[New Message] Ned commented on your adventure request!`,
      `Hi ${request.name},\n\nNed left a message on your meetup request (Ref: ${request.referenceCode}):\n\n"${message}"\n\nView details and respond here:\nhttps://nedate.com/status/${request.publicToken}\n\nWarmly,\nNedate Support`
    );
  }
  
  res.json(comment);
});

// ADMIN: VERIFY LOGIN
app.post('/api/admin/login', (req, res) => {
  const db = readDb();
  const { password } = req.body;
  
  if (password === db.settings.adminPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// ADMIN: GET COMPLETE ADMIN DASHBOARD BUNDLE
app.get('/api/admin/dashboard', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }
  
  const commentsMap = db.comments.reduce((acc, c) => {
    if (!acc[c.requestId]) acc[c.requestId] = [];
    acc[c.requestId].push(c);
    return acc;
  }, {} as Record<string, RequestComment[]>);
  
  res.json({
    requests: db.requests,
    activities: db.activities,
    venues: db.venues,
    trustedEmails: db.trustedEmails,
    availabilityRules: db.availabilityRules,
    settings: {
      slotDuration: db.settings.slotDuration,
      bufferTime: db.settings.bufferTime,
      futureWindow: db.settings.futureWindow,
      currentlyIn: db.settings.currentlyIn,
      profilePhoto: db.settings.profilePhoto
    },
    commentsMap
  });
});

// ADMIN ACTION: MANAGE REQUEST STATUS
app.post('/api/admin/requests/:id/action', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized credentials' });
  }
  
  const id = req.params.id;
  const { action, alternativeTime, alternativeComment, message } = req.body;
  
  const request = db.requests.find(r => r.id === id);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  
  if (action === 'approve') {
    request.status = 'Approved';
    request.approvedTime = request.requestedTime;
    request.updatedAt = new Date().toISOString();
    
    const comments: RequestComment[] = [
      {
        id: `com-${Date.now()}-app-1`,
        requestId: request.id,
        authorType: 'Admin',
        message: message || `Approved. Looking forward to it!`,
        createdAt: new Date().toISOString()
      },
      {
        id: `com-${Date.now()}-app-2`,
        requestId: request.id,
        authorType: 'System',
        message: `Status updated to Approved. Google Calendar event created.`,
        createdAt: new Date().toISOString()
      }
    ];
    db.comments.push(...comments);
    
    sendSimulatedEmail(
      request.email,
      `[Approved] Ned Approved: Meetup Scheduled! (Ref: ${request.referenceCode})`,
      `Hi ${request.name},\n\nExcellent news! Ned approved your request to hang out together!\n\nActivity: ${request.activityType}\nScheduled Time: ${request.requestedTime}\nReference: ${request.referenceCode}\n\nWe have scheduled an event on Google Calendar and invited you. Prepare for an adventure! See you there.\n\nWarmly,\nNedate`
    );
    
  } else if (action === 'reject') {
    request.status = 'Rejected';
    request.updatedAt = new Date().toISOString();
    
    const comment: RequestComment = {
      id: `com-${Date.now()}-rej`,
      requestId: request.id,
      authorType: 'Admin',
      message: message || `Sorry, unable to host this request right now. Hope to connect soon.`,
      createdAt: new Date().toISOString()
    };
    db.comments.push(comment);
    
    sendSimulatedEmail(
      request.email,
      `[Update] Status of meetup request: Ref ${request.referenceCode}`,
      `Hi ${request.name},\n\nThanks for your invite to hang out. Unfortunately, Ned won't be able to make this specific meetup due to conflicting schedules or prior arrangements.\n\nWe would love to do something else or try another time in the future! Please feel free to check the activity inspiration board and request another time.\n\nWarmly,\nNedate`
    );
    
  } else if (action === 'suggest_alternative') {
    if (!alternativeTime) {
      return res.status(400).json({ error: 'Missing alternative time parameter' });
    }
    request.status = 'Alternative Proposed';
    request.alternativeTime = alternativeTime;
    request.alternativeComment = alternativeComment || '';
    request.updatedAt = new Date().toISOString();
    
    const commentsList: RequestComment[] = [
      {
        id: `com-${Date.now()}-p1`,
        requestId: request.id,
        authorType: 'Admin',
        message: alternativeComment || `Can't do Saturday unfortunately. Sunday afternoon works better for me.`,
        createdAt: new Date().toISOString()
      },
      {
        id: `com-${Date.now()}-p2`,
        requestId: request.id,
        authorType: 'System',
        message: `Alternative proposed: ${alternativeTime}. Awaiting user confirmation.`,
        createdAt: new Date().toISOString()
      }
    ];
    db.comments.push(...commentsList);
    
    sendSimulatedEmail(
      request.email,
      `[Alternative Proposed] Ned suggested another time for your meetup!`,
      `Hi ${request.name},\n\nNed is very interested in your meetup request ("${request.activityType}") but has proposed a different slot instead:\n\nProposed Slot: ${alternativeTime}\nNed's Comment: "${alternativeComment}"\n\nPlease confirm if this works for you by accepting the alternative proposed time here:\nhttps://nedate.com/status/${request.publicToken}\n\nWarmly,\nNedate Support`
    );
  } else if (action === 'complete') {
    request.status = 'Completed';
    request.updatedAt = new Date().toISOString();
    const comment: RequestComment = {
      id: `com-${Date.now()}-cp`,
      requestId: request.id,
      authorType: 'System',
      message: `Activity marked as Completed. Thanks for the amazing hanging out memory!`,
      createdAt: new Date().toISOString()
    };
    db.comments.push(comment);
  }
  
  writeDb(db);
  res.json({ success: true, request });
});

// ADMIN: MANAGE TRUSTED EMAILS
app.get('/api/admin/trusted', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(db.trustedEmails);
});

app.post('/api/admin/trusted', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { email, notes } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  
  const newEmail: TrustedEmail = {
    id: `trust-${Date.now()}`,
    email,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };
  
  db.trustedEmails.push(newEmail);
  writeDb(db);
  res.json(newEmail);
});

app.delete('/api/admin/trusted/:id', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  db.trustedEmails = db.trustedEmails.filter(t => t.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// ADMIN: MANAGE ACTIVITIES
app.post('/api/admin/activities', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id, title, description, imageUrl, category, active } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  
  if (id) {
    // Edit existing
    let act = db.activities.find(a => a.id === id);
    if (!act) {
      // Check if it was previously stored as a venue (e.g. changing category or fixing duplicate)
      const venueExists = db.venues.find(v => v.id === id);
      if (venueExists) {
        db.venues = db.venues.filter(v => v.id !== id);
        // Create matching activity entry
        const targetId = id.startsWith('ven-') ? `act-conv-${id.substring(4)}` : `act-${Date.now()}`;
        act = {
          id: targetId,
          title,
          description: description || '',
          imageUrl: imageUrl || '',
          category: category || "ned's bucket list",
          active: active !== undefined ? active : true,
          createdAt: new Date().toISOString()
        };
        db.activities.push(act);
      }
    } else {
      act.title = title;
      act.description = description || '';
      act.imageUrl = imageUrl || '';
      act.category = category || "ned's bucket list";
      act.active = active !== undefined ? active : act.active;
    }

    if (!act) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    writeDb(db);
    res.json(act);
  } else {
    // Add new
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      title,
      description: description || '',
      imageUrl: imageUrl || '',
      category: category || "ned's bucket list",
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString()
    };
    db.activities.push(newAct);
    writeDb(db);
    res.json(newAct);
  }
});

app.delete('/api/admin/activities/:id', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  db.activities = db.activities.filter(a => a.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// ADMIN: MANAGE VENUES
app.post('/api/admin/venues', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id, name, category, address, imageUrl, active } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Name and category are required' });
  
  if (id) {
    let venue = db.venues.find(v => v.id === id);
    if (!venue) {
      // Check if it was previously stored as an activity
      const actExists = db.activities.find(a => a.id === id);
      if (actExists) {
        db.activities = db.activities.filter(a => a.id !== id);
        // Create matching venue entry
        const targetId = id.startsWith('act-') ? `ven-conv-${id.substring(4)}` : `ven-${Date.now()}`;
        venue = {
          id: targetId,
          name,
          category,
          address: address || '',
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
          active: active !== undefined ? active : true,
          createdAt: new Date().toISOString()
        };
        db.venues.push(venue);
      }
    } else {
      venue.name = name;
      venue.category = category;
      venue.address = address || '';
      venue.imageUrl = imageUrl || '';
      venue.active = active !== undefined ? active : venue.active;
    }

    if (!venue) {
      return res.status(404).json({ error: 'Venue not found' });
    }

    writeDb(db);
    res.json(venue);
  } else {
    const newVenue: Venue = {
      id: `ven-${Date.now()}`,
      name,
      category,
      address: address || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      active: active !== undefined ? active : true,
      createdAt: new Date().toISOString()
    };
    db.venues.push(newVenue);
    writeDb(db);
    res.json(newVenue);
  }
});

app.delete('/api/admin/venues/:id', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  db.venues = db.venues.filter(v => v.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// ADMIN: MANAGE AVAILABILITY RULES
app.post('/api/admin/rules', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id, dayOfWeek, startTime, endTime, slotDuration, active } = req.body;
  if (!dayOfWeek || !startTime || !endTime) return res.status(400).json({ error: 'Day, startTime and endTime required' });
  
  if (id) {
    const rule = db.availabilityRules.find(r => r.id === id);
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    rule.dayOfWeek = dayOfWeek;
    rule.startTime = startTime;
    rule.endTime = endTime;
    rule.slotDuration = Number(slotDuration) || 120;
    rule.active = active !== undefined ? active : rule.active;
    writeDb(db);
    res.json(rule);
  } else {
    const newRule: AvailabilityRule = {
      id: `rule-${Date.now()}`,
      dayOfWeek,
      startTime,
      endTime,
      slotDuration: Number(slotDuration) || 120,
      active: active !== undefined ? active : true
    };
    db.availabilityRules.push(newRule);
    writeDb(db);
    res.json(newRule);
  }
});

app.delete('/api/admin/rules/:id', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  db.availabilityRules = db.availabilityRules.filter(r => r.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// ADMIN: UPDATE SETTINGS
app.post('/api/admin/settings', (req, res) => {
  const db = readDb();
  const authPassword = req.headers['x-admin-password'];
  if (authPassword !== db.settings.adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { slotDuration, bufferTime, futureWindow, currentlyIn, profilePhoto, adminPassword } = req.body;
  
  if (slotDuration) db.settings.slotDuration = String(slotDuration);
  if (bufferTime) db.settings.bufferTime = String(bufferTime);
  if (futureWindow) db.settings.futureWindow = String(futureWindow);
  if (currentlyIn) db.settings.currentlyIn = String(currentlyIn);
  if (profilePhoto) db.settings.profilePhoto = String(profilePhoto);
  if (adminPassword) db.settings.adminPassword = String(adminPassword);
  
  writeDb(db);
  res.json({ success: true, settings: db.settings });
});


// MIDDLEWARE VITE & PRODUCTION HANDLERS
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
