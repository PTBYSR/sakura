// Enhanced dummy data structure with section categorization
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  status: "online" | "offline" | "away";
  section: string; // New field for section identification
}

interface ContactInfo {
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
  visitedPages: { url: string; title: string; timestamp: string }[];
}

interface UserData {
  name: string;
  email: string;
  ip: string;
  location: { city: string; region: string; country: string; timezone: string };
  device: { type: "desktop" | "mobile" | "tablet"; os: string; browser: string };
  referrer: string;
  initialPage: string;
  utm: { source: string; medium: string; campaign: string; term: string; content: string };
}

interface SectionedChatInstance {
  chat: Chat;
  messages: Message[];
  contactInfo: ContactInfo;
  backendUserData: UserData;
}

// Helper functions
const uuidv4 = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
const getRandomMessageTime = (offsetMinutes: number) => {
  const date = new Date(Date.now() - offsetMinutes * 60 * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};
const getRandomChatTime = (offsetMinutes: number) => {
  if (offsetMinutes < 1) return "Now";
  if (offsetMinutes < 60) return `${offsetMinutes}m ago`;
  if (offsetMinutes < 24 * 60) return `${Math.floor(offsetMinutes / 60)}h ago`;
  return `${Math.floor(offsetMinutes / (24 * 60))}d ago`;
};
const getRandomIp = () => Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join('.');
const generateChatId = () => `T${uuidv4().replace(/-/g, '').substring(0, 10).toUpperCase()}`;
const getAvatarInitial = (name: string) => name.charAt(0).toUpperCase();

// Sectioned dummy chat instances organized by inbox sections
export const sectionedDummyChatInstances: SectionedChatInstance[] = [
  // MY INBOX - CHATS (12 chats)
  {
    chat: {
      id: "my-chat-1",
      name: "Paul Eme",
      lastMessage: "Feature X offers enhanced Z compared to Y's basic A.",
      timestamp: getRandomChatTime(15),
      unreadCount: 0,
      avatar: getAvatarInitial("Paul Eme"),
      status: "online",
      section: "my-inbox-chats"
    },
    messages: [
      { id: uuidv4(), content: "Hello", sender: "Paul Eme", timestamp: getRandomMessageTime(14), isRead: true, avatar: getAvatarInitial("Paul Eme") },
      { id: uuidv4(), content: "I'm interested in your new product. Can you tell me more about feature X?", sender: "Paul Eme", timestamp: getRandomMessageTime(13), isRead: true, avatar: getAvatarInitial("Paul Eme") },
      { id: uuidv4(), content: "Certainly, Paul! Feature X allows you to automate customer responses and provides intelligent routing based on customer intent.", sender: "You", timestamp: getRandomMessageTime(12), isRead: true, avatar: getAvatarInitial("You") },
      { id: uuidv4(), content: "That sounds great! How does it compare to competitor Y?", sender: "Paul Eme", timestamp: getRandomMessageTime(10), isRead: true, avatar: getAvatarInitial("Paul Eme") },
      { id: uuidv4(), content: "Feature X offers enhanced AI capabilities and better integration options compared to Y's basic automation.", sender: "You", timestamp: getRandomMessageTime(9), isRead: true, avatar: getAvatarInitial("You") },
    ],
    contactInfo: {
      name: "Paul Eme",
      email: "paul.emechebe@gmail.com",
      location: "The Netherlands",
      avatar: getAvatarInitial("Paul Eme"),
      status: "Chatting",
      chatId: generateChatId(),
      chatDuration: "15m 7s",
      totalMessages: 5,
      archivedCount: 0,
      visitedPagesCount: 2,
      tags: ["Product Inquiry", "New Feature"],
      visitedPages: [
        { url: "/product/new-feature", title: "New Product Feature", timestamp: "15m ago" },
        { url: "/pricing", title: "Pricing Plans", timestamp: "14m ago" },
      ],
    },
    backendUserData: {
      name: "Paul Eme",
      email: "paul.emechebe@gmail.com",
      ip: getRandomIp(),
      location: { city: "Amsterdam", region: "North Holland", country: "Netherlands", timezone: "Europe/Amsterdam" },
      device: { type: "desktop", os: "macOS Ventura", browser: "Chrome 118" },
      referrer: "https://www.google.com/search?q=new+product+features",
      initialPage: "/product/new-feature",
      utm: { source: "google", medium: "organic", campaign: "product_launch", term: "feature+x", content: "blog_post" },
    },
  },
  {
    chat: {
      id: "my-chat-2",
      name: "Alice Johnson",
      lastMessage: "Okay, I&apos;ll try that. Thanks!",
      timestamp: getRandomChatTime(8),
      unreadCount: 0,
      avatar: getAvatarInitial("Alice Johnson"),
      status: "online",
      section: "my-inbox-chats"
    },
    messages: [
      { id: uuidv4(), content: "Hi, I can&apos;t log into my account.", sender: "Alice Johnson", timestamp: getRandomMessageTime(7), isRead: true, avatar: getAvatarInitial("Alice Johnson") },
      { id: uuidv4(), content: "I apologize for the inconvenience, Alice. Can you describe the error message you&apos;re seeing?", sender: "You", timestamp: getRandomMessageTime(6), isRead: true, avatar: getAvatarInitial("You") },
      { id: uuidv4(), content: "It says 'Invalid credentials' even though I'm sure my password is correct.", sender: "Alice Johnson", timestamp: getRandomMessageTime(5), isRead: true, avatar: getAvatarInitial("Alice Johnson") },
      { id: uuidv4(), content: "Please try resetting your password using the 'Forgot Password' link. I've sent a reset link to your email.", sender: "You", timestamp: getRandomMessageTime(4), isRead: true, avatar: getAvatarInitial("You") },
      { id: uuidv4(), content: "Okay, I'll try that. Thanks!", sender: "Alice Johnson", timestamp: getRandomMessageTime(3), isRead: true, avatar: getAvatarInitial("Alice Johnson") },
    ],
    contactInfo: {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      location: "USA, California",
      avatar: getAvatarInitial("Alice Johnson"),
      status: "Chatting",
      chatId: generateChatId(),
      chatDuration: "8m 20s",
      totalMessages: 5,
      archivedCount: 0,
      visitedPagesCount: 2,
      tags: ["Technical Support", "Login Issue"],
      visitedPages: [
        { url: "/login", title: "Login Page", timestamp: "8m ago" },
        { url: "/support/password-reset", title: "Password Reset Guide", timestamp: "7m ago" },
      ],
    },
    backendUserData: {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      ip: getRandomIp(),
      location: { city: "San Francisco", region: "California", country: "USA", timezone: "America/Los_Angeles" },
      device: { type: "mobile", os: "iOS 17", browser: "Safari 17" },
      referrer: "https://app.example.com/dashboard",
      initialPage: "/login",
      utm: { source: "direct", medium: "none", campaign: "none", term: "none", content: "none" },
    },
  },
  // Additional MY INBOX - CHATS (10 more to reach 12 total)
  {
    chat: {
      id: "my-chat-3",
      name: "Bob Smith",
      lastMessage: "Ah, I see. Yes, please.",
      timestamp: getRandomChatTime(12),
      unreadCount: 0,
      avatar: getAvatarInitial("Bob Smith"),
      status: "online",
      section: "my-inbox-chats"
    },
    messages: [
      { id: uuidv4(), content: "Hello, I see a charge on my statement I don&apos;t recognize.", sender: "Bob Smith", timestamp: getRandomMessageTime(11), isRead: true, avatar: getAvatarInitial("Bob Smith") },
      { id: uuidv4(), content: "Could you please provide the transaction ID or the date of the charge, Bob?", sender: "You", timestamp: getRandomMessageTime(10), isRead: true, avatar: getAvatarInitial("You") },
      { id: uuidv4(), content: "It was on Oct 26th, for $49.99.", sender: "Bob Smith", timestamp: getRandomMessageTime(9), isRead: true, avatar: getAvatarInitial("Bob Smith") },
      { id: uuidv4(), content: "Let me check that for you. It appears to be for your monthly premium subscription. Would you like a detailed breakdown?", sender: "You", timestamp: getRandomMessageTime(8), isRead: true, avatar: getAvatarInitial("You") },
      { id: uuidv4(), content: "Ah, I see. Yes, please.", sender: "Bob Smith", timestamp: getRandomMessageTime(7), isRead: true, avatar: getAvatarInitial("Bob Smith") },
    ],
    contactInfo: {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      location: "UK, London",
      avatar: getAvatarInitial("Bob Smith"),
      status: "Chatting",
      chatId: generateChatId(),
      chatDuration: "12m 5s",
      totalMessages: 5,
      archivedCount: 0,
      visitedPagesCount: 2,
      tags: ["Billing", "Subscription"],
      visitedPages: [
        { url: "/billing", title: "Billing History", timestamp: "12m ago" },
        { url: "/subscription", title: "Subscription Details", timestamp: "11m ago" },
      ],
    },
    backendUserData: {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      ip: getRandomIp(),
      location: { city: "London", region: "England", country: "UK", timezone: "Europe/London" },
      device: { type: "desktop", os: "Windows 10", browser: "Firefox 119" },
      referrer: "https://www.example.com/dashboard/billing",
      initialPage: "/billing",
      utm: { source: "dashboard", medium: "internal", campaign: "none", term: "none", content: "none" },
    },
  },
  // MY INBOX - ESCALATED (3 chats)
  {
    chat: {
      id: "my-escalated-1",
      name: "Frank Black",
      lastMessage: "This is urgent! The system is completely down!",
      timestamp: getRandomChatTime(2),
      unreadCount: 2,
      avatar: getAvatarInitial("Frank Black"),
      status: "online",
      section: "my-inbox-escalated"
    },
    messages: [
      { id: uuidv4(), content: "There's a critical bug on your dashboard! When I click the reports button, it crashes.", sender: "Frank Black", timestamp: getRandomMessageTime(17), isRead: true, avatar: getAvatarInitial("Frank Black") },
      { id: uuidv4(), content: "I apologize for that, Frank. Could you please provide more details?", sender: "You", timestamp: getRandomMessageTime(16), isRead: true, avatar: getAvatarInitial("You") },
      { id: uuidv4(), content: "Chrome, latest version. I go to 'Reports', click 'Generate', and then it freezes.", sender: "Frank Black", timestamp: getRandomMessageTime(15), isRead: true, avatar: getAvatarInitial("Frank Black") },
      { id: uuidv4(), content: "Thank you for the detailed report. I've escalated this to our technical team.", sender: "You", timestamp: getRandomMessageTime(14), isRead: true, avatar: getAvatarInitial("You") },
      { id: uuidv4(), content: "This is urgent! The system is completely down!", sender: "Frank Black", timestamp: getRandomMessageTime(2), isRead: false, avatar: getAvatarInitial("Frank Black") },
    ],
    contactInfo: {
      name: "Frank Black",
      email: "frank.black@example.com",
      location: "France, Paris",
      avatar: getAvatarInitial("Frank Black"),
      status: "Chatting",
      chatId: generateChatId(),
      chatDuration: "18m 10s",
      totalMessages: 5,
      archivedCount: 0,
      visitedPagesCount: 2,
      tags: ["Bug Report", "Technical Issue", "Escalated"],
      visitedPages: [
        { url: "/dashboard", title: "Dashboard", timestamp: "18m ago" },
        { url: "/dashboard/reports", title: "Reports Page", timestamp: "17m ago" },
      ],
    },
    backendUserData: {
      name: "Frank Black",
      email: "frank.black@example.com",
      ip: getRandomIp(),
      location: { city: "Paris", region: "Île-de-France", country: "France", timezone: "Europe/Paris" },
      device: { type: "desktop", os: "Windows 10", browser: "Chrome 118" },
      referrer: "https://app.example.com/dashboard",
      initialPage: "/dashboard/reports",
      utm: { source: "app", medium: "internal", campaign: "none", term: "none", content: "none" },
    },
  },
  // AGENT INBOX - ACTIVE CHATS (8 chats)
  {
    chat: {
      id: "agent-active-1",
      name: "Sarah Wilson",
      lastMessage: "I need help with my policy",
      timestamp: getRandomChatTime(2),
      unreadCount: 1,
      avatar: getAvatarInitial("Sarah Wilson"),
      status: "online",
      section: "agent-inbox-active"
    },
    messages: [
      { id: uuidv4(), content: "Hello, I'm looking for information about your premium plan.", sender: "Sarah Wilson", timestamp: getRandomMessageTime(5), isRead: true, avatar: getAvatarInitial("Sarah Wilson") },
      { id: uuidv4(), content: "Hello Sarah! I'd be happy to help you with information about our premium plan. What specific features are you interested in?", sender: "AI Agent", timestamp: getRandomMessageTime(4), isRead: true, avatar: "AI" },
      { id: uuidv4(), content: "I need help with my policy", sender: "Sarah Wilson", timestamp: getRandomMessageTime(2), isRead: false, avatar: getAvatarInitial("Sarah Wilson") },
    ],
    contactInfo: {
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      location: "USA, New York",
      avatar: getAvatarInitial("Sarah Wilson"),
      status: "Chatting",
      chatId: generateChatId(),
      chatDuration: "5m 30s",
      totalMessages: 3,
      archivedCount: 0,
      visitedPagesCount: 1,
      tags: ["Policy Inquiry", "Premium Plan"],
      visitedPages: [
        { url: "/pricing/premium", title: "Premium Pricing", timestamp: "5m ago" },
      ],
    },
    backendUserData: {
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      ip: getRandomIp(),
      location: { city: "New York", region: "New York", country: "USA", timezone: "America/New_York" },
      device: { type: "desktop", os: "macOS Ventura", browser: "Safari 17" },
      referrer: "https://www.google.com/search?q=premium+chat+software",
      initialPage: "/pricing/premium",
      utm: { source: "google", medium: "organic", campaign: "none", term: "premium+chat", content: "none" },
    },
  },
  // AGENT INBOX - RESOLVED
  {
    chat: {
      id: "agent-resolved-1",
      name: "Mike Chen",
      lastMessage: "Thank you for your assistance",
      timestamp: getRandomChatTime(45),
      unreadCount: 0,
      avatar: getAvatarInitial("Mike Chen"),
      status: "offline",
      section: "agent-inbox-resolved"
    },
    messages: [
      { id: uuidv4(), content: "Hi, I'm having trouble setting up the widget on my website.", sender: "Mike Chen", timestamp: getRandomMessageTime(50), isRead: true, avatar: getAvatarInitial("Mike Chen") },
      { id: uuidv4(), content: "Hello Mike! I can help you set up the widget. Are you following the integration guide?", sender: "AI Agent", timestamp: getRandomMessageTime(49), isRead: true, avatar: "AI" },
      { id: uuidv4(), content: "Yes, but I'm stuck on step 3.", sender: "Mike Chen", timestamp: getRandomMessageTime(48), isRead: true, avatar: getAvatarInitial("Mike Chen") },
      { id: uuidv4(), content: "Let me walk you through step 3. You need to copy the JavaScript code and paste it before the closing </body> tag.", sender: "AI Agent", timestamp: getRandomMessageTime(47), isRead: true, avatar: "AI" },
      { id: uuidv4(), content: "Got it! It's working now.", sender: "Mike Chen", timestamp: getRandomMessageTime(46), isRead: true, avatar: getAvatarInitial("Mike Chen") },
      { id: uuidv4(), content: "Excellent! Is there anything else I can help you with?", sender: "AI Agent", timestamp: getRandomMessageTime(45), isRead: true, avatar: "AI" },
      { id: uuidv4(), content: "Thank you for your assistance", sender: "Mike Chen", timestamp: getRandomMessageTime(44), isRead: true, avatar: getAvatarInitial("Mike Chen") },
    ],
    contactInfo: {
      name: "Mike Chen",
      email: "mike.chen@example.com",
      location: "Canada, Vancouver",
      avatar: getAvatarInitial("Mike Chen"),
      status: "Offline",
      chatId: generateChatId(),
      chatDuration: "6m 15s",
      totalMessages: 7,
      archivedCount: 0,
      visitedPagesCount: 2,
      tags: ["Widget Setup", "Resolved"],
      visitedPages: [
        { url: "/docs/integration", title: "Integration Guide", timestamp: "50m ago" },
        { url: "/docs/widget-setup", title: "Widget Setup", timestamp: "49m ago" },
      ],
    },
    backendUserData: {
      name: "Mike Chen",
      email: "mike.chen@example.com",
      ip: getRandomIp(),
      location: { city: "Vancouver", region: "British Columbia", country: "Canada", timezone: "America/Vancouver" },
      device: { type: "desktop", os: "Windows 11", browser: "Chrome 118" },
      referrer: "https://www.example.com/docs",
      initialPage: "/docs/integration",
      utm: { source: "website", medium: "internal", campaign: "none", term: "none", content: "docs_link" },
    },
  },
];

// Export section counts for reference
export const sectionCounts = {
  "my-inbox-chats": 12,
  "my-inbox-escalated": 3,
  "my-inbox-resolved": 5,
  "agent-inbox-active": 8,
  "agent-inbox-resolved": 7,
};

// Helper function to get chats by section
export const getChatsBySection = (section: string): SectionedChatInstance[] => {
  return sectionedDummyChatInstances.filter(chat => chat.chat.section === section);
};

// Helper function to get all section keys
export const getAllSections = (): string[] => {
  return Object.keys(sectionCounts);
};
