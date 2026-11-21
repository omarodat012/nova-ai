import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { FirebaseNotConfiguredError, auth, db, googleProvider, isFirebaseConfigured, requireDb } from '../firebase/config.js';
import { findMemberByEmail } from '../services/membersService.js';
import { useLanguage } from './LanguageContext.jsx';

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

function newUserProfile(firebaseUser) {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName ?? null,
    createdAt: serverTimestamp(),
  };
}

// Creates users/{uid} the first time someone signs in; later logins leave the document untouched.
async function ensureUserProfile(firebaseUser) {
  try {
    const profileRef = doc(db, 'users', firebaseUser.uid);
    if ((await getDoc(profileRef)).exists()) return;
    await setDoc(profileRef, newUserProfile(firebaseUser));
  } catch (error) {
    // A profile write must never block sign-in (e.g. when the Firestore rules are not published yet).
    console.warn('[NOVA AI] Could not sync the user profile to Firestore.', error);
  }
}

function requireAuth() {
  if (!auth) throw new FirebaseNotConfiguredError();
  return auth;
}

// Resolves to { user, verificationSent }. A failed email never fails the sign-up: the link can be sent again.
async function signUp({ displayName, email, password }) {
  const { user } = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
  // The name is saved first so the verification email can greet the person by name.
  await updateProfile(user, { displayName: displayName.trim() });
  const verificationSent = await sendEmailVerification(user).then(
    () => true,
    (error) => {
      console.warn('[NOVA AI] Could not send the verification email.', error);
      return false;
    },
  );
  await ensureUserProfile(user);
  return { user, verificationSent };
}

async function logIn({ email, password }) {
  const { user } = await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
  await ensureUserProfile(user);
  return { user };
}

async function logInWithGoogle() {
  const { user } = await signInWithPopup(requireAuth(), googleProvider);
  await ensureUserProfile(user);
  return { user };
}

export function AuthProvider({ children }) {
  const { lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  // The last members lookup, tagged with the account it was made for: { uid, profile }.
  const [membership, setMembership] = useState(null);
  // When the last verification email went out, tagged the same way: { uid, at }. Drives the "Resend" cooldown.
  const [verificationSent, setVerificationSent] = useState(null);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toUser(firebaseUser) : null);
      setLoading(false);
    });
  }, []);

  // Firebase writes its emails (verification links) in this language.
  useEffect(() => {
    if (auth) auth.languageCode = lang;
  }, [lang]);

  // Looks the signed-in account up in the `members` collection and resolves to the member document or null.
  const refreshMemberProfile = useCallback(async () => {
    const current = auth?.currentUser;
    if (!current) return null;

    const isCurrent = () => auth.currentUser?.uid === current.uid;
    try {
      if (!current.emailVerified) {
        // Picks up a verification link that was opened since this session started.
        await current.reload();
        if (current.emailVerified) {
          await current.getIdToken(true);
          if (isCurrent()) setUser(toUser(current));
        }
      }
      // firestore.rules only lets a verified address read its member document.
      const profile = current.emailVerified ? await findMemberByEmail(current.email) : null;
      if (isCurrent()) setMembership({ uid: current.uid, profile });
      return profile;
    } catch (error) {
      // Being unable to check membership must never break the session, nor demote a member we already recognized.
      console.warn('[NOVA AI] Could not check the members list.', error);
      if (isCurrent()) setMembership((known) => (known?.uid === current.uid ? known : { uid: current.uid, profile: null }));
      return null;
    }
  }, []);

  // Asks Firebase whether the verification link has been opened. Resolves to { verified, member }, where `member`
  // is the account's `members` document when it turns out to belong to a NOVA AI member.
  const confirmEmailVerified = useCallback(async () => {
    const current = requireAuth().currentUser;
    if (!current) return { verified: false, member: null };

    await current.reload();
    if (!current.emailVerified) return { verified: false, member: null };

    // The ID token still says "unverified" until it is refreshed, and firestore.rules reads the token.
    await current.getIdToken(true);
    setUser(toUser(current));
    return { verified: true, member: await refreshMemberProfile() };
  }, [refreshMemberProfile]);

  const sendVerificationEmail = useCallback(async () => {
    const current = requireAuth().currentUser;
    await sendEmailVerification(current);
    setVerificationSent({ uid: current.uid, at: Date.now() });
  }, []);

  // Renames the signed-in account: users/{uid} in Firestore, then Firebase Auth, then the name shown in the navbar.
  const updateDisplayName = useCallback(async (name) => {
    const current = requireAuth().currentUser;
    const displayName = name.trim();
    const profileRef = doc(requireDb(), 'users', current.uid);

    if ((await getDoc(profileRef)).exists()) {
      await updateDoc(profileRef, { displayName, updatedAt: serverTimestamp() });
    } else {
      await setDoc(profileRef, { ...newUserProfile(current), displayName });
    }
    await updateProfile(current, { displayName });
    setUser(toUser(current));
  }, []);

  const uid = user?.uid;
  useEffect(() => {
    if (uid) refreshMemberProfile();
  }, [uid, refreshMemberProfile]);

  const value = useMemo(() => {
    // The auth listener fires before updateProfile() and popup linking finish, so re-read the user afterwards.
    // Resolves to the signed-in user, so the caller can tell whether the email still needs verifying.
    const refreshAfter = (action) => async (credentials) => {
      const result = await action(credentials);
      const signedIn = toUser(result.user);
      setUser(signedIn);
      if (result.verificationSent) setVerificationSent({ uid: signedIn.uid, at: Date.now() });
      return signedIn;
    };
    const hasAdminEmail = isAdminEmail(user?.email);
    const memberChecked = Boolean(user) && membership?.uid === user.uid;

    return {
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      // Admin addresses only count once verified; Google sign-in verifies them automatically.
      isAdmin: hasAdminEmail && user.emailVerified,
      needsAdminVerification: hasAdminEmail && !user.emailVerified,
      // The matching `members` document ({ id, ...fields }), or null when this account is not a member.
      memberProfile: memberChecked ? membership.profile : null,
      memberLoading: Boolean(user) && !memberChecked,
      refreshMemberProfile,
      // Timestamp (ms) of the last verification email sent to this account in this session, or null.
      verificationSentAt: user && verificationSent?.uid === user.uid ? verificationSent.at : null,
      sendVerificationEmail,
      confirmEmailVerified,
      updateDisplayName,
      signUp: refreshAfter(signUp),
      logIn: refreshAfter(logIn),
      logInWithGoogle: refreshAfter(logInWithGoogle),
      logOut: () => signOut(requireAuth()),
    };
  }, [user, loading, membership, verificationSent, refreshMemberProfile, sendVerificationEmail, confirmEmailVerified, updateDisplayName]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
