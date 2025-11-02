# Navigation System Refactor

## Overview
The Sakura project has been refactored to implement a clean, config-driven sidebar and routing system with a three-column layout.

## New Structure

### 1. Left Icon Bar (Top-level modules)
- **Inbox** (📩) - `/inbox` - tooltip: "Inbox"
- **AI Agent** (✨) - `/ai-agent` - tooltip: "AI Agent"  
- **Reports** (📊) - `/reports` - tooltip: "Reports"
- **Knowledge Base** (📚) - `/knowledge-base` - tooltip: "Knowledge Base"

### 2. Middle Column (Secondary navigation)
Updates dynamically based on the active top-level module.

## Routing Structure

### Inbox Module (`/inbox`)
- **My Inbox** (collapsible)
  - Unified Inbox → `/inbox/my-inbox/unified`
  - Chats → `/inbox/my-inbox/chats`
  - Escalated → `/inbox/my-inbox/escalated`
  - Resolved → `/inbox/my-inbox/resolved`
- **Agent Inbox** (collapsible)
  - Active Chats → `/inbox/agent-inbox/active-chats`
  - Resolved → `/inbox/agent-inbox/resolved-chats`

### AI Agent Module (`/ai-agent`)
- **Sales Agent** (collapsible)
  - Settings → `/sales-agent/settings`
  - Performance → `/sales-agent/performance` (external)
  - Chats → `/sales-agent/chats` (external)

### Reports Module (`/reports`)
- Overview → `/reports/overview`
- AI Agent → `/reports/ai-agent`

### Knowledge Base Module (`/knowledge-base`)
- Websites → `/knowledge-base/websites`
- Files → `/knowledge-base/files`

## Key Features

### Config-Driven Navigation
- All navigation structure is defined in `src/config/navigation.ts`
- Easy to modify without touching component code
- Type-safe with TypeScript interfaces

### Collapsible Sections
- Parent items with children are collapsible
- State is managed locally in the sidebar component
- Smooth expand/collapse animations

### Active State Management
- Active links are highlighted with background color
- Uses Material-UI's selected state styling
- Path-based active detection

### External Links
- Performance and Chats pages for Sales Agent open in new tabs
- Proper external link handling with target="_blank"

### Responsive Design
- Mobile-friendly with temporary drawer
- Desktop uses permanent drawer
- Consistent styling across breakpoints

## Files Created/Modified

### New Files
- `src/config/navigation.ts` - Navigation configuration
- `src/app/(DashboardLayout)/layout/sidebar/NewSidebar.tsx` - New sidebar component
- All new page components in their respective directories

### Modified Files
- `src/app/(DashboardLayout)/layout.tsx` - Updated to use NewSidebar
- `src/app/(DashboardLayout)/page.tsx` - Redirects to /inbox by default

## Usage

The navigation system is now completely config-driven. To add new routes or modify existing ones:

1. Update the `navigationConfig` array in `src/config/navigation.ts`
2. Create corresponding page components
3. The sidebar will automatically reflect the changes

## Benefits

- **Maintainable**: All navigation logic in one configuration file
- **Scalable**: Easy to add new modules and routes
- **Type-safe**: Full TypeScript support
- **User-friendly**: Intuitive three-column layout with tooltips
- **Responsive**: Works on all device sizes

