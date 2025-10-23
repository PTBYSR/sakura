// Example of how the dummy chat data would be sent to the backend
// This demonstrates the data flow from widget to backend

import { sectionedDummyChatInstances } from './sectionedDummyChatInstances';

// Simulate sending user data to backend (as would happen from the widget)
async function simulateWidgetToBackendDataFlow() {
  console.log("🚀 Simulating Widget to Backend Data Flow");
  console.log("=" .repeat(50));

  // Take the first dummy instance as an example
  const exampleInstance = sectionedDummyChatInstances[0];
  
  console.log("📤 Data sent from Widget to Backend:");
  console.log("1. User Registration Data:");
  console.log(JSON.stringify(exampleInstance.backendUserData, null, 2));
  
  console.log("\n2. Chat Messages (as they're sent):");
  exampleInstance.messages.forEach((message, index) => {
    console.log(`Message ${index + 1}:`);
    console.log(`  Content: "${message.content}"`);
    console.log(`  Sender: ${message.sender}`);
    console.log(`  Timestamp: ${message.timestamp}`);
    console.log(`  Read Status: ${message.isRead}`);
  });

  console.log("\n3. Contact Information (aggregated):");
  console.log(JSON.stringify(exampleInstance.contactInfo, null, 2));

  console.log("\n📊 Summary:");
  console.log(`- Total chats: ${sectionedDummyChatInstances.length}`);
  console.log(`- Total messages across all chats: ${sectionedDummyChatInstances.reduce((sum, chat) => sum + chat.messages.length, 0)}`);
  console.log(`- Countries represented: ${new Set(sectionedDummyChatInstances.map(chat => chat.backendUserData.location.country)).size}`);
  console.log(`- Device types: ${new Set(sectionedDummyChatInstances.map(chat => chat.backendUserData.device.type)).size}`);
  console.log(`- Traffic sources: ${new Set(sectionedDummyChatInstances.map(chat => chat.backendUserData.utm.source)).size}`);
}

// Simulate API endpoints that would receive this data
const API_ENDPOINTS = {
  // User registration endpoint
  '/users': {
    method: 'POST',
    description: 'Receives user registration data from widget',
    data: 'backendUserData from sectionedDummyChatInstances'
  },
  
  // Chat message endpoint
  '/chat': {
    method: 'POST',
    description: 'Receives chat messages from widget',
    data: 'message content + session_id + user email'
  },
  
  // Get user chats
  '/chats': {
    method: 'GET',
    description: 'Returns user chat list for dashboard',
    response: 'Array of chat summaries'
  },
  
  // Get specific chat messages
  '/chats/{chat_id}': {
    method: 'GET',
    description: 'Returns full chat conversation',
    response: 'Complete chat with messages and metadata'
  }
};

console.log("🔗 Backend API Endpoints:");
console.log(JSON.stringify(API_ENDPOINTS, null, 2));

// Export for use in other files
export { simulateWidgetToBackendDataFlow, API_ENDPOINTS };
