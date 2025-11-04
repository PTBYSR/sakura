import { useState, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

// Dynamically switch between local and production backend URLs
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://sakura-backend.onrender.com");

export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead?: boolean;
  avatar?: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  location: string;
  avatar: string;
  status: string;
  chatId: string;
  chatDuration: string;
  totalMessages: number;
  archivedCount: number;
  visitedPagesCount: number;
  tags: string[];
  visitedPages: { url: string; title: string; timestamp: string; }[];
}

export interface BackendUserData {
  name: string;
  email: string;
  ip: string;
  location: {
    city: string;
    region: string;
    country: string;
    timezone: string;
  };
  device: {
    type: string;
    os: string;
    browser: string;
  };
  referrer: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    term: string;
    content: string;
  };
}

export interface ChatInstance {
  chat: {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    avatar: string;
    status: "online" | "offline" | "away";
    section: string;
  };
  messages: ChatMessage[];
  contactInfo: ContactInfo;
  backendUserData: BackendUserData;
}

export interface UseUnifiedChatDataProps {
  inboxType: "human" | "agent";
  userEmail: string;
  userId?: string | null;
  section: string;
}

// Chat categorization mapping - maps section names to category/status filters
const CHAT_CATEGORIZATION: Record<string, { category?: string; status?: string }> = {
  "unified-inbox": {}, // Show all chats regardless of category/status
  "agent-inbox-active": { category: "agent-inbox", status: "active" },
  "agent-inbox-resolved": { category: "agent-inbox", status: "resolved" },
  "my-inbox-chats": { category: "human-chats", status: "active" }, // Active human chats
  "my-inbox-escalated": { category: "human-chats", status: "escalated" },
  "my-inbox-resolved": { category: "human-chats", status: "resolved" },
} as const;

// Helper function to check if a chat matches the categorization criteria
const matchesCategorization = (user: any, chat: any, categorization: { category?: string; status?: string }) => {
  // If no filters specified (unified inbox), show all
  if (!categorization.category && !categorization.status) {
    return true;
  }

  // Category is stored on the user document
  // Default to "agent-inbox" if category is not set (to match backend default)
  const userCategory = user.category || "agent-inbox";
  const categoryMatch = !categorization.category || userCategory === categorization.category;
  
  // Status: Use USER status for chat status (user.status determines the chat's status)
  // Default to "active" if status is not set (to match backend default)
  const userStatus = user.status || "active";
  let statusMatch = true;
  if (categorization.status) {
    statusMatch = userStatus.toLowerCase() === categorization.status.toLowerCase();
  }
  
  // Debug logging
  if (!categoryMatch || !statusMatch) {
    console.log(`❌ Chat doesn't match criteria:`, {
      userCategory,
      requiredCategory: categorization.category,
      userStatus,
      requiredStatus: categorization.status,
      categoryMatch,
      statusMatch
    });
  }
  
  // Both category and status must match
  return categoryMatch && statusMatch;
};

