# Better Auth Setup Guide

This document explains how to configure Better Auth for the dashboard project.

## Environment Variables

Create a `.env.local` file in the `dashboard` directory with the following variables:

```env
# MongoDB Connection String (MongoDB Atlas or Local)
# Format for Atlas: mongodb+srv://username:password@cluster.mongodb.net/sakura?retryWrites=true&w=majority
# Format for Local: mongodb://localhost:27017/sakura
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/sakura?retryWrites=true&w=majority

# Alternative: You can also use MONGO_URI (will be used if DATABASE_URL is not set)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sakura

# Google OAuth Credentials
# Get these from Google Cloud Console: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Better Auth Base URL (optional, auto-detected in development)
# BETTER_AUTH_URL=http://localhost:3001

# Next.js Public URL (if needed for client-side auth)
# NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
```

## MongoDB Setup

### Using MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string from the "Connect" button
6. Replace `<password>` and `<dbname>` in the connection string
7. Add it to `.env.local` as `DATABASE_URL`

### Using Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/sakura`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen if prompted
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Sakura Dashboard (or any name)
   - Authorized redirect URIs:
     - `http://localhost:3001/api/auth/callback/google` (for local development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to `.env.local`

## Features Implemented

### Email/Password Authentication
- User registration with email and password
- User login with email and password
- Password validation (minimum 8 characters)
- Remember me functionality
- Auto sign-in after registration

### Google OAuth
- Sign in with Google
- Sign up with Google
- Automatic account creation

### Session Management
- Secure session cookies
- Session expiration (7 days)
- Session update interval (1 day)

### Route Protection
- Middleware protects dashboard routes
- Automatic redirect to login for unauthenticated users
- Protected routes:
  - `/dashboard`
  - `/inbox`
  - `/knowledge-base`
  - `/ai-agent`
  - `/reports`
  - `/settings`
  - `/sops`
  - `/integrations`
  - `/chatbot`
  - `/sales-agent`

## Usage

### Login Component
- Email/password login form
- Google Sign-In button
- Error handling and loading states

### Register Component
- Email/password registration form
- Password confirmation
- Google Sign-Up button
- Error handling and loading states

### Profile Component
- Displays user information from session
- Shows user avatar (from Google if available)
- Logout functionality
- User menu with profile links

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/authentication/login` or `/authentication/register`

3. Test email/password registration and login

4. Test Google OAuth (make sure Google credentials are configured)

## Troubleshooting

### Database Connection Issues
- Verify MongoDB connection string is correct
- Check if MongoDB Atlas IP whitelist includes your IP
- Ensure database user has proper permissions

### Google OAuth Issues
- Verify redirect URIs match exactly (including protocol and port)
- Check that Google Cloud project has Google+ API enabled
- Ensure Client ID and Secret are correct

### Session Issues
- Clear browser cookies and try again
- Check that middleware is properly configured
- Verify `BETTER_AUTH_URL` matches your application URL

## File Structure

```
dashboard/
├── src/
│   ├── lib/
│   │   ├── auth.ts              # Server-side Better Auth configuration
│   │   └── auth-client.ts       # Client-side Better Auth client
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...all]/
│   │   │           └── route.ts # Next.js API route handler
│   │   └── authentication/
│   │       └── auth/
│   │           ├── AuthLogin.tsx    # Login component
│   │           └── AuthRegister.tsx # Register component
│   └── (DashboardLayout)/
│       └── layout/
│           └── header/
│               └── Profile.tsx      # Profile menu component
├── middleware.ts                    # Route protection middleware
└── .env.local                       # Environment variables (create this)
```

