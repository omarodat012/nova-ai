import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { requireDb } from '../firebase/config.js';

const MEMBERS = 'members';

// `member` is the normalized admin form: { fullName, phone, email, subteam, role, isStudent, major, university, academicYear }.
export function addMember(member) {
  return addDoc(collection(requireDb(), MEMBERS), { ...member, createdAt: serverTimestamp() });
}

export function updateMember(id, member) {
  return updateDoc(doc(requireDb(), MEMBERS, id), { ...member, updatedAt: serverTimestamp() });
}

export function deleteMember(id) {
  return deleteDoc(doc(requireDb(), MEMBERS, id));
}
