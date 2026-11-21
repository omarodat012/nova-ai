import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, requireDb } from '../firebase/config.js';

// One document per SubTeam (document ID = subteam ID) holding { leaders: [...], updatedAt }.
// A document replaces the team's default leaders from src/data/subteams.js; an empty array means "open for leadership".
export const SUBTEAM_LEADERS = 'subteam_leaders';

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function bilingual(value) {
  return { ar: text(value?.ar), en: text(value?.en) };
}

// Fills in every field so the UI can read a leader saved by hand or by an older version of the form.
export function toLeader(raw) {
  const name = bilingual(raw?.name);

  return {
    name: { ar: name.ar || name.en, en: name.en || name.ar },
    photo: text(raw?.photo),
    email: text(raw?.email),
    phone: text(raw?.phone),
    major: bilingual(raw?.major),
    academicYear: bilingual(raw?.academicYear),
  };
}

export function toLeaders(value) {
  if (!Array.isArray(value)) return [];
  return value.map(toLeader).filter((leader) => leader.name.ar);
}

// Calls back with { [subteamId]: leaders[] } now and on every change. Returns the unsubscribe function.
export function subscribeToLeaderOverrides(callback) {
  if (!db) return () => {};

  return onSnapshot(
    collection(db, SUBTEAM_LEADERS),
    (snapshot) => {
      callback(Object.fromEntries(snapshot.docs.map((document) => [document.id, toLeaders(document.data().leaders)])));
    },
    (error) => {
      console.warn(`[NOVA AI] Could not load SubTeam leaders (${error.code}). Showing the default leaders instead.`);
      callback({});
    },
  );
}

export function saveSubteamLeaders(subteamId, leaders) {
  return setDoc(doc(requireDb(), SUBTEAM_LEADERS, subteamId), { leaders, updatedAt: serverTimestamp() });
}
