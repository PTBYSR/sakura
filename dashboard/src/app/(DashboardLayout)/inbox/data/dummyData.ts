export interface DummyUserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  section: string;
  status: string;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
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
  chat: {
    messages: Array<{
      id: string;
      content: string;
      sender: string;
      timestamp: string;
    }>;
    duration: string;
    tags: string[];
    totalMessages: number;
  };
  lastSeen: string;
  assignedAgent: string;
  inboxType: string;
  chatCategory: string;
}

export const dummyData: DummyUserData[] = [
  {
    "id": "chat-001",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Alice%20Johnson",
    "section": "my-inbox",
    "status": "active",
    "lastMessage": "Can you explain the charges on my last invoice?",
    "unreadCount": 1,
    "timestamp": "2m ago",
    "location": {
      "city": "London",
      "region": "England",
      "country": "UK",
      "timezone": "Europe/London"
    },
    "device": {
      "type": "desktop",
      "os": "Windows 11",
      "browser": "Edge 118"
    },
    "referrer": "https://www.google.com/search?q=chat+software",
    "utm": {
      "source": "google",
      "medium": "organic",
      "campaign": "none",
      "term": "chat+software",
      "content": "none"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "Hi, I have a question about my billing.", "sender": "Alice Johnson", "timestamp": "10:15 AM" },
        { "id": "msg-2", "content": "Hello! I'd be happy to help with your billing question.", "sender": "Agent", "timestamp": "10:16 AM" },
        { "id": "msg-3", "content": "Can you explain the charges on my last invoice?", "sender": "Alice Johnson", "timestamp": "10:17 AM" }
      ],
      "duration": "6m 22s",
      "tags": ["Billing", "Invoice"],
      "totalMessages": 3
    },
    "lastSeen": "2m ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "my-chats"
  },
  {
    "id": "chat-002",
    "name": "Bob Smith",
    "email": "bob.smith@company.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Bob%20Smith",
    "section": "my-inbox",
    "status": "active",
    "lastMessage": "This is urgent! The system is completely down!",
    "unreadCount": 3,
    "timestamp": "5m ago",
    "location": {
      "city": "New York",
      "region": "New York",
      "country": "USA",
      "timezone": "America/New_York"
    },
    "device": {
      "type": "desktop",
      "os": "macOS Ventura",
      "browser": "Chrome 118"
    },
    "referrer": "https://app.company.com/dashboard",
    "utm": {
      "source": "direct",
      "medium": "none",
      "campaign": "none",
      "term": "none",
      "content": "none"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "There's a critical bug on your dashboard! When I click the reports button, it crashes.", "sender": "Bob Smith", "timestamp": "9:45 AM" },
        { "id": "msg-2", "content": "I apologize for that, Bob. Could you please provide more details?", "sender": "Agent", "timestamp": "9:46 AM" },
        { "id": "msg-3", "content": "Chrome, latest version. I go to 'Reports', click 'Generate', and then it freezes.", "sender": "Bob Smith", "timestamp": "9:47 AM" },
        { "id": "msg-4", "content": "Thank you for the detailed report. I've escalated this to our technical team.", "sender": "Agent", "timestamp": "9:48 AM" },
        { "id": "msg-5", "content": "This is urgent! The system is completely down!", "sender": "Bob Smith", "timestamp": "9:50 AM" }
      ],
      "duration": "8m 15s",
      "tags": ["Bug Report", "Technical Issue", "Escalated"],
      "totalMessages": 5
    },
    "lastSeen": "5m ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "escalated"
  },
  {
    "id": "chat-003",
    "name": "Carol White",
    "email": "carol.white@example.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Carol%20White",
    "section": "my-inbox",
    "status": "resolved",
    "lastMessage": "Perfect, thank you!",
    "unreadCount": 0,
    "timestamp": "1h ago",
    "location": {
      "city": "Toronto",
      "region": "Ontario",
      "country": "Canada",
      "timezone": "America/Toronto"
    },
    "device": {
      "type": "mobile",
      "os": "iOS 17",
      "browser": "Safari 17"
    },
    "referrer": "https://www.bing.com/search?q=customer+support+software",
    "utm": {
      "source": "bing",
      "medium": "cpc",
      "campaign": "brand_awareness",
      "term": "live+chat",
      "content": "ad_banner_top"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "We're loving the Pro plan and want to upgrade to Business.", "sender": "Carol White", "timestamp": "8:30 AM" },
        { "id": "msg-2", "content": "Fantastic news, Carol! I can help you with that. Are you looking to upgrade immediately or at the end of your current billing cycle?", "sender": "Agent", "timestamp": "8:31 AM" },
        { "id": "msg-3", "content": "Immediately, please. We need the extra features now.", "sender": "Carol White", "timestamp": "8:32 AM" },
        { "id": "msg-4", "content": "Understood. I've initiated the upgrade process. You'll receive a confirmation email shortly.", "sender": "Agent", "timestamp": "8:33 AM" },
        { "id": "msg-5", "content": "Perfect, thank you!", "sender": "Carol White", "timestamp": "8:34 AM" }
      ],
      "duration": "4m 30s",
      "tags": ["Upgrade", "Subscription", "Resolved"],
      "totalMessages": 5
    },
    "lastSeen": "1h ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "resolved"
  },
  {
    "id": "chat-004",
    "name": "David Green",
    "email": "david.green@techcorp.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=David%20Green",
    "section": "agent-inbox",
    "status": "active",
    "lastMessage": "I need help with pricing information.",
    "unreadCount": 1,
    "timestamp": "3m ago",
    "location": {
      "city": "Seattle",
      "region": "Washington",
      "country": "USA",
      "timezone": "America/Los_Angeles"
    },
    "device": {
      "type": "desktop",
      "os": "macOS Sonoma",
      "browser": "Chrome 118"
    },
    "referrer": "https://www.g2.com/categories/live-chat",
    "utm": {
      "source": "g2",
      "medium": "referral",
      "campaign": "competitor_analysis",
      "term": "ai+chat+software",
      "content": "comparison_table"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "Hello, I'm looking for information about your services.", "sender": "David Green", "timestamp": "11:20 AM" },
        { "id": "msg-2", "content": "Hello! I'm an AI assistant. I'd be happy to provide information about our services. What specific area are you interested in?", "sender": "AI Agent", "timestamp": "11:21 AM" },
        { "id": "msg-3", "content": "I need help with pricing information.", "sender": "David Green", "timestamp": "11:22 AM" }
      ],
      "duration": "3m 45s",
      "tags": ["Pricing Inquiry", "AI Active"],
      "totalMessages": 3
    },
    "lastSeen": "3m ago",
    "assignedAgent": "ai",
    "inboxType": "agent-inbox",
    "chatCategory": "active"
  },
  {
    "id": "chat-005",
    "name": "Eva Brown",
    "email": "eva.brown@example.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Eva%20Brown",
    "section": "agent-inbox",
    "status": "resolved",
    "lastMessage": "No, that's all. Thanks again!",
    "unreadCount": 0,
    "timestamp": "45m ago",
    "location": {
      "city": "Vancouver",
      "region": "British Columbia",
      "country": "Canada",
      "timezone": "America/Vancouver"
    },
    "device": {
      "type": "desktop",
      "os": "Windows 11",
      "browser": "Chrome 118"
    },
    "referrer": "https://www.example.com/docs",
    "utm": {
      "source": "website",
      "medium": "internal",
      "campaign": "none",
      "term": "none",
      "content": "docs_link"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "Hi, I need help with my account.", "sender": "Eva Brown", "timestamp": "10:00 AM" },
        { "id": "msg-2", "content": "Hello! I'm an AI assistant. I can help you with your account. What specific issue are you experiencing?", "sender": "AI Agent", "timestamp": "10:01 AM" },
        { "id": "msg-3", "content": "I can't log in to my dashboard.", "sender": "Eva Brown", "timestamp": "10:02 AM" },
        { "id": "msg-4", "content": "I can help you with that. Let me guide you through the login process. First, please try clearing your browser cache.", "sender": "AI Agent", "timestamp": "10:03 AM" },
        { "id": "msg-5", "content": "That worked! Thank you so much.", "sender": "Eva Brown", "timestamp": "10:04 AM" },
        { "id": "msg-6", "content": "You're welcome! Is there anything else I can help you with today?", "sender": "AI Agent", "timestamp": "10:05 AM" },
        { "id": "msg-7", "content": "No, that's all. Thanks again!", "sender": "Eva Brown", "timestamp": "10:06 AM" }
      ],
      "duration": "6m 15s",
      "tags": ["Login Issue", "Resolved", "AI Assisted"],
      "totalMessages": 7
    },
    "lastSeen": "45m ago",
    "assignedAgent": "ai",
    "inboxType": "agent-inbox",
    "chatCategory": "resolved"
  },
  {
    "id": "chat-006",
    "name": "Frank Black",
    "email": "frank.black@enterprise.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Frank%20Black",
    "section": "my-inbox",
    "status": "active",
    "lastMessage": "I'm having trouble with the setup process.",
    "unreadCount": 2,
    "timestamp": "7m ago",
    "location": {
      "city": "Berlin",
      "region": "Berlin",
      "country": "Germany",
      "timezone": "Europe/Berlin"
    },
    "device": {
      "type": "desktop",
      "os": "Windows 10",
      "browser": "Firefox 119"
    },
    "referrer": "https://app.example.com/settings/api",
    "utm": {
      "source": "app",
      "medium": "internal",
      "campaign": "none",
      "term": "none",
      "content": "api_docs_link"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "I'm trying to integrate your chat with our custom CRM. I'm having trouble with the API key.", "sender": "Frank Black", "timestamp": "11:10 AM" },
        { "id": "msg-2", "content": "Hi Frank. Can you confirm you're using the correct API endpoint and that your key has the necessary permissions?", "sender": "Agent", "timestamp": "11:11 AM" },
        { "id": "msg-3", "content": "Yes, I've checked both. I'm getting a 401 Unauthorized error.", "sender": "Frank Black", "timestamp": "11:12 AM" },
        { "id": "msg-4", "content": "It sounds like an authentication issue. Let's double-check your API key generation process. I can guide you through it.", "sender": "Agent", "timestamp": "11:13 AM" },
        { "id": "msg-5", "content": "I'm having trouble with the setup process.", "sender": "Frank Black", "timestamp": "11:15 AM" }
      ],
      "duration": "8m 20s",
      "tags": ["Integration", "API Key", "Technical Support"],
      "totalMessages": 5
    },
    "lastSeen": "7m ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "my-chats"
  },
  {
    "id": "chat-007",
    "name": "Grace Lee",
    "email": "grace.lee@startup.io",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Grace%20Lee",
    "section": "my-inbox",
    "status": "active",
    "lastMessage": "This is urgent! I need immediate help!",
    "unreadCount": 4,
    "timestamp": "1m ago",
    "location": {
      "city": "Tokyo",
      "region": "Tokyo",
      "country": "Japan",
      "timezone": "Asia/Tokyo"
    },
    "device": {
      "type": "mobile",
      "os": "Android 13",
      "browser": "Chrome 118"
    },
    "referrer": "https://www.google.com/",
    "utm": {
      "source": "direct",
      "medium": "none",
      "campaign": "none",
      "term": "none",
      "content": "none"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "There's a critical bug on your dashboard! When I click the reports button, it crashes.", "sender": "Grace Lee", "timestamp": "12:30 PM" },
        { "id": "msg-2", "content": "I apologize for that, Grace. Could you please provide more details?", "sender": "Agent", "timestamp": "12:31 PM" },
        { "id": "msg-3", "content": "Chrome, latest version. I go to 'Reports', click 'Generate', and then it freezes.", "sender": "Grace Lee", "timestamp": "12:32 PM" },
        { "id": "msg-4", "content": "Thank you for the detailed report. I've escalated this to our technical team.", "sender": "Agent", "timestamp": "12:33 PM" },
        { "id": "msg-5", "content": "This is urgent! I need immediate help!", "sender": "Grace Lee", "timestamp": "12:35 PM" }
      ],
      "duration": "5m 10s",
      "tags": ["Bug Report", "Technical Issue", "Escalated", "Urgent"],
      "totalMessages": 5
    },
    "lastSeen": "1m ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "escalated"
  },
  {
    "id": "chat-008",
    "name": "Henry Wilson",
    "email": "henry.wilson@agency.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Henry%20Wilson",
    "section": "my-inbox",
    "status": "resolved",
    "lastMessage": "Thanks.",
    "unreadCount": 0,
    "timestamp": "2h ago",
    "location": {
      "city": "Manchester",
      "region": "England",
      "country": "UK",
      "timezone": "Europe/London"
    },
    "device": {
      "type": "desktop",
      "os": "macOS Sonoma",
      "browser": "Safari 17"
    },
    "referrer": "https://www.capterra.com/live-chat-software/",
    "utm": {
      "source": "capterra",
      "medium": "referral",
      "campaign": "software_comparison",
      "term": "live+chat+customization",
      "content": "review_site_link"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "I'd like to close my account.", "sender": "Henry Wilson", "timestamp": "9:00 AM" },
        { "id": "msg-2", "content": "I'm sorry to see you go, Henry. Could you please confirm your decision and provide a brief reason for your departure?", "sender": "Agent", "timestamp": "9:01 AM" },
        { "id": "msg-3", "content": "Yes, I confirm. We're moving to a different platform.", "sender": "Henry Wilson", "timestamp": "9:02 AM" },
        { "id": "msg-4", "content": "Understood. I've processed your account deletion request. Your data will be permanently removed within 30 days.", "sender": "Agent", "timestamp": "9:03 AM" },
        { "id": "msg-5", "content": "Thanks.", "sender": "Henry Wilson", "timestamp": "9:04 AM" }
      ],
      "duration": "4m 40s",
      "tags": ["Account Deletion", "Churn", "Resolved"],
      "totalMessages": 5
    },
    "lastSeen": "2h ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "resolved"
  },
  {
    "id": "chat-009",
    "name": "Ivy King",
    "email": "ivy.king@brand.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Ivy%20King",
    "section": "agent-inbox",
    "status": "active",
    "lastMessage": "What's the difference between the Pro and Business plans?",
    "unreadCount": 1,
    "timestamp": "4m ago",
    "location": {
      "city": "Madrid",
      "region": "Community of Madrid",
      "country": "Spain",
      "timezone": "Europe/Madrid"
    },
    "device": {
      "type": "desktop",
      "os": "Windows 11",
      "browser": "Chrome 118"
    },
    "referrer": "https://app.example.com/dashboard",
    "utm": {
      "source": "app",
      "medium": "internal",
      "campaign": "none",
      "term": "none",
      "content": "none"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "I'm interested in learning more about your new features.", "sender": "Ivy King", "timestamp": "1:15 PM" },
        { "id": "msg-2", "content": "Hello! I'm an AI assistant. I'd be happy to show you our latest features. What specific area interests you most?", "sender": "AI Agent", "timestamp": "1:16 PM" },
        { "id": "msg-3", "content": "What's the difference between the Pro and Business plans?", "sender": "Ivy King", "timestamp": "1:17 PM" }
      ],
      "duration": "3m 20s",
      "tags": ["Feature Inquiry", "Pricing", "AI Active"],
      "totalMessages": 3
    },
    "lastSeen": "4m ago",
    "assignedAgent": "ai",
    "inboxType": "agent-inbox",
    "chatCategory": "active"
  },
  {
    "id": "chat-010",
    "name": "Jack Taylor",
    "email": "jack.taylor@example.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Jack%20Taylor",
    "section": "agent-inbox",
    "status": "resolved",
    "lastMessage": "Got it, thanks for clarifying.",
    "unreadCount": 0,
    "timestamp": "30m ago",
    "location": {
      "city": "Rome",
      "region": "Lazio",
      "country": "Italy",
      "timezone": "Europe/Rome"
    },
    "device": {
      "type": "desktop",
      "os": "macOS Sonoma",
      "browser": "Safari 17"
    },
    "referrer": "https://www.google.com/search?q=live+chat+pricing",
    "utm": {
      "source": "google",
      "medium": "cpc",
      "campaign": "pricing_comparison",
      "term": "live+chat+pricing",
      "content": "ad_text_1"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "Hi, I'm looking at your pricing page. What's the difference between the Pro and Business plans?", "sender": "Jack Taylor", "timestamp": "11:45 AM" },
        { "id": "msg-2", "content": "Hello Jack! I'm an AI assistant. The main differences lie in user capacity, advanced analytics, and dedicated support. The Business plan offers priority support and custom integrations.", "sender": "AI Agent", "timestamp": "11:46 AM" },
        { "id": "msg-3", "content": "So, for 10 agents, Pro would be enough?", "sender": "Jack Taylor", "timestamp": "11:47 AM" },
        { "id": "msg-4", "content": "Yes, the Pro plan supports up to 15 agents. The Business plan is for larger teams or enterprises with 50+ agents.", "sender": "AI Agent", "timestamp": "11:48 AM" },
        { "id": "msg-5", "content": "Got it, thanks for clarifying.", "sender": "Jack Taylor", "timestamp": "11:49 AM" }
      ],
      "duration": "4m 30s",
      "tags": ["Pricing", "Plan Comparison", "Resolved", "AI Assisted"],
      "totalMessages": 5
    },
    "lastSeen": "30m ago",
    "assignedAgent": "ai",
    "inboxType": "agent-inbox",
    "chatCategory": "resolved"
  },
  {
    "id": "chat-011",
    "name": "Karen Moore",
    "email": "karen.moore@example.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Karen%20Moore",
    "section": "my-inbox",
    "status": "active",
    "lastMessage": "I need some additional information...",
    "unreadCount": 1,
    "timestamp": "6m ago",
    "location": {
      "city": "Stockholm",
      "region": "Stockholm County",
      "country": "Sweden",
      "timezone": "Europe/Stockholm"
    },
    "device": {
      "type": "desktop",
      "os": "Linux",
      "browser": "Firefox 119"
    },
    "referrer": "https://www.example.com/features/security",
    "utm": {
      "source": "website",
      "medium": "internal",
      "campaign": "none",
      "term": "none",
      "content": "security_link"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "I have some questions about your data privacy policy.", "sender": "Karen Moore", "timestamp": "2:00 PM" },
        { "id": "msg-2", "content": "Certainly, Karen. We take data privacy very seriously. What specific concerns do you have?", "sender": "Agent", "timestamp": "2:01 PM" },
        { "id": "msg-3", "content": "Where is customer data stored, and is it GDPR compliant?", "sender": "Karen Moore", "timestamp": "2:02 PM" },
        { "id": "msg-4", "content": "Our data centers are located in EU and US regions, and we are fully GDPR compliant. You can find more details in our Privacy Policy.", "sender": "Agent", "timestamp": "2:03 PM" },
        { "id": "msg-5", "content": "I need some additional information...", "sender": "Karen Moore", "timestamp": "2:05 PM" }
      ],
      "duration": "5m 50s",
      "tags": ["Data Privacy", "GDPR", "Security"],
      "totalMessages": 5
    },
    "lastSeen": "6m ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "my-chats"
  },
  {
    "id": "chat-012",
    "name": "Liam Hall",
    "email": "liam.hall@company.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Liam%20Hall",
    "section": "my-inbox",
    "status": "resolved",
    "lastMessage": "That would be great.",
    "unreadCount": 0,
    "timestamp": "1h 30m ago",
    "location": {
      "city": "Dublin",
      "region": "County Dublin",
      "country": "Ireland",
      "timezone": "Europe/Dublin"
    },
    "device": {
      "type": "desktop",
      "os": "macOS Ventura",
      "browser": "Firefox 119"
    },
    "referrer": "https://app.example.com/settings/api",
    "utm": {
      "source": "app",
      "medium": "internal",
      "campaign": "none",
      "term": "none",
      "content": "api_docs_link"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "I'm trying to integrate your chat with our custom CRM. I'm having trouble with the API key.", "sender": "Liam Hall", "timestamp": "10:30 AM" },
        { "id": "msg-2", "content": "Hi Liam. Can you confirm you're using the correct API endpoint and that your key has the necessary permissions?", "sender": "Agent", "timestamp": "10:31 AM" },
        { "id": "msg-3", "content": "Yes, I've checked both. I'm getting a 401 Unauthorized error.", "sender": "Liam Hall", "timestamp": "10:32 AM" },
        { "id": "msg-4", "content": "It sounds like an authentication issue. Let's double-check your API key generation process. I can guide you through it.", "sender": "Agent", "timestamp": "10:33 AM" },
        { "id": "msg-5", "content": "That would be great.", "sender": "Liam Hall", "timestamp": "10:34 AM" }
      ],
      "duration": "4m 20s",
      "tags": ["Integration", "API Key", "Technical Support", "Resolved"],
      "totalMessages": 5
    },
    "lastSeen": "1h 30m ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "resolved"
  },
  {
    "id": "chat-013",
    "name": "Mia Clark",
    "email": "mia.clark@example.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Mia%20Clark",
    "section": "agent-inbox",
    "status": "active",
    "lastMessage": "Perfect, thank you!",
    "unreadCount": 0,
    "timestamp": "8m ago",
    "location": {
      "city": "Amsterdam",
      "region": "North Holland",
      "country": "Netherlands",
      "timezone": "Europe/Amsterdam"
    },
    "device": {
      "type": "desktop",
      "os": "Windows 10",
      "browser": "Chrome 118"
    },
    "referrer": "https://app.example.com/dashboard/billing",
    "utm": {
      "source": "app",
      "medium": "internal",
      "campaign": "none",
      "term": "none",
      "content": "upgrade_button"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "We're loving the Pro plan and want to upgrade to Business.", "sender": "Mia Clark", "timestamp": "12:45 PM" },
        { "id": "msg-2", "content": "Hello! I'm an AI assistant. Fantastic news, Mia! I can help you with that. Are you looking to upgrade immediately or at the end of your current billing cycle?", "sender": "AI Agent", "timestamp": "12:46 PM" },
        { "id": "msg-3", "content": "Immediately, please. We need the extra features now.", "sender": "Mia Clark", "timestamp": "12:47 PM" },
        { "id": "msg-4", "content": "Understood. I've initiated the upgrade process. You'll receive a confirmation email shortly.", "sender": "AI Agent", "timestamp": "12:48 PM" },
        { "id": "msg-5", "content": "Perfect, thank you!", "sender": "Mia Clark", "timestamp": "12:49 PM" }
      ],
      "duration": "4m 55s",
      "tags": ["Upgrade", "Subscription", "AI Active"],
      "totalMessages": 5
    },
    "lastSeen": "8m ago",
    "assignedAgent": "ai",
    "inboxType": "agent-inbox",
    "chatCategory": "active"
  },
  {
    "id": "chat-014",
    "name": "Noah Lewis",
    "email": "noah.lewis@example.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Noah%20Lewis",
    "section": "my-inbox",
    "status": "active",
    "lastMessage": "Any ETA?",
    "unreadCount": 2,
    "timestamp": "3m ago",
    "location": {
      "city": "Austin",
      "region": "Texas",
      "country": "USA",
      "timezone": "America/Chicago"
    },
    "device": {
      "type": "mobile",
      "os": "Android 13",
      "browser": "Chrome 118"
    },
    "referrer": "https://www.google.com/",
    "utm": {
      "source": "direct",
      "medium": "none",
      "campaign": "none",
      "term": "none",
      "content": "none"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "Is your service down? I can't access anything.", "sender": "Noah Lewis", "timestamp": "3:15 PM" },
        { "id": "msg-2", "content": "I apologize for the inconvenience, Noah. We are currently experiencing a minor service interruption. Our team is actively working on a fix.", "sender": "Agent", "timestamp": "3:16 PM" },
        { "id": "msg-3", "content": "Any ETA?", "sender": "Noah Lewis", "timestamp": "3:17 PM" }
      ],
      "duration": "3m 10s",
      "tags": ["Downtime", "Service Interruption", "Escalated"],
      "totalMessages": 3
    },
    "lastSeen": "3m ago",
    "assignedAgent": "human",
    "inboxType": "my-inbox",
    "chatCategory": "escalated"
  },
  {
    "id": "chat-015",
    "name": "Olivia Scott",
    "email": "olivia.scott@brand.com",
    "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Olivia%20Scott",
    "section": "agent-inbox",
    "status": "resolved",
    "lastMessage": "Good to know.",
    "unreadCount": 0,
    "timestamp": "2h 15m ago",
    "location": {
      "city": "Manchester",
      "region": "England",
      "country": "UK",
      "timezone": "Europe/London"
    },
    "device": {
      "type": "desktop",
      "os": "macOS Sonoma",
      "browser": "Safari 17"
    },
    "referrer": "https://www.capterra.com/live-chat-software/",
    "utm": {
      "source": "capterra",
      "medium": "referral",
      "campaign": "software_comparison",
      "term": "live+chat+customization",
      "content": "review_site_link"
    },
    "chat": {
      "messages": [
        { "id": "msg-1", "content": "Can your chat widget be customized to match our brand's look and feel?", "sender": "Olivia Scott", "timestamp": "9:30 AM" },
        { "id": "msg-2", "content": "Hello! I'm an AI assistant. Absolutely, Olivia! Our widget offers extensive customization options for colors, fonts, and even custom CSS. We can help you achieve your desired look.", "sender": "AI Agent", "timestamp": "9:31 AM" },
        { "id": "msg-3", "content": "That's important for us. Do you offer white-labeling?", "sender": "Olivia Scott", "timestamp": "9:32 AM" },
        { "id": "msg-4", "content": "Yes, white-labeling is available with our Enterprise plan.", "sender": "AI Agent", "timestamp": "9:33 AM" },
        { "id": "msg-5", "content": "Good to know.", "sender": "Olivia Scott", "timestamp": "9:34 AM" }
      ],
      "duration": "4m 0s",
      "tags": ["Pre-sales", "Customization", "White-label", "Resolved", "AI Assisted"],
      "totalMessages": 5
    },
    "lastSeen": "2h 15m ago",
    "assignedAgent": "ai",
    "inboxType": "agent-inbox",
    "chatCategory": "resolved"
  }
];
