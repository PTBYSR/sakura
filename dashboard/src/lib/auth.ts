import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

// MongoDB connection
const databaseUrl = process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://localhost:27017/sakura";

// Initialize MongoDB client with connection options for reliability
const client = new MongoClient(databaseUrl, {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
});

// Extract database name from URL or use default
const getDbName = (url: string): string => {
  try {
    // Handle mongodb+srv:// format
    if (url.includes("mongodb+srv://")) {
      const match = url.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    // Handle mongodb:// format
    if (url.includes("mongodb://")) {
      const match = url.match(/mongodb:\/\/[^/]+\/([^?]+)/);
      if (match && match[1]) {
        return match[1];
      }
      // If no database in URL, extract from path
      const urlObj = new URL(url.replace("mongodb://", "http://"));
      const pathname = urlObj.pathname.slice(1);
      if (pathname) {
        return pathname.split("?")[0];
      }
    }
    return "sakura"; // default database name
  } catch {
    return "sakura";
  }
};

const dbName = getDbName(databaseUrl);
const db = client.db(dbName);

// Connect to MongoDB (non-blocking) with error handling
let connectionPromise: Promise<MongoClient> | null = null;

const ensureConnection = async (): Promise<MongoClient> => {
  if (!connectionPromise) {
    connectionPromise = client.connect().catch((error) => {
      console.error("❌ Better Auth: Failed to connect to MongoDB:", error.message);
      connectionPromise = null; // Reset to allow retry
      throw error;
    });
  }
  return connectionPromise;
};

// Attempt initial connection
ensureConnection().catch(() => {
  // Connection will be retried on next request
  console.log("⚠️ Better Auth: MongoDB connection will be retried on next request");
});

export const auth = betterAuth({
  // Secret for session encryption (required)
  secret: process.env.BETTER_AUTH_SECRET!,
  
  // Base URL for Better Auth
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001",
  
  database: mongodbAdapter(db, {
    client, // Enable database transactions
  }),
  
  // Email & Password Authentication
  emailAndPassword: {
    enabled: true,
    // Password requirements
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Auto sign-in after sign-up (default: true)
    autoSignIn: true,
  },
  
  // Google OAuth Provider
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ["email", "profile"],
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

