import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { FirebaseNotConfiguredError, auth, db, googleProvider, isFirebaseConfigured } from '../firebase/config.js';

// Keep this list in sync with isAdmin() in firestore.rules, which is what actually enforces access.
const ADMIN_EMAILS = ['omarodat012@gmail.com', 'shahla.alzawahreh33@gmail.com'];

const AuthContext = createContext(null);

function isAdminEmail(email) {
  return Boolean(email) && ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

function toUser(firebaseUser) {
  const { uid, email, displayName, photoURL, emailVerified } = firebaseUser;
  return { uid, email, displayName, photoURL, emailVerified };
}

// Creates users/{uid} the first time someone signs in; later logins leave the document untouched.
async function ensureUserProfile(firebaseUser) {
  try {
    const profileRef = doc(db, 'users', firebaseUser.uid);
    if ((await getDoc(profileRef)).exists()) return;
    await setDoc(profileRef, {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName ?? null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // A profile write must never block sign-in (e.g. when the Firestore rules are not published yet).
    console.warn('[NOVA AI] Could not sync the user profile to Firestore.', error);
  }
}

function requireAuth() {
  if (!auth) throw new FirebaseNotConfiguredError();
  return auth;
}

async function signUp({ displayName, email, password }) {
  const { user } = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
  await updateProfile(user, { displayName: displayName.trim() });
  await ensureUserProfile(user);
  return user;
}

async function logIn({ email, password }) {
  const { user } = await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
  await ensureUserProfile(user);
  return user;
}

async function logInWithGoogle() {
  const { user } = await signInWithPopup(requireAuth(), googleProvider);
  await ensureUserProfile(user);
  return user;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toUser(firebaseUser) : null);
      setLoading(false);
    });
  }, []);

  const value = useMemo(() => {
    // The auth listener fires before updateProfile() and popup linking finish, so re-read the user afterwards.
    const refreshAfter = (action) => async (credentials) => {
      setUser(toUser(await action(credentials)));
    };
    const hasAdminEmail = isAdminEmail(user?.email);

    return {
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      // Admin addresses only count once verified; Google sign-in verifies them automatically.
      isAdmin: hasAdminEmail && user.emailVerified,
      needsAdminVerification: hasAdminEmail && !user.emailVerified,
      signUp: refreshAfter(signUp),
      logIn: refreshAfter(logIn),
      logInWithGoogle: refreshAfter(logInWithGoogle),
      logOut: () => signOut(requireAuth()),
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
