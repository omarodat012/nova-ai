import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { requireDb } from '../firebase/config.js';

export const FEEDBACK = 'feedback';

// `feedback` is the normalized form: { uid, userName, userEmail, isMember, category, message }. Any signed-in
// account may submit; firestore.rules checks that `uid` is the caller's own.
export function submitFeedback(feedback) {
  return addDoc(collection(requireDb(), FEEDBACK), { ...feedback, status: 'new', createdAt: serverTimestamp() });
}

export function markFeedbackReviewed(id) {
  return updateDoc(doc(requireDb(), FEEDBACK, id), { status: 'reviewed', reviewedAt: serverTimestamp() });
}

export function deleteFeedback(id) {
  return deleteDoc(doc(requireDb(), FEEDBACK, id));
}
