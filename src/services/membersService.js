import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { SUPERVISOR_MEMBER_ID } from '../data/memberRoles.js';
import { requireDb } from '../firebase/config.js';

const MEMBERS = 'members';
// One empty-ish document per member address (document ID = lowercased email). firestore.rules checks it to decide
// whether a signed-in account is a NOVA AI member, which is what lets members read the SubTeam rosters.
const MEMBER_EMAILS = 'member_emails';
const BATCH_LIMIT = 400;

// `emailLower` is what a signed-in account is matched against, so every admin write stores it next to `email`.
export function toEmailLower(email) {
  return email?.trim().toLowerCase() || null;
}

// The lookup document of an address, or null when there is no address (or it cannot be a document ID).
export function memberEmailRef(db, email) {
  const emailLower = toEmailLower(email);
  return emailLower && !emailLower.includes('/') ? doc(db, MEMBER_EMAILS, emailLower) : null;
}

export function memberEmailData() {
  return { updatedAt: serverTimestamp() };
}

// Two member documents can share an address; its lookup document must outlive either one of them.
async function isEmailUsedByAnotherMember(db, emailLower, memberId) {
  for (const field of ['emailLower', 'email']) {
    const snapshot = await getDocs(query(collection(db, MEMBERS), where(field, '==', emailLower), limit(2)));
    if (snapshot.docs.some((document) => document.id !== memberId)) return true;
  }
  return false;
}

// `member` is the normalized admin form: { fullName, phone, email, subteam, role, isStudent, major, university, academicYear }.
export async function addMember(member) {
  const db = requireDb();
  const batch = writeBatch(db);
  const lookup = memberEmailRef(db, member.email);

  batch.set(doc(collection(db, MEMBERS)), {
    ...member,
    emailLower: toEmailLower(member.email),
    createdAt: serverTimestamp(),
  });
  if (lookup) batch.set(lookup, memberEmailData());
  await batch.commit();
}

// `previousEmail` is the address the document had before this edit, so its lookup document can be retired.
export async function updateMember(id, member, previousEmail) {
  const db = requireDb();
  const batch = writeBatch(db);
  const lookup = memberEmailRef(db, member.email);
  const previousLookup = memberEmailRef(db, previousEmail);

  batch.update(doc(db, MEMBERS, id), {
    ...member,
    emailLower: toEmailLower(member.email),
    updatedAt: serverTimestamp(),
  });
  if (lookup) batch.set(lookup, memberEmailData());
  if (previousLookup && previousLookup.id !== lookup?.id && !(await isEmailUsedByAnotherMember(db, previousLookup.id, id))) {
    batch.delete(previousLookup);
  }
  await batch.commit();
}

export async function deleteMember(id, email) {
  const db = requireDb();
  const batch = writeBatch(db);
  const lookup = memberEmailRef(db, email);

  batch.delete(doc(db, MEMBERS, id));
  if (lookup && !(await isEmailUsedByAnotherMember(db, lookup.id, id))) batch.delete(lookup);
  await batch.commit();
}

// Brings `member_emails` in line with the full members list: adds the missing addresses and removes the ones
// no member has any more. Resolves to the number of documents it changed. Admins only (see firestore.rules).
export async function syncMemberEmails(members) {
  const db = requireDb();
  const wanted = new Set(members.map((member) => memberEmailRef(db, member.emailLower ?? member.email)?.id).filter(Boolean));
  const existing = new Set((await getDocs(collection(db, MEMBER_EMAILS))).docs.map((document) => document.id));

  const changes = [
    ...[...wanted].filter((id) => !existing.has(id)).map((id) => (batch) => batch.set(doc(db, MEMBER_EMAILS, id), memberEmailData())),
    ...[...existing].filter((id) => !wanted.has(id)).map((id) => (batch) => batch.delete(doc(db, MEMBER_EMAILS, id))),
  ];

  for (let start = 0; start < changes.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    changes.slice(start, start + BATCH_LIMIT).forEach((apply) => apply(batch));
    await batch.commit();
  }
  return changes.length;
}

// The member document of a signed-in account ({ id, ...data }), or null when the address is not a member.
// firestore.rules only lets a non-member run these two exact queries, and only once their email is verified.
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

// Live list of one SubTeam's members. firestore.rules only allows it for admins and verified NOVA AI members.
// Returns the unsubscribe function.
export function subscribeToSubteamMembers(subteamId, onMembers, onError) {
  return onSnapshot(
    query(collection(requireDb(), MEMBERS), where('subteam', '==', subteamId)),
    (snapshot) => onMembers(snapshot.docs.map((document) => ({ id: document.id, ...document.data() }))),
    onError,
  );
}

// The Faculty Supervisor's first profile save, when no admin has added her to `members` yet.
// firestore.rules allows exactly this document, for her verified address only.
export function createSupervisorProfile(email, { fullName, phone, photoURL }) {
  const emailLower = toEmailLower(email);
  return setDoc(doc(requireDb(), MEMBERS, SUPERVISOR_MEMBER_ID), {
    fullName,
    phone,
    photoURL,
    email: emailLower,
    emailLower,
    role: 'supervisor',
    subteam: null,
    isStudent: false,
    major: null,
    university: null,
    academicYear: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
