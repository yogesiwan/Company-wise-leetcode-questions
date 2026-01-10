import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is not set in the environment');
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    // uri is guaranteed to be defined due to check at module level
    client = new MongoClient(uri!);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const mongoClient = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'leetcode-pre';
  return mongoClient.db(dbName);
}

export interface UserQuestionState {
  userId: string;
  questionId: string;
  done: boolean;
  note: string;
  updatedAt: Date;
}

// User tracking - automatically populated on sign-in
export interface User {
  email: string;           // Primary key
  name?: string;           // Display name from OAuth
  image?: string;          // Profile picture URL
  provider: string;        // Auth provider (e.g., "google")
  createdAt: Date;         // First sign-in timestamp
  lastLoginAt: Date;       // Most recent sign-in
  loginCount: number;      // Total number of sign-ins
}

// Admin users for admin dashboard access
export interface AdminUser {
  email: string;           // Admin user's email
  addedAt: Date;           // When admin was added
  addedBy: string;         // Who added this admin
}

// Helper function to check if a user is an admin
export async function isAdmin(email: string): Promise<boolean> {
  // Check env var first (faster, no DB call)
  const envAdmins = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  if (envAdmins.includes(email)) return true;
  
  // Fallback to database check
  const db = await getDb();
  const admin = await db.collection<AdminUser>('adminUsers').findOne({ email });
  return !!admin;
}

// App settings - admin-configurable values
export interface AppSetting {
  key: string;             // Setting identifier (e.g., "lastUpdatedDate")
  value: string;           // Setting value
  updatedAt: Date;         // Last update timestamp
  updatedBy: string;       // Email of admin who updated
}

// Default settings values
const DEFAULT_SETTINGS: Record<string, string> = {
  lastUpdatedDate: 'Nov 2025',
};

// Get an app setting from the database (with fallback to default)
export async function getAppSetting(key: string): Promise<string> {
  try {
    const db = await getDb();
    const setting = await db.collection<AppSetting>('appSettings').findOne({ key });
    return setting?.value ?? DEFAULT_SETTINGS[key] ?? '';
  } catch (error) {
    console.error(`Error getting app setting '${key}':`, error);
    return DEFAULT_SETTINGS[key] ?? '';
  }
}

// Set an app setting in the database
export async function setAppSetting(key: string, value: string, updatedBy: string): Promise<boolean> {
  try {
    const db = await getDb();
    await db.collection<AppSetting>('appSettings').updateOne(
      { key },
      {
        $set: {
          value,
          updatedAt: new Date(),
          updatedBy,
        },
        $setOnInsert: {
          key,
        },
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error(`Error setting app setting '${key}':`, error);
    return false;
  }
}

// Get all app settings
export async function getAllAppSettings(): Promise<Record<string, string>> {
  try {
    const db = await getDb();
    const settings = await db.collection<AppSetting>('appSettings').find({}).toArray();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  } catch (error) {
    console.error('Error getting all app settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}
