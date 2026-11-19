import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { HelpRequest, UserProfile, AppChatMessage, RequestStatus, RequestCategory, UrgencyLevel } from '../types';
import {
  initializeNexconn,
  connectNexconn,
  disconnectNexconn,
  setupConnectionListener,
  setupMessageListener,
  setupTypingListener,
  sendChatMessage,
  sendTypingIndicator,
  markChannelAsRead,
} from '../lib/nexconn';

export const PRESET_USERS: UserProfile[] = [
  {
    id: 'user-requester-eleanor',
    name: 'Eleanor Vance',
    role: 'requester',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-requester-marcus',
    name: 'Marcus Chen',
    role: 'requester',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-volunteer-venkat',
    name: 'Venkatesan',
    role: 'volunteer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-volunteer-sasmita',
    name: 'Sasmita',
    role: 'volunteer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchUser: (user: UserProfile) => Promise<void>;
  appConfig: { appKey: string; dataCenter: string };
  connectionStatus: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';
  requests: HelpRequest[];
  activeRequestId: string | null;
  activeRequest: HelpRequest | null;
  setActiveRequestId: (id: string | null) => void;
  messages: AppChatMessage[];
  isOtherUserTyping: boolean;
  createRequest: (data: {
    category: RequestCategory;
    urgency: UrgencyLevel;
    title: string;
    description: string;
    location: string;
  }) => Promise<boolean>;
  claimRequest: (requestId: string) => Promise<boolean>;
  updateRequestStatus: (requestId: string, status: RequestStatus, summary?: string) => Promise<boolean>;
  rateRequest: (requestId: string, rating: number, feedback: string) => Promise<boolean>;
  sendMessage: (text: string, imageUrl?: string) => Promise<boolean>;
  notifyTyping: () => void;
  resetDemoData: () => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isLargeFont: boolean;
  toggleLargeFont: () => void;
  fetchRequests: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('relay_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return PRESET_USERS[2];
  });

  const [appConfig, setAppConfig] = useState<{ appKey: string; dataCenter: string }>({
    appKey: '',
    dataCenter: 'Singapore',
  });

  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR'>('DISCONNECTED');
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [roomMessages, setRoomMessages] = useState<Record<string, AppChatMessage[]>>({});
  const [isOtherUserTyping, setIsOtherUserTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('relay_theme') === 'dark';
  });

  const [isLargeFont, setIsLargeFont] = useState<boolean>(() => {
    return localStorage.getItem('relay_large_font') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('relay_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('relay_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isLargeFont) {
      document.body.classList.add('large-font');
      localStorage.setItem('relay_large_font', 'true');
    } else {
      document.body.classList.remove('large-font');
      localStorage.setItem('relay_large_font', 'false');
    }
  }, [isLargeFont]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const toggleLargeFont = () => setIsLargeFont((prev) => !prev);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setAppConfig({
        appKey: data.appKey || '',
        dataCenter: data.dataCenter || 'Singapore',
      });
      if (data.appKey) {
        initializeNexconn(data.appKey);
      }
    } catch {}
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch {}
  };

  const connectUserToNexconn = async (user: UserProfile) => {
    try {
      setConnectionStatus('CONNECTING');
      await disconnectNexconn();

      const res = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          avatarUrl: user.avatar,
        }),
      });

      const data = await res.json();
      if (!data.token) {
        setConnectionStatus('ERROR');
        return;
      }

      setupConnectionListener('global-conn', (status) => {
        if (status === 'CONNECTED') {
          setConnectionStatus('CONNECTED');
        } else if (status === 'DISCONNECTED') {
          setConnectionStatus('DISCONNECTED');
        }
      });

      setupMessageListener('global-msg', (msg) => {
        const textContent = msg.content?.content || msg.text || '';
        let imageUrl: string | undefined;

        if (textContent.startsWith('__IMG__:')) {
          imageUrl = textContent.replace('__IMG__:', '');
        }

        const senderId = msg.senderUserId || msg.senderId || 'peer';
        const newMsg: AppChatMessage = {
          id: msg.messageUId || msg.messageId || `${Date.now()}-${Math.random()}`,
          senderId,
          senderName: senderId === user.id ? user.name : 'Neighbour',
          senderAvatar: senderId === user.id ? user.avatar : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + senderId,
          text: imageUrl ? '' : textContent,
          imageUrl,
          timestamp: msg.sentTime || Date.now(),
          isSelf: senderId === user.id,
        };

        setRoomMessages((prev) => {
          const activeKey = activeRequestId || 'global';
          const list = prev[activeKey] || [];
          if (list.some((m) => m.id === newMsg.id)) return prev;
          return {
            ...prev,
            [activeKey]: [...list, newMsg],
          };
        });
      });

      setupTypingListener('global-typing', (typerId) => {
        if (typerId !== user.id) {
          setIsOtherUserTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, 4000);
        }
      });

      const connectResult = await connectNexconn(data.token);
      if (connectResult.success) {
        setConnectionStatus('CONNECTED');
      } else {
        setConnectionStatus('ERROR');
      }
    } catch {
      setConnectionStatus('ERROR');
    }
  };

  const switchUser = async (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('relay_current_user', JSON.stringify(user));
    await connectUserToNexconn(user);
  };

  useEffect(() => {
    fetchConfig().then(() => {
      connectUserToNexconn(currentUser);
    });
    fetchRequests();

    const interval = setInterval(() => {
      fetchRequests();
    }, 3000);

    return () => {
      clearInterval(interval);
      disconnectNexconn();
    };
  }, []);

  const activeRequest = requests.find((r) => r.id === activeRequestId) || null;

  useEffect(() => {
    if (activeRequest && connectionStatus === 'CONNECTED') {
      const peerId = currentUser.role === 'volunteer' ? activeRequest.requesterId : activeRequest.volunteerId;
      if (peerId) {
        markChannelAsRead(peerId);
      }
    }
  }, [activeRequestId, activeRequest?.status, connectionStatus]);

  const createRequest = async (data: {
    category: RequestCategory;
    urgency: UrgencyLevel;
    title: string;
    description: string;
    location: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          requesterId: currentUser.id,
          requesterName: currentUser.name,
          requesterAvatar: currentUser.avatar,
        }),
      });
      const result = await res.json();
      if (result.request) {
        await fetchRequests();
        setActiveRequestId(result.request.id);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const claimRequest = async (requestId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/requests/${requestId}/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          volunteerId: currentUser.id,
          volunteerName: currentUser.name,
          volunteerAvatar: currentUser.avatar,
        }),
      });
      const data = await res.json();
      if (data.request) {
        await fetchRequests();
        setActiveRequestId(requestId);

        const welcomeText = `Hello ${data.request.requesterName}! I have claimed your request "${data.request.title}". I am ready to assist you.`;
        await sendMessageToPeer(data.request.requesterId, welcomeText);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateRequestStatus = async (
    requestId: string,
    status: RequestStatus,
    summary?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolutionSummary: summary }),
      });
      const data = await res.json();
      if (data.request) {
        await fetchRequests();

        const targetId = currentUser.role === 'volunteer' ? data.request.requesterId : data.request.volunteerId;
        if (targetId) {
          const statusText = status === 'in_progress' 
            ? 'Status updated to: In Progress.' 
            : `Status updated to: Resolved. ${summary ? `Resolution: ${summary}` : ''}`;
          await sendMessageToPeer(targetId, statusText, undefined, true);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const rateRequest = async (requestId: string, rating: number, feedback: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/requests/${requestId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback }),
      });
      const data = await res.json();
      if (data.request) {
        await fetchRequests();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const sendMessageToPeer = async (
    peerId: string,
    text: string,
    imageUrl?: string,
    isStatusAlert: boolean = false
  ): Promise<boolean> => {
    const payload = imageUrl ? `__IMG__:${imageUrl}` : text;
    const ok = await sendChatMessage(peerId, payload);

    const localMsg: AppChatMessage = {
      id: `local-${Date.now()}-${Math.random()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: imageUrl ? '' : text,
      imageUrl,
      timestamp: Date.now(),
      isSelf: true,
      isStatusAlert,
    };

    setRoomMessages((prev) => {
      const key = activeRequestId || 'global';
      const list = prev[key] || [];
      return {
        ...prev,
        [key]: [...list, localMsg],
      };
    });

    return ok;
  };

  const sendMessage = async (text: string, imageUrl?: string): Promise<boolean> => {
    if (!activeRequest) return false;
    const peerId = currentUser.role === 'volunteer' ? activeRequest.requesterId : activeRequest.volunteerId;
    if (!peerId) return false;
    return sendMessageToPeer(peerId, text, imageUrl);
  };

  const notifyTyping = () => {
    if (!activeRequest) return;
    const peerId = currentUser.role === 'volunteer' ? activeRequest.requesterId : activeRequest.volunteerId;
    if (peerId) {
      sendTypingIndicator(peerId);
    }
  };

  const resetDemoData = async () => {
    try {
      await fetch('/api/requests/reset', { method: 'POST' });
      await fetchRequests();
      setActiveRequestId(null);
      setRoomMessages({});
    } catch {}
  };

  const currentMessages = activeRequestId ? roomMessages[activeRequestId] || [] : [];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUser,
        appConfig,
        connectionStatus,
        requests,
        activeRequestId,
        activeRequest,
        setActiveRequestId,
        messages: currentMessages,
        isOtherUserTyping,
        createRequest,
        claimRequest,
        updateRequestStatus,
        rateRequest,
        sendMessage,
        notifyTyping,
        resetDemoData,
        isDarkMode,
        toggleDarkMode,
        isLargeFont,
        toggleLargeFont,
        fetchRequests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
