import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Chat, Message, MessageType, Status, ContactRequest } from './types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  messages: Message[];
  statuses: Status[];
  contactRequests: ContactRequest[];
  theme: 'light' | 'dark';
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  registerUser: (name: string, password?: string) => User;
  loginUser: (name: string, password?: string) => User | undefined;
  setTheme: (theme: 'light' | 'dark') => void;
  
  createChat: (participantIds: string[], isGroup?: boolean, groupName?: string) => string;
  sendMessage: (chatId: string, content: string, type: MessageType, duration?: number) => void;
  addStatus: (content: string, type: MessageType) => void;
  
  sendContactRequest: (toUserName: string) => boolean;
  acceptContactRequest: (requestId: string) => void;
  
  // Admin
  getAllUsers: () => User[];
  getAllMessages: () => Message[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: [],
      chats: [],
      messages: [],
      statuses: [],
      contactRequests: [],
      theme: 'light',

      setCurrentUser: (user) => set({ currentUser: user }),

      registerUser: (name, password) => {
        const newUser: User = {
          id: uuidv4(),
          name,
          password,
          isOnline: true,
          avatar: `https://ui-avatars.com/api/?name=${name}&background=1D503A&color=fff`
        };
        set((state) => ({ users: [...state.users, newUser], currentUser: newUser }));
        return newUser;
      },

      loginUser: (name, password) => {
        const users = get().users;
        return users.find(u => u.name === name && u.password === password);
      },

      setTheme: (theme) => set({ theme }),

      createChat: (participantIds, isGroup = false, groupName) => {
        const existingChat = !isGroup 
          ? get().chats.find(c => !c.isGroup && c.participants.includes(participantIds[0]) && c.participants.includes(participantIds[1])) 
          : null;

        if (existingChat) return existingChat.id;

        const newChat: Chat = {
          id: uuidv4(),
          participants: participantIds,
          isGroup,
          groupName,
          unreadCount: 0,
          groupAvatar: isGroup ? `https://ui-avatars.com/api/?name=${groupName}&background=6c7d36&color=fff` : undefined
        };
        set(state => ({ chats: [...state.chats, newChat] }));
        return newChat.id;
      },

      sendMessage: (chatId, content, type, duration) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;

        const newMessage: Message = {
          id: uuidv4(),
          chatId,
          senderId: currentUser.id,
          content,
          type,
          timestamp: Date.now(),
          read: false,
          duration
        };

        set(state => ({
          messages: [...state.messages, newMessage],
          chats: state.chats.map(c => c.id === chatId ? { ...c, lastMessage: newMessage } : c)
        }));
      },

      addStatus: (content, type) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        const newStatus: Status = {
          id: uuidv4(),
          userId: currentUser.id,
          content,
          type,
          timestamp: Date.now(),
          viewers: []
        };
        set(state => ({ statuses: [newStatus, ...state.statuses] }));
      },

      sendContactRequest: (toUserName) => {
        const { users, currentUser, contactRequests } = get();
        if (!currentUser) return false;
        const targetUser = users.find(u => u.name === toUserName && u.id !== currentUser.id);
        
        if (!targetUser) return false;
        
        // Check if request already exists
        if (contactRequests.find(r => r.fromUserId === currentUser.id && r.toUserId === targetUser.id)) return true;

        const req: ContactRequest = {
          id: uuidv4(),
          fromUserId: currentUser.id,
          toUserId: targetUser.id,
          status: 'pending'
        };
        set(state => ({ contactRequests: [...state.contactRequests, req] }));
        return true;
      },

      acceptContactRequest: (requestId) => {
        set(state => {
          const req = state.contactRequests.find(r => r.id === requestId);
          if (!req) return state;

          // Create chat immediately upon acceptance
          const newChatId = uuidv4();
          const newChat: Chat = {
            id: newChatId,
            participants: [req.fromUserId, req.toUserId],
            isGroup: false,
            unreadCount: 0
          };

          return {
            contactRequests: state.contactRequests.filter(r => r.id !== requestId),
            chats: [...state.chats, newChat]
          };
        });
      },

      getAllUsers: () => get().users,
      getAllMessages: () => get().messages,
    }),
    {
      name: 'chatxa-storage',
    }
  )
);