export const useUnifiedChatData = ({ inboxType, userEmail, userId, section }: UseUnifiedChatDataProps) => {
  const [chats, setChats] = useState<ChatInstance[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { subscribe, isConnected } = useWebSocket();

  // Fetch real data from backend (same endpoint as bank page)
  const fetchBackendData = async () => {
    try {
      console.log("🔄 Fetching live data from backend...");
      console.log(`📍 API URL: ${API_BASE_URL}/api/debug/users-chats`);
      
      // Add timeout to prevent infinite loading (increased to 30 seconds to account for MongoDB connection delays)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const startTime = Date.now();
      console.log(`⏱️  Starting fetch request at ${new Date().toISOString()}`);
      
      const response = await fetch(`${API_BASE_URL}/api/debug/users-chats`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });
      
      const elapsedTime = Date.now() - startTime;
      console.log(`⏱️  Fetch completed in ${elapsedTime}ms`);
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Backend error: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch {
          // If not JSON, use the text as-is
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      const users = data.users || [];
      console.log("📊 Received backend data:", {
        usersCount: users.length,
        firstUser: users[0] ? {
          name: users[0].name,
          email: users[0].email,
          category: users[0].category,
          status: users[0].status,
          chatsCount: users[0].chats?.length || 0
        } : null
      });
      
      // Log users matching agent-inbox/active for debugging
      const matchingUsers = users.filter((u: any) => 
        (u.category || 'agent-inbox') === 'agent-inbox' && 
        (u.status || 'active').toLowerCase() === 'active' && 
        (u.chats?.length || 0) > 0
      );
      if (matchingUsers.length > 0) {
        console.log(`🎯 Found ${matchingUsers.length} users matching agent-inbox/active with chats:`, 
          matchingUsers.map((u: any) => ({ name: u.name, email: u.email, chatsCount: u.chats?.length || 0 }))
        );
      }
      
      return users;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timed out after 30 seconds');
        console.error('   The backend may be slow or unresponsive. Please check:', API_BASE_URL);
        console.error('   Possible causes:');
        console.error('   1. MongoDB is not running');
        console.error('   2. Backend server is hanging on database queries');
        console.error('   3. Network connectivity issues');
        // Return a special marker for timeout
        return { __error: 'Request timed out after 30 seconds. Please ensure MongoDB is running and the backend server is responsive.' };
      } else {
        console.error('❌ Failed to fetch backend data:', error);
        console.error('   Error message:', error.message);
        console.error('   Please check backend connection and endpoint:', `${API_BASE_URL}/api/debug/users-chats`);
        // Return error info
        return { __error: error.message || 'Failed to connect to backend. Please ensure the backend server is running and MongoDB is connected.' };
      }
    }
  };

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!section) {
          console.warn('⚠️ No section provided, cannot load chats');
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }

        // Get categorization criteria for this section
        const categorization = CHAT_CATEGORIZATION[section as keyof typeof CHAT_CATEGORIZATION] || {};
        console.log(`📋 Filtering chats for section: ${section}`, categorization);
        console.log(`🌐 API Base URL: ${API_BASE_URL}`);

        // Try to fetch real backend data first
        const backendUsers = await fetchBackendData();
        
        // Check if fetchBackendData returned an error object
        if (backendUsers && typeof backendUsers === 'object' && '__error' in backendUsers) {
          setError(backendUsers.__error);
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }
        
        // Check for null or invalid response
        if (!backendUsers || !Array.isArray(backendUsers)) {
          setError('Failed to load chats from backend. Please check backend connection.');
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }
        
        // Empty array is OK - just means no users/chats exist yet
        if (backendUsers.length === 0) {
          console.log('ℹ️  No users found in database. This is normal if no widget users have been created yet.');
          setChats([]);
          setSelectedChat(null);
          setLoading(false);
          return;
        }

        const sourceData = backendUsers;
        console.log(`✅ Successfully fetched ${backendUsers.length} users from backend`);

        console.log(`📦 Source data: ${sourceData.length} users`);
        if (sourceData.length > 0) {
          console.log(`📝 First user sample:`, {
            name: sourceData[0].name,
            email: sourceData[0].email,
            category: sourceData[0].category,
            status: sourceData[0].status,
            chatsCount: sourceData[0].chats?.length || 0
          });
          
          // Log all users with their emails for debugging
          if (section === 'agent-inbox-active') {
            console.log(`📋 All users in source data:`, sourceData.map((u: any) => ({
              name: u.name,
              email: u.email || 'NO EMAIL',
              matchesLoggedIn: u.email?.toLowerCase() === userEmail?.toLowerCase(),
              chatsCount: u.chats?.length || 0
            })));
          }
        }

        // Filter users based on category and status
        console.log(`🔍 Filtering for section "${section}" with criteria:`, categorization);
        console.log(`📋 Total users in source data: ${sourceData.length}`);
        console.log(`🔑 Dashboard user ID: ${userId || 'not provided'}, Email: ${userEmail}`);
        
        // Filter by dashboard_user_id (widget owner) if userId provided, otherwise fallback to email
        let ownerFilteredUsers = sourceData;
        if (userEmail && userEmail !== "admin@heirs.com" && userEmail !== "agent@heirs.com") {
          if (userId) {
            // Primary filter: Match by dashboard_user_id (widget owner)
            ownerFilteredUsers = sourceData.filter((user: any) => {
              const userDashboardUserId = user.dashboard_user_id?.toString();
              const loggedInUserId = userId.toString();
              const matches = userDashboardUserId === loggedInUserId;
              
              if (section === 'agent-inbox-active') {
                if (matches) {
                  console.log(`✅ User "${user.name}" (${user.email}) linked to dashboard user ${userId}`);
                } else {
                  console.log(`⏭️  Skipping user "${user.name}" (${user.email || 'no email'}) - not linked to dashboard user ${userId} (dashboard_user_id: ${user.dashboard_user_id || 'none'})`);
                }
              }
              return matches;
            });
            
            // If dashboard_user_id filtering results in 0 matches, check if this is due to missing dashboard_user_id on existing records
            if (ownerFilteredUsers.length === 0 && section === 'agent-inbox-active') {
              const customersWithDashboardUserId = sourceData.filter((u: any) => u.dashboard_user_id).length;
              const totalCustomers = sourceData.length;
              
              if (customersWithDashboardUserId === 0 && totalCustomers > 0) {
                console.warn(`⚠️  No widget customers have dashboard_user_id set. These are likely old records created before linking was implemented.`);
                console.warn(`   Total widget customers: ${totalCustomers}`);
                console.warn(`   Solution: Create new widget customers through your widget link to get proper linking.`);
                console.warn(`   Your widget link should be: /widget/${userId}`);
                // Don't show old unlinked customers - they can't be reliably linked to any dashboard user
                ownerFilteredUsers = [];
              } else {
                console.warn(`⚠️  No widget customers found linked to dashboard user ${userId}.`);
                console.warn(`   This is correct behavior - you should only see customers created through your widget link.`);
                console.warn(`   Your widget link: /widget/${userId}`);
              }
            }
          } else {
            // No userId available, fallback to email filtering
            console.warn('⚠️  No userId available, using email filter. Widget customers should be linked via dashboard_user_id.');
            ownerFilteredUsers = sourceData.filter((user: any) => {
              const userEmailLower = user.email?.toLowerCase() || '';
              const loggedInEmailLower = userEmail.toLowerCase();
              const matches = userEmailLower === loggedInEmailLower;
              
              if (section === 'agent-inbox-active') {
                if (matches) {
                  console.log(`✅ User "${user.name}" (${user.email}) matches logged-in user ${userEmail}`);
                } else {
                  console.log(`⏭️  Skipping user "${user.name}" (${user.email || 'no email'}) - email doesn't match logged-in user ${userEmail}`);
                }
              }
              return matches;
            });
          }
        }
        
        const filteredUsers = ownerFilteredUsers.filter((user: any) => {
          // For admin/agent, log that we're showing all users
          if (userEmail === "admin@heirs.com" || userEmail === "agent@heirs.com") {
            if (section === 'agent-inbox-active') {
              console.log(`👁️  Admin/Agent view - showing user "${user.name}" (${user.email || 'no email'})`);
            }
          }
          
          // Check if user has chats that match the categorization criteria
          if (!user.chats || user.chats.length === 0) {
            if (section === 'agent-inbox-active') {
            console.log(`⏭️  Skipping user ${user.email} - no chats`);
            }
            return false;
          }
          
          // Log chat structure for debugging
          if (section === 'agent-inbox-active' && user.chats && user.chats.length > 0) {
            console.log(`📦 User ${user.email} has ${user.chats.length} chat(s). Chat structure:`, {
              firstChatKeys: user.chats[0] ? Object.keys(user.chats[0]) : [],
              firstChatData: user.chats[0] ? {
                chat_id: user.chats[0].chat_id,
                id: user.chats[0].id,
                status: user.chats[0].status,
                messagesCount: user.chats[0].messages?.length || 0
              } : null
            });
          }
          
          // Log user details for debugging
          if (section === 'agent-inbox-active') {
            console.log(`👤 Checking user: ${user.email || user.name}`, {
              category: user.category || 'undefined',
              status: user.status || 'undefined',
              chatsCount: user.chats?.length || 0,
              matchesLoggedInUser: user.email?.toLowerCase() === userEmail?.toLowerCase()
            });
          }
          
          const hasMatchingChats = user.chats.some((chat: any) => {
            const matches = matchesCategorization(user, chat, categorization);
            if (section === 'agent-inbox-active') {
              const userCategory = user.category || "agent-inbox";
              const userStatus = user.status || "active";
              if (matches) {
                console.log(`✅ User ${user.email} chat ${chat.chat_id} MATCHES:`, {
                  userCategory,
                  userStatus,
                  requiredCategory: categorization.category,
                  requiredStatus: categorization.status,
                  chatId: chat.chat_id,
                  chatStatus: chat.status
                });
              } else {
              console.log(`❌ User ${user.email} chat ${chat.chat_id} doesn't match:`, {
                  userCategory,
                  userStatus,
                requiredCategory: categorization.category,
                  requiredStatus: categorization.status,
                  categoryMatch: userCategory === categorization.category,
                  statusMatch: userStatus.toLowerCase() === categorization.status?.toLowerCase(),
                  chatId: chat.chat_id,
                  chatStatus: chat.status,
                  chatData: chat
                });
              }
            }
            return matches;
          });

          if (section === 'agent-inbox-active') {
          if (hasMatchingChats) {
              console.log(`✅ User ${user.email} has ${user.chats.filter((c: any) => matchesCategorization(user, c, categorization)).length} matching chat(s) and will be shown`);
            } else {
              console.log(`❌ User ${user.email} has NO matching chats (has ${user.chats?.length || 0} total chats)`);
            }
          }

          return hasMatchingChats;
        });

        console.log(`📊 Filtered ${filteredUsers.length} users matching criteria for section "${section}"`);
        
        // Log detailed info about filtered users
        if (section === 'agent-inbox-active') {
          console.log(`📝 Filtered users details:`, filteredUsers.map((u: any) => ({
            name: u.name || u.email,
            email: u.email,
            category: u.category || 'agent-inbox (default)',
            status: u.status || 'active (default)',
            chatsCount: u.chats?.length || 0,
            chatIds: u.chats?.map((c: any) => c.chat_id) || []
          })));
        }
        
        if (section === 'agent-inbox-active' && filteredUsers.length === 0) {
          console.warn('⚠️ WARNING: No users matched agent-inbox-active criteria!');
          console.log('📋 All users from source:');
          sourceData.forEach((u: any, idx: number) => {
            console.log(`  User ${idx + 1}: ${u.name || u.email}`, {
              category: u.category || 'undefined (defaults to agent-inbox)',
              status: u.status || 'undefined (defaults to active)',
              chatsCount: u.chats?.length || 0,
              matchesCategory: (u.category || 'agent-inbox') === 'agent-inbox',
              matchesStatus: (u.status || 'active').toLowerCase() === 'active',
              wouldMatch: (u.category || 'agent-inbox') === 'agent-inbox' && (u.status || 'active').toLowerCase() === 'active'
            });
          });
        }

        // Transform the filtered data to ChatInstance format
        // Use a Map to deduplicate chats by chat ID (same chat can be linked to multiple users)
        const chatMap = new Map<string, ChatInstance>();
        
        console.log(`🔄 Transforming ${filteredUsers.length} filtered users into ChatInstance format...`);

        filteredUsers.forEach((user: any) => {
          if (user.chats && user.chats.length > 0) {
            user.chats.forEach((chat: any) => {
              // Only include chats that match the categorization criteria
              const matches = matchesCategorization(user, chat, categorization);
              if (section === 'agent-inbox-active') {
                console.log(`  Checking chat ${chat.chat_id} for user ${user.email}: matches=${matches}`);
              }
              if (matches) {
                const chatId = chat.chat_id || chat.id;
                
                // If this chat already exists, merge or update it
                // Prefer keeping the chat with more messages or the most recent user data
                const existingChat = chatMap.get(chatId);
                const chatMessagesCount = (chat.messages || []).length;
                const existingMessagesCount = existingChat?.messages?.length || 0;
                
                // Only replace if this chat has more messages, or if it doesn't exist yet
                if (!existingChat || chatMessagesCount > existingMessagesCount) {
                const chatInstance: ChatInstance = {
                  chat: {
                      id: chatId,
                    name: user.name || "Unknown User",
                    lastMessage: chat.messages && chat.messages.length > 0 
                      ? (chat.messages[chat.messages.length - 1].text || 
                         chat.messages[chat.messages.length - 1].content || 
                         "No messages")
                      : "No messages",
                    timestamp: chat.last_activity || chat.created_at || new Date().toISOString(),
                    unreadCount: chat.messages?.filter((m: any) => !m.read).length || 0,
                    avatar: user.avatar || user.name?.charAt(0).toUpperCase() || "U",
                    status: chat.status === "active" ? "online" : "offline",
                    section: section,
                  },
                  messages: (chat.messages || []).map((msg: any, index: number) => ({
                    id: msg._id || msg.id || `msg-${index}`,
                    content: msg.text || msg.content || "",
                    sender: msg.role === "assistant" || msg.role === "agent" ? "Agent" : user.name || "User",
                    timestamp: msg.timestamp || new Date().toISOString(),
                    isRead: msg.read !== undefined ? msg.read : true,
                    avatar: msg.role === "assistant" || msg.role === "agent" ? "A" : user.name?.charAt(0).toUpperCase() || "U",
                  })),
                  contactInfo: {
                    name: user.name || "Unknown User",
                    email: user.email || "",
                    location: user.location 
                      ? `${user.location.city || "Unknown"}, ${user.location.country || "Unknown"}`
                      : "Unknown Location",
                    avatar: user.avatar || user.name?.charAt(0).toUpperCase() || "U",
                    status: chat.status === "active" ? "Online" : "Offline",
                    chatId: chat.chat_id || chat.id,
                    chatDuration: "0m", // Calculate from timestamps if needed
                    totalMessages: chat.total_messages || chat.messages?.length || 0,
                    archivedCount: 0,
                    visitedPagesCount: 0,
                    tags: chat.tags || [],
                    visitedPages: [
                      { url: user.referrer || "https://example.com", title: "Landing Page", timestamp: "2m ago" }
                    ],
                  },
                  backendUserData: {
                    name: user.name || "Unknown User",
                    email: user.email || "",
                    ip: user.ip || "Unknown",
                    location: user.location || { 
                      city: "Unknown", 
                      region: "Unknown", 
                      country: "Unknown", 
                      timezone: "Unknown" 
                    },
                    device: user.device || { 
                      type: user.device?.type || user.device?.platform || "Unknown", 
                      os: user.device?.os || user.device?.platform || "Unknown", 
                      browser: user.device?.browser || user.device?.userAgent || "Unknown" 
                    },
                    referrer: user.referrer || "https://example.com",
                    utm: user.utm || { source: "", medium: "", campaign: "", term: "", content: "" },
                  },
                };

                chatMap.set(chatId, chatInstance);
                if (section === 'agent-inbox-active') {
                  console.log(`  ✅ Added chat ${chatId} to map (${chatMessagesCount} messages, user: ${user.email})`);
                }
                }
              }
            });
          }
        });

        // Convert Map to array (deduplicated chats)
        const transformedChats = Array.from(chatMap.values());
        
        console.log(`✅ Final result: ${transformedChats.length} unique chats from ${filteredUsers.length} users`);
        if (section === 'agent-inbox-active') {
          console.log(`📋 Chat IDs:`, transformedChats.map(c => c.chat.id));
          console.log(`📋 Chat names:`, transformedChats.map(c => c.chat.name));
        }
        
        if (section === 'agent-inbox-active' && chatMap.size !== transformedChats.length) {
          console.log(`🔄 Deduplicated chats: had ${chatMap.size + transformedChats.length - chatMap.size} duplicates`);
        }

        setChats(transformedChats);
        
        // Set the first chat as selected by default
        if (transformedChats.length > 0) {
          setSelectedChat(transformedChats[0]);
        } else {
          setSelectedChat(null);
        }

        console.log(`🎉 Loaded ${transformedChats.length} chat instance(s) for section "${section}"`);
        if (section === 'agent-inbox-active' && transformedChats.length === 0) {
          console.warn('⚠️ NO CHATS LOADED for agent-inbox-active!');
          console.log('🔍 Debugging info:');
          console.log('  - Source data users:', sourceData.length);
          console.log('  - Filtered users:', filteredUsers.length);
          console.log('  - Categorization criteria:', categorization);
          if (filteredUsers.length > 0) {
            console.log('  - Filtered users have chats:', filteredUsers.map((u: any) => ({ name: u.name, chatsCount: u.chats?.length || 0 })));
          }
        }
      } catch (err) {
        console.error('❌ Error loading chats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chats');
        setChats([]);
        setSelectedChat(null);
      } finally {
        setLoading(false);
        console.log('✅ Loading complete');
      }
    };

    // Always load chats on mount/change, regardless of WebSocket status
    loadChats();

    // Subscribe to WebSocket updates for real-time changes (only if connected)
    if (isConnected) {
      const unsubscribe = subscribe('chat_updates', (data: any) => {
        console.log('📨 Received WebSocket chat update');
        
        if (data?.users) {
          // Process the WebSocket data similar to loadChats
          try {
            const categorization = CHAT_CATEGORIZATION[section as keyof typeof CHAT_CATEGORIZATION] || {};
            
            // Filter users based on dashboard_user_id (primary) or email (fallback), category and status
            const filteredUsers = data.users.filter((user: any) => {
              // Filter by dashboard_user_id first (if userId provided)
              if (userId && userEmail !== "admin@heirs.com" && userEmail !== "agent@heirs.com") {
                const userDashboardUserId = user.dashboard_user_id || '';
                if (userDashboardUserId !== userId && String(userDashboardUserId) !== String(userId)) {
                  // Fallback to email if dashboard_user_id doesn't match
                  if (user.email?.toLowerCase() !== userEmail.toLowerCase()) {
                    return false;
                  }
                }
              } else if (userEmail && userEmail !== "admin@heirs.com" && userEmail !== "agent@heirs.com") {
                // Fallback to email filtering if userId not provided
                if (user.email?.toLowerCase() !== userEmail.toLowerCase()) {
                  return false;
                }
              }
              
              if (!user.chats || user.chats.length === 0) {
                return false;
              }
              
              const hasMatchingChats = user.chats.some((chat: any) => {
                return matchesCategorization(user, chat, categorization);
              });

              return hasMatchingChats;
            });

            // Transform the filtered data to ChatInstance format
            // Use a Map to deduplicate chats by chat ID (same chat can be linked to multiple users)
            const chatMap = new Map<string, ChatInstance>();

            filteredUsers.forEach((user: any) => {
              if (user.chats && user.chats.length > 0) {
                user.chats.forEach((chat: any) => {
                  if (matchesCategorization(user, chat, categorization)) {
                    const chatId = chat.chat_id || chat.id;
                    
                    // If this chat already exists, merge or update it
                    // Prefer keeping the chat with more messages or the most recent user data
                    const existingChat = chatMap.get(chatId);
                    const chatMessagesCount = (chat.messages || []).length;
                    const existingMessagesCount = existingChat?.messages?.length || 0;
                    
                    // Only replace if this chat has more messages, or if it doesn't exist yet
                    if (!existingChat || chatMessagesCount > existingMessagesCount) {
                      const chatInstance: ChatInstance = {
                        chat: {
                          id: chatId,
                        name: user.name || "Unknown User",
                        lastMessage: chat.messages && chat.messages.length > 0 
                          ? (chat.messages[chat.messages.length - 1].text || 
                             chat.messages[chat.messages.length - 1].content || 
                             "No messages")
                          : "No messages",
                        timestamp: chat.last_activity || chat.created_at || new Date().toISOString(),
                        unreadCount: chat.messages?.filter((m: any) => !m.read).length || 0,
                        avatar: user.avatar || user.name?.charAt(0).toUpperCase() || "U",
                        status: chat.status === "active" ? "online" : "offline",
                        section: section,
                      },
                      messages: (chat.messages || []).map((msg: any, index: number) => ({
                        id: msg._id || msg.id || `msg-${index}`,
                        content: msg.text || msg.content || "",
                        sender: msg.role === "assistant" || msg.role === "agent" ? "Agent" : user.name || "User",
                        timestamp: msg.timestamp || new Date().toISOString(),
                        isRead: msg.read !== undefined ? msg.read : true,
                        avatar: msg.role === "assistant" || msg.role === "agent" ? "A" : user.name?.charAt(0).toUpperCase() || "U",
                      })),
                      contactInfo: {
                        name: user.name || "Unknown User",
                        email: user.email || "",
                        location: user.location 
                          ? `${user.location.city || "Unknown"}, ${user.location.country || "Unknown"}`
                          : "Unknown Location",
                        avatar: user.avatar || user.name?.charAt(0).toUpperCase() || "U",
                        status: chat.status === "active" ? "Online" : "Offline",
                        chatId: chat.chat_id || chat.id,
                        chatDuration: "0m",
                        totalMessages: chat.total_messages || chat.messages?.length || 0,
                        archivedCount: 0,
                        visitedPagesCount: 0,
                        tags: chat.tags || [],
                        visitedPages: [
                          { url: user.referrer || "https://example.com", title: "Landing Page", timestamp: "2m ago" }
                        ],
                      },
                      backendUserData: {
                        name: user.name || "Unknown User",
                        email: user.email || "",
                        ip: user.ip || "Unknown",
                        location: user.location || { 
                          city: "Unknown", 
                          region: "Unknown", 
                          country: "Unknown", 
                          timezone: "Unknown" 
                        },
                        device: user.device || { 
                          type: user.device?.type || user.device?.platform || "Unknown", 
                          os: user.device?.os || user.device?.platform || "Unknown", 
                          browser: user.device?.browser || user.device?.userAgent || "Unknown" 
                        },
                        referrer: user.referrer || "https://example.com",
                        utm: user.utm || { source: "", medium: "", campaign: "", term: "", content: "" },
                      },
                    };

                    chatMap.set(chatId, chatInstance);
                    }
                  }
                });
              }
            });

            // Convert Map to array (deduplicated chats)
            const transformedChats = Array.from(chatMap.values());

            setChats(transformedChats);
            
            // Keep selected chat if it still exists
            if (selectedChat) {
              const stillExists = transformedChats.find(c => c.chat.id === selectedChat.chat.id);
              if (stillExists) {
                setSelectedChat(stillExists);
              } else if (transformedChats.length > 0) {
                setSelectedChat(transformedChats[0]);
              } else {
                setSelectedChat(null);
              }
            } else if (transformedChats.length > 0) {
              setSelectedChat(transformedChats[0]);
            }
          } catch (err) {
            console.error('Error processing WebSocket chat update:', err);
          }
        }
      });

    return () => {
        unsubscribe();
    };
    }
    }, [inboxType, userEmail, userId, section, isConnected, subscribe]);

  // Debug: Log when loading state changes
  useEffect(() => {
    console.log(`🔄 Loading state changed: ${loading}, Error: ${error}, Chats: ${chats.length}`);
  }, [loading, error, chats.length]);

  const sendMessage = async (message: string) => {
    if (!selectedChat) return;

    const chatId = selectedChat.chat.id;
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:8000"
        : "https://sakura-backend.onrender.com");

    // Optimistically update UI first
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      sender: userEmail.includes('agent') ? 'Agent' : 'You',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      avatar: userEmail.includes('agent') ? 'A' : selectedChat.contactInfo.avatar,
    };

    // Update the selected chat with the new message
    setSelectedChat(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        chat: {
          ...prev.chat,
          lastMessage: message,
          timestamp: 'now',
        },
      };
    });

    // Update the chat in the chats list
    setChats(prev => 
      prev.map(chat => 
        chat.chat.id === selectedChat.chat.id 
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              chat: {
                ...chat.chat,
                lastMessage: message,
                timestamp: 'now',
              },
            }
          : chat
      )
    );

    // Send message to backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/chats/${chatId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message,
          role: userEmail.includes('agent') || userEmail.includes('admin') ? 'assistant' : 'user',
        }),
        mode: "cors",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to send message to backend: ${response.status} - ${errorText}`);
        // Optionally show error to user or revert the optimistic update
        throw new Error(`Failed to send message: ${response.status}`);
      }

      console.log(`✅ Message sent successfully to chat ${chatId}`);
      
      // Optionally refresh the chat to get the latest messages from backend
      // This ensures we have the exact message structure from the database
      
    } catch (error: any) {
      console.error("❌ Error sending message to backend:", error);
      // The message is already in the UI, but we could show an error notification
      // or revert the optimistic update if desired
    }
  };

  const markAsRead = (chatId: string) => {
    setChats(prev => 
      prev.map(chat => 
        chat.chat.id === chatId 
          ? { ...chat, chat: { ...chat.chat, unreadCount: 0 } }
          : chat
      )
    );
  };

  return {
    chats,
    selectedChat,
    setSelectedChat,
    sendMessage,
    markAsRead,
    loading,
    error,
  };
};