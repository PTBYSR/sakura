# Chat Interface Dummy Data Documentation

## Overview

This document describes the 20 realistic dummy chat instances created for the chat interface, modeling the exact UI design shown in the uploaded image. Each instance includes complete data that would be sent from the chat widget to the backend.

## Data Structure

### Core Interfaces

```typescript
interface Message {
  id: string;
  content: string;
  sender: string; // "Paul Eme" or "You" (the agent)
  timestamp: string; // "5:04 AM", "Now"
  isRead: boolean;
  avatar?: string; // Initial of the sender's name
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string; // "21s ago", "5m ago", "1h ago"
  unreadCount: number;
  avatar: string; // Initial of the name
  status: "online" | "offline" | "away";
}

interface ContactInfo {
  name: string;
  email: string;
  location: string;
  avatar: string;
  status: string; // "Chatting", "Offline", "Away"
  chatId: string;
  chatDuration: string; // "15m 7s"
  totalMessages: number;
  archivedCount: number;
  visitedPagesCount: number;
  tags: string[]; // ["Product Inquiry", "New Customer"]
  visitedPages: { url: string; title: string; timestamp: string }[];
}

interface UserData {
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
    type: "desktop" | "mobile" | "tablet";
    os: string; // "Windows 10", "macOS Ventura", "iOS 17", "Android 13"
    browser: string; // "Chrome 118", "Safari 17", "Firefox 119"
  };
  referrer: string; // "https://www.google.com/search?q=product+inquiry"
  initialPage: string; // "/product/new-feature"
  utm: {
    source: string; // "google", "facebook", "newsletter"
    medium: string; // "cpc", "social", "email"
    campaign: string; // "winter_promo", "new_product_launch"
    term: string; // "product+features", "live+chat+software"
    content: string; // "banner_ad_1", "text_link_a"
  };
}
```

## Dummy Chat Instances

### 1. Paul Eme - Product Inquiry
- **Topic**: New product feature inquiry
- **Location**: Netherlands, Amsterdam
- **Device**: Desktop macOS Ventura, Chrome 118
- **Source**: Google organic search
- **Conversation**: Product comparison with competitor
- **Tags**: ["Product Inquiry", "New Feature"]

### 2. Alice Johnson - Technical Support
- **Topic**: Login issues
- **Location**: USA, California
- **Device**: Mobile iOS 17, Safari 17
- **Source**: Direct access
- **Conversation**: Password reset assistance
- **Tags**: ["Technical Support", "Login Issue"]

### 3. Bob Smith - Billing Question
- **Topic**: Unrecognized charge
- **Location**: UK, London
- **Device**: Desktop Windows 10, Firefox 119
- **Source**: Dashboard internal
- **Conversation**: Subscription billing clarification
- **Tags**: ["Billing", "Subscription"]

### 4. Carol White - General Inquiry
- **Topic**: Free trial inquiry
- **Location**: Canada, Toronto
- **Device**: Desktop Windows 11, Edge 118
- **Source**: Bing CPC
- **Conversation**: General product information
- **Tags**: ["General Inquiry", "Free Trial"]

### 5. David Green - Feature Request
- **Topic**: CRM integration suggestion
- **Location**: Australia, Sydney
- **Device**: Desktop macOS Sonoma, Safari 17
- **Source**: LinkedIn social
- **Conversation**: Feature request submission
- **Tags**: ["Feature Request", "Integration"]

### 6. Eva Brown - Account Update
- **Topic**: Billing address change
- **Location**: Germany, Berlin
- **Device**: Desktop Windows 10, Chrome 118
- **Source**: App internal
- **Conversation**: Account management
- **Tags**: ["Account Management", "Billing Address"]

### 7. Frank Black - Bug Report
- **Topic**: Dashboard crash issue
- **Location**: France, Paris
- **Device**: Desktop Windows 10, Chrome 118
- **Source**: App internal
- **Conversation**: Technical bug reporting
- **Tags**: ["Bug Report", "Technical Issue"]

### 8. Grace Lee - Onboarding Help
- **Topic**: Widget setup assistance
- **Location**: Japan, Tokyo
- **Device**: Desktop Windows 11, Edge 118
- **Source**: Website referral
- **Conversation**: Setup guidance
- **Tags**: ["Onboarding", "Setup Help"]

### 9. Henry Wilson - Partnership Inquiry
- **Topic**: Agency partnership
- **Location**: USA, New York
- **Device**: Desktop macOS Ventura, Chrome 118
- **Source**: Google organic
- **Conversation**: Business development
- **Tags**: ["Partnership", "Business Development"]

### 10. Ivy King - UI Feedback
- **Topic**: Dashboard UI feedback
- **Location**: Spain, Madrid
- **Device**: Desktop Windows 11, Chrome 118
- **Source**: App internal
- **Conversation**: User experience feedback
- **Tags**: ["Feedback", "UI/UX"]

### 11. Jack Taylor - Pricing Clarification
- **Topic**: Plan comparison
- **Location**: Italy, Rome
- **Device**: Desktop macOS Sonoma, Safari 17
- **Source**: Google CPC
- **Conversation**: Pricing plan details
- **Tags**: ["Pricing", "Plan Comparison"]

