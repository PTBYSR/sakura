import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useWebSocket } from '@/contexts/WebSocketContext';

// Map navigation item IDs to section names used in useUnifiedChatData
const SECTION_MAPPING: Record<string, string> = {
  'human-chats': 'my-inbox-chats',
  'escalated-chats': 'my-inbox-escalated',
  'resolved-chats': 'my-inbox-resolved',
  'active-chats': 'agent-inbox-active',
  'resolved-agent-chats': 'agent-inbox-resolved',
};

// Map paths to section IDs
const PATH_TO_SECTION_ID: Record<string, string> = {
  '/inbox/my-inbox/chats': 'human-chats',
  '/inbox/my-inbox/escalated': 'escalated-chats',
  '/inbox/my-inbox/resolved': 'resolved-chats',
  '/inbox/agent-inbox/active-chats': 'active-chats',
  '/inbox/agent-inbox/resolved-chats': 'resolved-agent-chats',
};

interface SectionReadState {
  lastSeenCount: number;
  lastVisited: string; // ISO timestamp
}

const STORAGE_KEY = 'inbox-section-read-state';

// Dynamically switch between local and production backend URLs
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://sakura-backend.onrender.com");

// Fetch chat count for a section
async function fetchSectionChatCount(section: string): Promise<number> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/api/debug/users-chats`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    const users = data.users || [];
    
    // Map section to categorization criteria (from useUnifiedChatData)
    const CHAT_CATEGORIZATION: Record<string, { category?: string; status?: string }> = {
      "unified-inbox": {},
      "agent-inbox-active": { category: "agent-inbox", status: "active" },
      "agent-inbox-resolved": { category: "agent-inbox", status: "resolved" },
      "my-inbox-chats": { category: "human-chats", status: "active" },
      "my-inbox-escalated": { category: "human-chats", status: "escalated" },
      "my-inbox-resolved": { category: "human-chats", status: "resolved" },
    };
    
    const categorization = CHAT_CATEGORIZATION[section] || {};
    
    // Count matching chats
    let count = 0;
    users.forEach((user: any) => {
      if (!user.chats || user.chats.length === 0) return;
      
      user.chats.forEach((chat: any) => {
        // Check category match
        const categoryMatch = !categorization.category || user.category === categorization.category;
        
        // Check status match
        let statusMatch = true;
        if (categorization.status && user.status) {
          statusMatch = user.status.toLowerCase() === categorization.status.toLowerCase();
        } else if (categorization.status) {
          statusMatch = false;
        }
        
        if (categoryMatch && statusMatch) {
          count++;
        }
      });
    });
    
    return count;
  } catch (error) {
    console.warn(`Failed to fetch chat count for section ${section}:`, error);
    return 0;
  }
}

export function useSectionUnreadCounts() {
  const pathname = usePathname();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { subscribe, isConnected } = useWebSocket();

  // Load read state from localStorage
  const getReadState = useCallback((): Record<string, SectionReadState> => {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  // Save read state to localStorage
  const saveReadState = useCallback((state: Record<string, SectionReadState>) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save read state to localStorage:', error);
    }
  }, []);

  // Mark a section as read (called when section is visited)
  const markSectionAsRead = useCallback((sectionId: string) => {
    const readState = getReadState();
    const section = SECTION_MAPPING[sectionId];
    
    if (!section) return;
    
    // Fetch current count and save it as last seen
    fetchSectionChatCount(section).then((count) => {
      const updatedState = {
        ...readState,
        [sectionId]: {
          lastSeenCount: count,
          lastVisited: new Date().toISOString(),
        },
      };
      saveReadState(updatedState);
      
      // Update unread counts (should be 0 now)
      setUnreadCounts(prev => ({
        ...prev,
        [sectionId]: 0,
      }));
    });
  }, [getReadState, saveReadState]);

  // Calculate unread counts for all sections
  const updateUnreadCounts = useCallback(async () => {
    const readState = getReadState();
    const newUnreadCounts: Record<string, number> = {};
    
    // Fetch counts for all sections in parallel
    const sectionIds = Object.keys(SECTION_MAPPING);
    const countPromises = sectionIds.map(async (sectionId) => {
      const section = SECTION_MAPPING[sectionId];
      const currentCount = await fetchSectionChatCount(section);
      const lastSeenState = readState[sectionId];
      
      if (!lastSeenState) {
        // If never visited, all chats are unread
        newUnreadCounts[sectionId] = currentCount;
      } else {
        // Unread = current count - last seen count
        // But don't go negative (in case chats were deleted)
        const unread = Math.max(0, currentCount - lastSeenState.lastSeenCount);
        newUnreadCounts[sectionId] = unread;
      }
    });
    
    await Promise.all(countPromises);
    setUnreadCounts(newUnreadCounts);
    setLoading(false);
  }, [getReadState]);

  // Initial load on mount
  useEffect(() => {
    updateUnreadCounts();
  }, [updateUnreadCounts]);

  // Subscribe to WebSocket updates instead of polling
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('unread_counts', (data: any) => {
      console.log('📨 Received WebSocket unread counts update');
      
      if (data?.counts) {
        // Map backend section names to navigation item IDs
        const sectionMapping: Record<string, string> = {
          'my-inbox-chats': 'human-chats',
          'my-inbox-escalated': 'escalated-chats',
          'my-inbox-resolved': 'resolved-chats',
          'agent-inbox-active': 'active-chats',
          'agent-inbox-resolved': 'resolved-agent-chats',
        };

        const readState = getReadState();
        const newUnreadCounts: Record<string, number> = {};

        // Calculate unread counts based on last seen
        Object.entries(data.counts).forEach(([section, currentCount]: [string, any]) => {
          const sectionId = sectionMapping[section];
          if (!sectionId) return;

          const lastSeenState = readState[sectionId];
          if (!lastSeenState) {
            // If never visited, all chats are unread
            newUnreadCounts[sectionId] = currentCount;
          } else {
            // Unread = current count - last seen count
            const unread = Math.max(0, currentCount - lastSeenState.lastSeenCount);
            newUnreadCounts[sectionId] = unread;
          }
        });

        setUnreadCounts(newUnreadCounts);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected, subscribe, getReadState]);

  // Mark section as read when pathname changes to match a section
  useEffect(() => {
    const sectionId = PATH_TO_SECTION_ID[pathname];
    if (sectionId) {
      markSectionAsRead(sectionId);
    }
  }, [pathname, markSectionAsRead]);

  // Get unread count for a specific section
  const getUnreadCount = useCallback((sectionId: string): number => {
    return unreadCounts[sectionId] || 0;
  }, [unreadCounts]);

  return {
    unreadCounts,
    getUnreadCount,
    markSectionAsRead,
    loading,
    refreshCounts: updateUnreadCounts,
  };
}

