import fs from 'fs';
import path from 'path';
import { UserProfile, DailyLog, ProgressPhoto } from '../types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export interface UserAccount {
  email: string;
  passwordHash: string;
  name: string;
}

export interface UserStore {
  profile: UserProfile;
  dailyLogs: DailyLog[];
  photos: ProgressPhoto[];
}

export interface DbSchema {
  users: Record<string, UserAccount>; // keyed by email
  data: Record<string, UserStore>; // keyed by email
}

// Global in-memory fallback for read-only serverless filesystems (e.g. Vercel)
let memoryDb: DbSchema = {
  users: {},
  data: {}
};

// Initialise DB file if it doesn't exist
const initDb = (): DbSchema => {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const defaultSchema: DbSchema = {
        users: {},
        data: {}
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultSchema, null, 2), 'utf-8');
      memoryDb = defaultSchema;
      return defaultSchema;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    memoryDb = parsed;
    return parsed;
  } catch {
    // Fall back to memory cache if file access is restricted
    return memoryDb;
  }
};

const writeDb = (schema: DbSchema): void => {
  memoryDb = schema;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
  } catch {
    console.warn("Database file write failed. Falling back to ephemeral in-memory storage.");
  }
};

export const getAccount = (email: string): UserAccount | null => {
  const db = initDb();
  return db.users[email.toLowerCase()] || null;
};

export const createAccount = (account: UserAccount): void => {
  const db = initDb();
  db.users[account.email.toLowerCase()] = account;
  writeDb(db);
};

export const getUserStore = (email: string): UserStore | null => {
  const db = initDb();
  return db.data[email.toLowerCase()] || null;
};

export const saveUserStore = (email: string, store: UserStore): void => {
  const db = initDb();
  db.data[email.toLowerCase()] = store;
  writeDb(db);
};
