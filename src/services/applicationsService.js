import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, requireDb } from '../firebase/config.js';
import { memberEmailData, memberEmailRef, toEmailLower } from './membersService.js';
import { publicMemberRef, toPublicMember } from './publicMembersService.js';

const APPLICATIONS = 'applications';

// True when the address already belongs to a member. One exact-ID read, which is all firestore.rules lets a guest do
// on `member_emails`. If the check itself cannot run, the application goes ahead and firestore.rules has the last word.
async function isMemberEmail(db, email) {
  const lookup = memberEmailRef(db, email);
  if (!lookup) return false;
  try {
    return (await getDoc(lookup)).exists();
  } catch (error) {
    console.warn('[NOVA AI] Could not check whether this email is already a member.', error);
    return false;
  }
}

// Called by MembershipForm. `formData` is the normalized form (see toApplication in MembershipForm.jsx).
// Rejects with code 'application/already-member' when the email is already on the members list.
export async function submitApplication(formData) {
  const db = requireDb();
  if (await isMemberEmail(db, formData.email)) {
    throw Object.assign(new Error('This email already belongs to a member.'), { code: 'application/already-member' });
  }

  const application = { ...formData, status: 'pending', submittedByUid: auth?.currentUser?.uid || null };
  const reference = await addDoc(collection(db, APPLICATIONS), {
    ...application,
    createdAt: serverTimestamp(),
  });
  return { id: reference.id, ...application };
}

// Marks the application approved and adds the applicant to `members` (plus `member_emails` and `public_members`)
// in one atomic write.
// The transaction re-reads the application, so two admins approving at once cannot create two members.
export async function approveApplication(id) {
  const db = requireDb();
  const applicationRef = doc(db, APPLICATIONS, id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(applicationRef);
    const application = snapshot.data();
    if (application?.status !== 'pending') {
      throw Object.assign(new Error('This application has already been reviewed.'), {
        code: 'application/already-reviewed',
      });
    }

    transaction.update(applicationRef, { status: 'approved', reviewedAt: serverTimestamp() });
    const memberRef = doc(collection(db, 'members'));
    transaction.set(memberRef, {
      fullName: application.fullName,
      phone: application.phone,
      email: application.email,
      emailLower: toEmailLower(application.email),
      subteam: application.subteam,
      role: 'member',
      isStudent: application.isStudent,
      major: application.major ?? null,
      university: application.university ?? null,
      academicYear: application.academicYear ?? null,
      applicationId: id,
      createdAt: serverTimestamp(),
    });

    const lookup = memberEmailRef(db, application.email);
    if (lookup) transaction.set(lookup, memberEmailData());

    const publicMember = toPublicMember({ ...application, role: 'member' });
    if (publicMember) transaction.set(publicMemberRef(db, memberRef.id), publicMember);
  });
}

export function rejectApplication(id) {
  return updateDoc(doc(requireDb(), APPLICATIONS, id), { status: 'rejected', reviewedAt: serverTimestamp() });
}

export function deleteApplication(id) {
  return deleteDoc(doc(requireDb(), APPLICATIONS, id));
}
