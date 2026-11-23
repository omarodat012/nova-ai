import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, requireDb } from '../firebase/config.js';

// settings/novaStatus: { active: boolean, title: string, message: string, imageData: string | null, updatedAt }.
// Admins publish it from the dashboard; everyone, signed in or not, sees it on the home page.
const SETTINGS = 'settings';
const NOVA_STATUS = 'novaStatus';

export const TITLE_MAX_LENGTH = 120;
export const MESSAGE_MAX_LENGTH = 600;

// Gives every field a defined value, so a missing document reads as "no status".
export function toNovaStatus(raw) {
  return {
    active: raw?.active === true,
    title: typeof raw?.title === 'string' ? raw.title.trim() : '',
    message: typeof raw?.message === 'string' ? raw.message.trim() : '',
    imageData: typeof raw?.imageData === 'string' && raw.imageData ? raw.imageData : null,
    updatedAt: raw?.updatedAt ?? null,
  };
}

export const EMPTY_NOVA_STATUS = toNovaStatus(null);

// A status is shown only while it is active and has a headline or an image.
export function isNovaStatusVisible(status) {
  return status.active && Boolean(status.title || status.imageData);
}

// Calls back with the status now and on every change. Returns the unsubscribe function.
export function subscribeToNovaStatus(onStatus, onError) {
  if (!db) {
    onStatus(EMPTY_NOVA_STATUS);
    return () => {};
  }

  return onSnapshot(
    doc(db, SETTINGS, NOVA_STATUS),
    // 'estimate' gives the admin who just published a usable updatedAt before the server confirms it.
    (snapshot) => onStatus(toNovaStatus(snapshot.data({ serverTimestamps: 'estimate' }))),
    onError,
  );
}

export function publishNovaStatus({ title, message, imageData }) {
  return setDoc(doc(requireDb(), SETTINGS, NOVA_STATUS), {
    active: true,
    title: title.trim(),
    message: message.trim(),
    imageData: imageData || null,
    updatedAt: serverTimestamp(),
  });
}

export function clearNovaStatus() {
  return setDoc(doc(requireDb(), SETTINGS, NOVA_STATUS), {
    active: false,
    title: '',
    message: '',
    imageData: null,
    updatedAt: serverTimestamp(),
  });
}
