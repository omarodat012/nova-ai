import { collection, doc, getDocs, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { SUPERVISOR_MEMBER_ID, getRoleTier } from '../data/memberRoles.js';
import { requireDb } from '../firebase/config.js';

// The public face of `members` (document ID = member ID), shown to every visitor in the home page team strip.
// It holds a name, photo, role and SubTeam only. Phones and emails never leave `members`.
const PUBLIC_MEMBERS = 'public_members';
// A photo can be close to 100 KB and one batch is capped at 10 MB, so the reconcile writes in small batches.
const BATCH_LIMIT = 40;
const COMPARED_FIELDS = ['name', 'photoURL', 'role', 'roleTier', 'subteam'];

export function publicMemberRef(db, memberId) {
  return doc(db, PUBLIC_MEMBERS, memberId);
}

// Same limits as isValidPhoto() in firestore.rules, so one odd photo cannot make a whole batch fail.
function toPublicPhoto(photoURL) {
  return typeof photoURL === 'string' && photoURL.length <= 100000 && /^data:image\/(jpeg|png|webp);base64,/.test(photoURL)
    ? photoURL
    : null;
}

// What `public_members` shows for this `members` document, without `updatedAt`.
// Null for the Faculty Supervisor (by role or address) and for a member without a name: neither is listed.
function toPublicFields(member) {
  const name = typeof member.fullName === 'string' ? member.fullName.trim().slice(0, 120) : '';
  const roleTier = getRoleTier({ member });
  if (!name || roleTier === 'supervisor') return null;

  return {
    name,
    photoURL: toPublicPhoto(member.photoURL),
    role: typeof member.role === 'string' && member.role ? member.role : 'member',
    roleTier,
    subteam: member.subteam || null,
  };
}

// The document an admin write stores. An admin edit leaves out the photo, which belongs to the member.
export function toPublicMember(member, { keepPhoto = false } = {}) {
  const fields = toPublicFields(member);
  if (!fields) return null;
  if (keepPhoto) delete fields.photoURL;
  return { ...fields, updatedAt: serverTimestamp() };
}

// Everyone on the public team strip. Readable by guests (see firestore.rules).
export async function fetchPublicMembers() {
  const snapshot = await getDocs(collection(requireDb(), PUBLIC_MEMBERS));
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
}

// Brings `public_members` in line with the full members list: adds or refreshes the non-supervisor members and
// removes everyone else. Resolves to the number of documents it changed. Admins only (see firestore.rules).
export async function syncPublicMembers(members) {
  const db = requireDb();
  const wanted = new Map();
  members.forEach((member) => {
    const fields = toPublicFields(member);
    if (fields) wanted.set(member.id, fields);
  });
  const existing = new Map(
    (await getDocs(collection(db, PUBLIC_MEMBERS))).docs.map((document) => [document.id, document.data()]),
  );

  const changes = [
    ...[...wanted]
      .filter(([id, fields]) => COMPARED_FIELDS.some((field) => (existing.get(id)?.[field] ?? null) !== fields[field]))
      .map(([id, fields]) => (batch) => batch.set(publicMemberRef(db, id), { ...fields, updatedAt: serverTimestamp() })),
    ...[...existing.keys()].filter((id) => !wanted.has(id)).map((id) => (batch) => batch.delete(publicMemberRef(db, id))),
  ];

  for (let start = 0; start < changes.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);
    changes.slice(start, start + BATCH_LIMIT).forEach((apply) => apply(batch));
    await batch.commit();
  }
  return changes.length;
}

// Copies a member's own name and photo to their public card. Members cannot create that card, so this fails for
// someone an admin has not synced yet; the next visit to the admin Members tab picks the change up instead.
export async function syncOwnPublicProfile(memberId, { fullName, photoURL }) {
  if (memberId === SUPERVISOR_MEMBER_ID) return;
  try {
    await updateDoc(publicMemberRef(requireDb(), memberId), {
      name: fullName,
      photoURL: toPublicPhoto(photoURL),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('[NOVA AI] Could not update the public team card; it will sync from the admin dashboard.', error);
  }
}
