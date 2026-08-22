import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getDatabase, Database } from "firebase-admin/database";

let app: App;
let _db: Database;

function getFirebaseApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  return app;
}

export function getDb(): Database {
  if (!_db) {
    getFirebaseApp();
    _db = getDatabase();
  }
  return _db;
}

// Helper to generate a sequential-friendly ID with timestamp
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// Helper: convert Firebase object snapshot to array
export function snapshotToArray<T>(snapshot: any): T[] {
  if (!snapshot) return [];
  return Object.entries(snapshot).map(([id, data]: [string, any]) => ({
    id,
    ...data,
  }));
}
