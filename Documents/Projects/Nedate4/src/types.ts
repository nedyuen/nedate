export interface Activity {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string; // 'Adventure' | 'Food' | 'Chill' | 'Outdoors' | 'Casual' | etc.
  active: boolean;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  category: string; // 'Dinner' | 'Coffee' | 'Theme Park' | 'Walk' | 'Activity'
  address: string;
  imageUrl: string;
  active: boolean;
  createdAt: string;
}

export type RequestStatus = 'Pending' | 'Approved' | 'Alternative Proposed' | 'Rejected' | 'Completed' | 'Cancelled';

export interface MeetupRequest {
  id: string;
  referenceCode: string; // e.g. NED-0012
  name: string;
  email: string;
  phone?: string;
  activityType: string; // Coffee | Dinner etc.
  activityId?: string;
  venueId?: string;
  venueCustom?: string;
  notes: string;
  requestedTime: string; // ISO string or human string representation
  approvedTime?: string;
  status: RequestStatus;
  publicToken: string;
  createdAt: string;
  updatedAt: string;
  // Alternative fields
  alternativeTime?: string;
  alternativeComment?: string;
}

export interface RequestComment {
  id: string;
  requestId: string;
  authorType: 'Admin' | 'User' | 'System';
  message: string;
  createdAt: string;
}

export interface TrustedEmail {
  id: string;
  email: string;
  notes: string;
  createdAt: string;
}

export interface AvailabilityRule {
  id: string;
  dayOfWeek: string; // 'Monday' through 'Sunday'
  startTime: string; // 'HH:MM'
  endTime: string;   // 'HH:MM'
  slotDuration: number; // in minutes
  active: boolean;
}

export interface SystemSettings {
  adminPassword?: string;
  slotDuration: string;
  bufferTime: string;
  futureWindow: string; // in days
  currentlyIn: string; // e.g. "London, UK"
  profilePhoto: string;
}

export interface AppStateData {
  activities: Activity[];
  venues: Venue[];
  requests: MeetupRequest[];
  comments: RequestComment[];
  trustedEmails: TrustedEmail[];
  availabilityRules: AvailabilityRule[];
  settings: SystemSettings;
}
