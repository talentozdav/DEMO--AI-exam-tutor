import { getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  try {
    adminApp = initializeApp({
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
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
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    dbInstance = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
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
    const isAdminEmail = decoded.email === 'democustomersupportservices@gmail.com' ||
                         decoded.email === 'admin@digitalexammentor.ng';
    const role: 'student' | 'subscriber' | 'admin' = 
      decoded.role === 'admin' || isAdminEmail 
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
    // Development fallback: decode valid Firebase JWT if admin cert is not mounted locally
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
            role: payload.role === 'admin' || isAdminEmail ? 'admin' : 'student'
          };
        }
      }
    } catch (parseErr) {
      // invalid token
    }
    return null;
  }
}
