import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { requireDb } from '../firebase/config.js';

const MEMBERS = 'members';

// `emailLower` is what a signed-in account is matched against, so every admin write stores it next to `email`.
export function toEmailLower(email) {
  return email?.trim().toLowerCase() || null;
}

// `member` is the normalized admin form: { fullName, phone, email, subteam, role, isStudent, major, university, academicYear }.
export function addMember(member) {
  return addDoc(collection(requireDb(), MEMBERS), {
    ...member,
    emailLower: toEmailLower(member.email),
    createdAt: serverTimestamp(),
  });
}

export function updateMember(id, member) {
  return updateDoc(doc(requireDb(), MEMBERS, id), {
    ...member,
    emailLower: toEmailLower(member.email),
    updatedAt: serverTimestamp(),
  });
}

export function deleteMember(id) {
  return deleteDoc(doc(requireDb(), MEMBERS, id));
}

// The member document of a signed-in account ({ id, ...data }), or null when the address is not a member.
// firestore.rules only allows these two exact queries, and only for an account whose email is verified.
export async function findMemberByEmail(email) {
  const emailLower = toEmailLower(email);
  if (!emailLower) return null;

  const members = collection(requireDb(), MEMBERS);
  // Documents saved before `emailLower` existed only have `email`.
  for (const field of ['emailLower', 'email']) {
    const snapshot = await getDocs(query(members, where(field, '==', emailLower), limit(1)));
    if (!snapshot.empty) return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
}

// What a member may change about themselves. firestore.rules rejects any other field (role, subteam, email...).
export function updateOwnProfile(id, { fullName, phone, isStudent, major, university, academicYear, photoURL }) {
  return updateDoc(doc(requireDb(), MEMBERS, id), {
    fullName,
    phone,
    isStudent,
    major,
    university,
    academicYear,
    photoURL,
    updatedAt: serverTimestamp(),
  });
}
