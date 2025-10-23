# 🌸 Sakura - AI-Powered Customer Support Platform

Sakura is a comprehensive customer support platform that combines AI automation with human agent capabilities to deliver exceptional customer service experiences. The platform features a sophisticated chat widget, intelligent AI agents, and a powerful dashboard for managing conversations across multiple channels.

## 🚀 Project Overview

Sakura consists of three main components working together to provide a complete customer support solution:

1. **Backend API** - FastAPI server handling chat processing, AI operations, and data management
2. **Dashboard** - Next.js web application for agents and administrators to manage conversations
3. **Widget** - Embeddable chat widget for customer-facing websites

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **Framework**: FastAPI for high-performance API development
- **Database**: MongoDB for flexible data storage
- **AI Integration**: LangGraph for AI agent workflows
- **Vector Store**: FAISS with HuggingFace embeddings for knowledge base
- **AOPs**: Automated Operating Procedures for complex workflows

### Dashboard (Next.js + React)
- **Framework**: Next.js 14 with App Router
- **UI Library**: Material-UI (MUI) with custom dark theme
- **State Management**: React Context API
- **TypeScript**: Full type safety throughout the application

### Widget (Next.js + React)
- **Framework**: Next.js for embeddable widget
- **Responsive Design**: Mobile-first approach
- **Real-time Communication**: WebSocket integration with backend

## 📁 Project Structure

```
sakura/
├── backend/          # FastAPI backend server
├── dashboard/        # Next.js dashboard application  
├── widget/          # Next.js embeddable chat widget
└── ignore/          # Development and testing data
```

## 🎯 Key Features

### 🤖 AI Agent Capabilities
- **Intelligent Responses**: AI-powered customer support with context awareness
- **AOP Workflows**: Automated Operating Procedures for complex tasks
- **Knowledge Base**: Vector-based search for accurate information retrieval
- **Multi-language Support**: Global customer support capabilities

### 👥 Human Agent Tools
- **Unified Inbox**: Centralized conversation management
- **Sectioned Organization**: 
  - My Inbox (Chats, Escalated, Resolved)
  - Agent Inbox (Active Chats, Resolved)
- **Real-time Collaboration**: Live chat with AI assistance
- **Performance Analytics**: Detailed reporting and insights

### 💬 Chat Widget Features
- **Easy Integration**: Simple embed code for any website
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Customizable**: Brand colors, fonts, and styling options
- **Multi-channel**: Support for various communication channels

## 🛠️ Technology Stack

### Backend Technologies
- **Python 3.11+**
- **FastAPI** - Modern, fast web framework
- **MongoDB** - NoSQL database for flexible data storage
- **LangGraph** - AI agent workflow management
- **FAISS** - Vector similarity search
- **HuggingFace Transformers** - NLP models
- **Pydantic** - Data validation and settings

### Frontend Technologies
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks and context
- **TypeScript** - Type-safe JavaScript
- **Material-UI (MUI)** - Component library
- **Emotion** - CSS-in-JS styling
- **React Query** - Data fetching and caching

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Jest** - Testing framework
- **Storybook** - Component development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- MongoDB 6.0+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/sakura.git
   cd sakura
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   # or using uv
   uv sync
   ```

4. **Setup Dashboard**
   ```bash
   cd dashboard
   npm install
   ```

5. **Setup Widget**
   ```bash
   cd widget
   npm install
   ```

### Development

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   python main.py
   # Server runs on http://localhost:8000
   ```

3. **Start Dashboard**
   ```bash
   cd dashboard
   npm run dev
   # Dashboard runs on http://localhost:3000
   ```

4. **Start Widget**
   ```bash
   cd widget
   npm run dev
   # Widget runs on http://localhost:3001
   ```

## 📊 Data Flow

### Chat Widget → Backend
```typescript
// User registration
POST /api/users
{
  name: string,
  email: string,
  ip: string,
  location: object,
  device: object,
  referrer: string,
  initialPage: string,
  utm: object
}

// Chat message
POST /api/chat
{
  message: string,
  session_id: string,
  email: string
}
```

### Backend → Dashboard
```typescript
// Chat data structure
interface ChatInstance {
  chat: {
    id: string,
    name: string,
    lastMessage: string,
    timestamp: string,
    unreadCount: number,
    avatar: string,
    status: "online" | "offline" | "away",
    section: string
  },
  messages: Message[],
  contactInfo: ContactInfo,
  backendUserData: UserData
}
```

## 🎨 UI Components

### Dashboard Interface
- **Three-Panel Layout**: Chat list, conversation view, contact details
- **Dark Theme**: Professional dark UI with orange accents
- **Responsive Design**: Works on all screen sizes
- **Real-time Updates**: Live chat with instant message delivery

### Chat Widget
- **Minimal Design**: Clean, unobtrusive interface
- **Quick Actions**: Suggested replies and quick responses
- **File Attachments**: Support for image and document sharing
- **Typing Indicators**: Real-time typing status

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb://localhost:27017/sakura
OPENAI_API_KEY=your_openai_key
HUGGINGFACE_API_KEY=your_hf_key
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Dashboard (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WIDGET_URL=http://localhost:3001
```

**Widget (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3000
```

## 📈 Performance & Scalability

- **Horizontal Scaling**: Microservices architecture supports scaling
- **Caching**: Redis for session management and caching
- **CDN Ready**: Static assets optimized for CDN delivery
- **Database Optimization**: Indexed queries and connection pooling
- **Real-time**: WebSocket connections for instant messaging

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest

# Dashboard tests
cd dashboard
npm run test

# Widget tests
cd widget
npm run test
```

## 📚 API Documentation

### Backend API Endpoints

- `GET /health` - Health check
- `POST /api/users` - User registration
- `POST /api/chat` - Send chat message
- `GET /api/chats` - Get chat history
- `GET /api/users/{user_id}` - Get user data
- `POST /api/aops/execute` - Execute AOP workflow

### Widget Embed Code

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'http://localhost:3001/embed/route.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.sakura.com](https://docs.sakura.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/sakura/issues)
- **Discord**: [Sakura Community](https://discord.gg/sakura)
- **Email**: support@sakura.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core chat functionality
- ✅ AI agent integration
- ✅ Dashboard interface
- ✅ Widget embedding

### Phase 2 (Q2 2024)
- 🔄 Multi-language support
- 🔄 Advanced analytics
- 🔄 Mobile app
- 🔄 Voice integration

### Phase 3 (Q3 2024)
- 📋 Video calling
- 📋 Screen sharing
- 📋 Advanced AI features
- 📋 Enterprise integrations

---

**Built with ❤️ by the Sakura Team**