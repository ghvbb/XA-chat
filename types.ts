export interface User {
  id: string;
  name: string;
  password?: string; // Stored for auth simulation
  avatar?: string;
  about?: string;
  isOnline: boolean;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string; // Text or Base64/URL
  type: MessageType;
  timestamp: number;
  duration?: number; // For audio/video
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[]; // User IDs
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface Status {
  id: string;
  userId: string;
  content: string; // Text or Media URL
  type: MessageType;
  timestamp: number;
  viewers: string[];
}

export interface ContactRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
}