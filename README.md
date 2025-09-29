# Sakura Monorepo

This is a monorepo containing three main components:

- **Dashboard** (`/dashboard`) - Next.js frontend application
- **Widget** (`/widget`) - Next.js widget application  
- **Backend** (`/backend`) - Python FastAPI backend service

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Python 3.8+
- pip

### Installation

1. Install root dependencies:
```bash
npm install
```

2. Install all workspace dependencies:
```bash
npm run install:all
```

3. Set up the Python backend:
```bash
npm run setup:backend
```

### Development

Run all services in development mode:
```bash
npm run dev
```

Or run individual services:
```bash
# Dashboard only
npm run dev:dashboard

# Widget only  
npm run dev:widget

# Backend only
npm run dev:backend
```

### Building

Build all applications:
```bash
npm run build
```

Build individual applications:
```bash
npm run build:dashboard
npm run build:widget
```

### Production

Start all services in production mode:
```bash
npm run start
```

### Scripts Reference

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all applications
- `npm run start` - Start all services in production mode
- `npm run lint` - Lint all applications
- `npm run clean` - Clean all node_modules and build artifacts
- `npm run install:all` - Install dependencies for all workspaces
- `npm run setup:backend` - Set up Python virtual environment and install dependencies

## Project Structure

```
sakura/
├── dashboard/          # Next.js dashboard application
├── widget/            # Next.js widget application
├── backend/           # Python FastAPI backend
├── package.json       # Root package.json with workspace configuration
└── README.md          # This file
```

## Workspaces

This monorepo uses npm workspaces to manage multiple packages:

- `dashboard` - Main dashboard application
- `widget` - Widget application

The Python backend is managed separately but integrated through npm scripts.
