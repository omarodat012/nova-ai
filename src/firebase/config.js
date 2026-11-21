import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const env = import.meta.env;

const ENV_VALUES = {
  VITE_FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: env.VITE_FIREBASE_APP_ID,
};

export const missingFirebaseKeys = Object.keys(ENV_VALUES).filter((key) => !ENV_VALUES[key]?.trim());
export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

// These stay null until the keys exist, so the rest of the app can render without Firebase.
let auth = null;
let db = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  const app = initializeApp({
    apiKey: ENV_VALUES.VITE_FIREBASE_API_KEY,
    authDomain: ENV_VALUES.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: ENV_VALUES.VITE_FIREBASE_PROJECT_ID,
    storageBucket: ENV_VALUES.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: ENV_VALUES.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: ENV_VALUES.VITE_FIREBASE_APP_ID,
  });

  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  // Optional: VITE_FIREBASE_USE_EMULATOR=true points a dev server at the local Firebase Emulator Suite.
  if (env.DEV && env.VITE_FIREBASE_USE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
} else {
  console.warn(
    `[NOVA AI] Firebase is not configured, so sign-in, applications and the admin dashboard are disabled.\n` +
      `Copy .env.example to .env, fill in: ${missingFirebaseKeys.join(', ')}, then restart the dev server.`,
  );
}

export { auth, db, googleProvider };

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super('Firebase is not configured. Add the VITE_FIREBASE_* keys to .env.');
    this.code = 'firebase/not-configured';
  }
}

export function requireDb() {
  if (!db) throw new FirebaseNotConfiguredError();
  return db;
}