### 12. Karen Moore - Data Privacy
- **Topic**: GDPR compliance
- **Location**: Sweden, Stockholm
- **Device**: Desktop Linux, Firefox 119
- **Source**: Website internal
- **Conversation**: Privacy policy questions
- **Tags**: ["Data Privacy", "GDPR"]

### 13. Liam Hall - Integration Help
- **Topic**: API integration issues
- **Location**: Ireland, Dublin
- **Device**: Desktop macOS Ventura, Firefox 119
- **Source**: App internal
- **Conversation**: Technical API support
- **Tags**: ["Integration", "API Key", "Technical Support"]

### 14. Mia Clark - Upgrade Inquiry
- **Topic**: Plan upgrade
- **Location**: Netherlands, Amsterdam
- **Device**: Desktop Windows 10, Chrome 118
- **Source**: App internal
- **Conversation**: Subscription upgrade
- **Tags**: ["Upgrade", "Subscription"]

### 15. Noah Lewis - Downtime Report
- **Topic**: Service interruption
- **Location**: USA, Texas
- **Device**: Mobile Android 13, Chrome 118
- **Source**: Direct access
- **Conversation**: Service status inquiry
- **Tags**: ["Downtime", "Service Interruption"]

### 16. Olivia Scott - Pre-sales Question
- **Topic**: Customization and white-labeling
- **Location**: UK, Manchester
- **Device**: Desktop macOS Sonoma, Safari 17
- **Source**: Capterra referral
- **Conversation**: Pre-sales customization
- **Tags**: ["Pre-sales", "Customization", "White-label"]

### 17. Peter Adams - Account Deletion
- **Topic**: Account closure
- **Location**: Germany, Munich
- **Device**: Desktop Windows 10, Firefox 119
- **Source**: App internal
- **Conversation**: Account termination
- **Tags**: ["Account Deletion", "Churn"]

### 18. Quinn Baker - Advanced AI Features
- **Topic**: AI capabilities inquiry
- **Location**: USA, Seattle
- **Device**: Desktop macOS Sonoma, Chrome 118
- **Source**: G2 referral
- **Conversation**: Advanced AI features
- **Tags**: ["AI Features", "Advanced Inquiry"]

### 19. Rachel Carter - Holiday Hours
- **Topic**: Support availability
- **Location**: France, Lyon
- **Device**: Mobile iOS 17, Safari 17
- **Source**: Website internal
- **Conversation**: Holiday support hours
- **Tags**: ["Holiday Hours", "Support Availability"]

### 20. Sam Davis - Affiliate Program
- **Topic**: Affiliate partnership
- **Location**: Australia, Melbourne
- **Device**: Desktop Windows 11, Edge 118
- **Source**: Google organic
- **Conversation**: Affiliate program details
- **Tags**: ["Affiliate Program", "Partnership"]

## Data Flow to Backend

### Widget to Backend Data Transmission

1. **User Registration** (`POST /users`)
   - Complete `UserData` object with location, device, UTM tracking
   - IP address and geolocation data
   - Initial page visit information

2. **Chat Messages** (`POST /chat`)
   - Message content and metadata
   - Session ID and user email
   - Timestamp and read status

3. **Dashboard Data** (`GET /chats`, `GET /chats/{chat_id}`)
   - Chat summaries for inbox
   - Complete conversation history
   - Contact information and metrics

## Geographic Distribution

- **Countries**: 12 different countries represented
- **Continents**: North America, Europe, Asia, Australia
- **Time Zones**: All major time zones covered

## Device & Browser Distribution

- **Desktop**: 15 instances (75%)
- **Mobile**: 5 instances (25%)
- **Operating Systems**: Windows, macOS, Linux, iOS, Android
- **Browsers**: Chrome, Safari, Firefox, Edge

## Traffic Sources

- **Google**: 6 instances (organic + CPC)
- **App Internal**: 6 instances
- **Website Internal**: 3 instances
- **Social Media**: 2 instances (LinkedIn, G2)
- **Direct**: 2 instances
- **Referral**: 1 instance

## Conversation Types

- **Technical Support**: 4 instances
- **Product Inquiry**: 3 instances
- **Billing/Account**: 3 instances
- **Partnership/Business**: 3 instances
- **Feature Requests**: 2 instances
- **General Inquiry**: 2 instances
- **Bug Reports**: 1 instance
- **Feedback**: 1 instance
- **Pre-sales**: 1 instance

## Implementation

The dummy data is integrated into the chat interfaces through:

1. **`dummyChatInstances.ts`**: Contains all 20 complete chat instances
2. **`useChatData.ts`**: Hook that manages chat data and simulates API calls
3. **`ChatInterface.tsx`**: Shared component that renders the chat UI
4. **Agent/My Inbox pages**: Specific implementations for different inbox types

## Usage

```typescript
import { dummyChatInstances } from './data/dummyChatInstances';
import { useChatData } from './hooks/useChatData';

// In your component
const { chats, messages, contactInfo, sendMessage } = useChatData({
  inboxType: "agent",
  userEmail: "admin@example.com"
});
```

This comprehensive dummy data set provides realistic, varied conversations that demonstrate the full capabilities of the chat interface while maintaining the exact visual design from the uploaded image.
