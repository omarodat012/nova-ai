import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db, requireDb } from '../firebase/config.js';

const ACHIEVEMENTS = 'achievements';

// Document shape: { title: { ar, en }, description: { ar, en }, date: 'YYYY-MM-DD', image: string | null }.
// `image` is a photos folder (/assets/achievements/<folder>) or a single image; see utils/achievementMedia.js.
// Newest first. Resolves to [] when Firebase is not configured so the home page can show its placeholders.
export async function fetchAchievements() {
  if (!db) return [];
  const snapshot = await getDocs(query(collection(db, ACHIEVEMENTS), orderBy('date', 'desc')));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
}

// Resolves to null when the post does not exist (or Firebase is not configured).
export async function fetchAchievement(id) {
  if (!db) return null;
  const snapshot = await getDoc(doc(db, ACHIEVEMENTS, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export function addAchievement(achievement) {
  return addDoc(collection(requireDb(), ACHIEVEMENTS), { ...achievement, createdAt: serverTimestamp() });
}

export function updateAchievement(id, achievement) {
  return updateDoc(doc(requireDb(), ACHIEVEMENTS, id), { ...achievement, updatedAt: serverTimestamp() });
}

export function deleteAchievement(id) {
  return deleteDoc(doc(requireDb(), ACHIEVEMENTS, id));
}
