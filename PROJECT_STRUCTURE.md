# Sakura Project Structure

```
sakura/
├── 📁 backend/                          # FastAPI Backend Server
│   ├── 📄 main.py                       # Main FastAPI application with API endpoints
│   ├── 📄 actions.py                    # Mock action handlers for AOP steps
│   ├── 📄 storage.py                    # MongoDB integration and data storage
│   ├── 📄 requirements.txt              # Python dependencies
│   ├── 📄 pyproject.toml                # Python project configuration
│   ├── 📄 uv.lock                       # Dependency lock file
│   ├── 📄 users.json                    # User data storage
│   ├── 📄 aops.json                     # Automated Operating Procedures config
│   ├── 📁 faiss_index/                  # Vector store for knowledge base
│   │   ├── 📄 index.faiss               # FAISS index file
│   │   └── 📄 index.pkl                  # Pickle index file
│   ├── 📁 jsonl_data/                   # JSONL formatted data files
│   └── 📁 regirl_chunk/                 # Chunked data for processing
│
├── 📁 dashboard/                        # Next.js Dashboard Application
│   ├── 📄 package.json                  # Node.js dependencies
│   ├── 📄 next.config.js                # Next.js configuration
│   ├── 📄 tsconfig.json                 # TypeScript configuration
│   ├── 📄 next-env.d.ts                 # Next.js type definitions
│   ├── 📄 README.md                     # Dashboard documentation
│   ├── 📁 public/                       # Static assets
│   │   ├── 📁 images/                   # Image assets
│   │   │   ├── 📁 backgrounds/          # Background images
│   │   │   ├── 📁 integration-logo/     # Integration logos
│   │   │   ├── 📁 logos/                # Application logos
│   │   │   ├── 📁 products/             # Product images
│   │   │   └── 📁 profile/              # Profile images
│   │   ├── 📄 next.svg                  # Next.js logo
│   │   └── 📄 vercel.svg                # Vercel logo
│   └── 📁 src/                          # Source code
│       ├── 📁 app/                      # Next.js App Router
│       │   ├── 📁 (DashboardLayout)/    # Dashboard layout group
│       │   │   ├── 📁 [agentId]/        # Dynamic agent pages
│       │   │   ├── 📁 ai-agent/         # AI agent management
│       │   │   ├── 📁 arp/              # ARP (Automated Response Procedures)
│       │   │   ├── 📁 chatbot/          # Chatbot configuration
│       │   │   ├── 📁 components/        # Reusable UI components
│       │   │   ├── 📁 human/            # Human agent pages
│       │   │   ├── 📁 icons/            # Custom icons
│       │   │   ├── 📁 inbox/            # Chat inbox system
│       │   │   │   ├── 📄 page.tsx      # Main inbox overview
│       │   │   │   ├── 📁 my-inbox/     # Human agent inbox
│       │   │   │   ├── 📁 agent-inbox/  # AI agent inbox
│       │   │   │   ├── 📁 components/   # Chat interface components
│       │   │   │   ├── 📁 hooks/        # Custom React hooks
│       │   │   │   ├── 📁 data/         # Dummy data and examples
│       │   │   │   └── 📄 README.md     # Inbox documentation
│       │   │   ├── 📁 knowledge-base/   # Knowledge management
│       │   │   ├── 📁 layout/           # Layout components
│       │   │   ├── 📁 reports/          # Analytics and reports
│       │   │   ├── 📁 sales-agent/      # Sales agent tools
│       │   │   ├── 📁 sample-page/      # Sample pages
│       │   │   ├── 📁 settings/         # Application settings
│       │   │   └── 📁 utilities/        # Utility functions
│       │   ├── 📁 authentication/       # Auth pages
│       │   │   ├── 📁 auth/             # Authentication components
│       │   │   ├── 📁 login/            # Login page
│       │   │   └── 📁 register/         # Registration page
│       │   ├── 📁 dataSea/              # Data visualization
│       │   ├── 📄 favicon.ico           # Site icon
│       │   ├── 📄 global.css            # Global styles
│       │   ├── 📄 layout.tsx            # Root layout
│       │   └── 📄 loading.tsx           # Loading component
│       ├── 📁 config/                   # Configuration files
│       │   └── 📄 navigation.ts         # Navigation configuration
│       ├── 📁 contexts/                 # React contexts
│       │   ├── 📄 AgentsContext.tsx     # Agents state management
│       │   ├── 📄 ARPContext.tsx        # ARP state management
│       │   └── 📄 ChatContext.tsx       # Chat state management
│       ├── 📁 lib/                      # Utility libraries
│       │   └── 📄 api.ts                # API client functions
│       └── 📁 utils/                    # Utility functions
│           ├── 📄 createEmotionCache.ts # Emotion cache setup
│           └── 📁 theme/                # Theme configuration
│               ├── 📄 DarkTheme.tsx     # Dark theme
│               ├── 📄 DefaultColors.tsx # Default color palette
│               └── 📄 theme.ts          # Theme utilities
│
├── 📁 widget/                           # Next.js Chat Widget Application
│   ├── 📄 package.json                 # Widget dependencies
│   ├── 📄 next.config.ts                # Widget Next.js config
│   ├── 📄 tsconfig.json                 # Widget TypeScript config
│   ├── 📄 postcss.config.mjs            # PostCSS configuration
│   ├── 📄 eslint.config.mjs             # ESLint configuration
│   ├── 📄 README.md                     # Widget documentation
│   ├── 📄 test-widget.html              # Widget test page
│   ├── 📁 public/                       # Widget static assets
│   │   ├── 📄 test.html                 # Test HTML file
│   │   └── 📄 *.svg                     # SVG icons
│   └── 📁 app/                          # Widget App Router
│       ├── 📁 components/                # Widget components
│       ├── 📁 embed/                     # Embed functionality
│       │   └── 📄 route.ts              # Embed API route
│       ├── 📁 widget/                    # Widget pages
│       │   └── 📄 page.tsx              # Main widget page
│       ├── 📄 favicon.ico               # Widget icon
│       ├── 📄 globals.css               # Widget global styles
│       └── 📄 layout.tsx                # Widget layout
│
├── 📁 ignore/                           # Development/Testing Data
│   ├── 📁 indexing/                     # Data indexing scripts
│   │   ├── 📄 collect_jsonl.py          # JSONL data collection
│   │   ├── 📄 jsonl_x.py                # JSONL processing
│   │   ├── 📁 html_files/               # HTML source files
│   │   ├── 📁 output_chunks/            # Processed data chunks
│   │   └── 📁 KB_for_development/       # Knowledge base dev files
│   └── 📁 regirl/                       # Regirl data processing
│       ├── 📄 index.html                # Main index
│       ├── 📄 robots.txt                # Robots configuration
│       └── 📁 */                        # Various data directories
│
├── 📄 package.json                      # Root package configuration
├── 📄 package-lock.txt                  # Root dependency lock
├── 📄 README.md                         # Project documentation
└── 📁 node_modules/                     # Root dependencies
```

## Key Route Structure

### Dashboard Routes
```
/dashboard/
├── /inbox/                              # Main inbox overview
├── /inbox/my-inbox/                     # Human agent inbox
├── /inbox/agent-inbox/                  # AI agent inbox
├── /human/human-chats/                  # Human chats (12 chats)
├── /human/escalated-chats/              # Escalated chats (3 chats)
├── /human/resolved-chats/               # Resolved chats (5 chats)
├── /ai-agent/active-chats/              # AI active chats (8 chats)
├── /ai-agent/resolved-chats/            # AI resolved chats (7 chats)
├── /ai-agent/                           # AI agent management
├── /arp/                                # Automated Response Procedures
├── /chatbot/                            # Chatbot configuration
├── /knowledge-base/                     # Knowledge management
├── /reports/                            # Analytics and reports
├── /sales-agent/                        # Sales agent tools
├── /settings/                           # Application settings
└── /authentication/                     # Auth pages
    ├── /login/                          # Login page
    └── /register/                       # Registration page
```

### Widget Routes
```
/widget/
├── /                                    # Main widget page
├── /embed/                              # Embed API endpoint
└── /test-widget.html                    # Widget test page
```
