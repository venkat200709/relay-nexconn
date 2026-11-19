export type RequestCategory = 
  | 'Medicine' 
  | 'Groceries' 
  | 'Ride' 
  | 'Translation' 
  | 'Elder Check-in' 
  | 'Household Fix' 
  | 'Pet Care' 
  | 'Urgent Alert';

export type UrgencyLevel = 'high' | 'medium' | 'normal';

export type RequestStatus = 'open' | 'claimed' | 'in_progress' | 'resolved';

export interface HelpRequest {
  id: string;
  category: RequestCategory;
  urgency: UrgencyLevel;
  title: string;
  description: string;
  location: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  volunteerId?: string;
  volunteerName?: string;
  volunteerAvatar?: string;
  status: RequestStatus;
  createdAt: number;
  claimedAt?: number;
  resolvedAt?: number;
  resolutionSummary?: string;
  rating?: number;
  feedback?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'requester' | 'volunteer';
  avatar: string;
}

export interface AppChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
  isSelf: boolean;
  isStatusAlert?: boolean;
}
