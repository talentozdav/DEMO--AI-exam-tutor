import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Dynamic resolution of Firebase project parameters
const resolvedProjectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId;
const resolvedStorageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket;
const resolvedDatabaseId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  try {
    adminApp = initializeApp({
      projectId: resolvedProjectId,
      storageBucket: resolvedStorageBucket,
    });
  } catch (err) {
    console.warn('Firebase Admin default initialization warning:', err);
    adminApp = getApps()[0];
  }
} else {
  adminApp = getApps()[0];
}

// Authoritative Firestore instance targeting the applet database
export const adminAuth: Auth = getAuth(adminApp);

let dbInstance: Firestore;
try {
  // Target the specific firestore database ID
  if (resolvedDatabaseId && resolvedDatabaseId !== '(default)') {
    dbInstance = getFirestore(adminApp, resolvedDatabaseId);
  } else {
    dbInstance = getFirestore(adminApp);
  }
} catch (e) {
  dbInstance = getFirestore(adminApp);
}

export const adminDb: Firestore = dbInstance;

export interface AuthUser {
  uid: string;
  email?: string;
  role: 'student' | 'subscriber' | 'admin';
}

/**
 * Verifies Firebase ID Token from Authorization header.
 */
export async function verifyUserToken(authHeader?: string): Promise<AuthUser | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    // Secure verification: check custom claims (admin: true or role: 'admin') and authorized admin emails
    const hasAdminClaim = decoded.admin === true || decoded.role === 'admin';
    const isAdminEmail = decoded.email === 'democustomersupportservices@gmail.com' ||
                         decoded.email === 'admin@digitalexammentor.ng';
    const role: 'student' | 'subscriber' | 'admin' = 
      hasAdminClaim || isAdminEmail 
        ? 'admin' 
        : decoded.role === 'subscriber' 
          ? 'subscriber' 
          : 'student';

    return {
      uid: decoded.uid,
      email: decoded.email,
      role
    };
  } catch (verifyError) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Cryptographic token verification failed in production:', (verifyError as any)?.message);
      return null;
    }
    // Development-only fallback: decode valid Firebase JWT if admin credentials are in local dev emulator
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        const uid = payload.user_id || payload.sub;
        if (uid) {
          const isAdminEmail = payload.email === 'democustomersupportservices@gmail.com' ||
                               payload.email === 'admin@digitalexammentor.ng';
          return {
            uid,
            email: payload.email || '',
            role: payload.admin === true || payload.role === 'admin' || isAdminEmail ? 'admin' : 'student'
          };
        }
      }
    } catch (parseErr) {
      // invalid token format
    }
    return null;
  }
}

/**
 * Assign custom claims to a user via Firebase Admin.
 */
export async function setUserRoleClaim(uid: string, role: 'student' | 'subscriber' | 'admin') {
  try {
    await adminAuth.setCustomUserClaims(uid, {
      role,
      admin: role === 'admin'
    });
    return true;
  } catch (err) {
    console.error(`Failed to set custom claim for user ${uid}:`, err);
    return false;
  }
}
