import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, requireDb } from '../firebase/config.js';
import { toEmailLower } from './membersService.js';

const APPLICATIONS = 'applications';

// Called by MembershipForm. `formData` is the normalized form (see toApplication in MembershipForm.jsx).
export async function submitApplication(formData) {
  const application = { ...formData, status: 'pending', submittedByUid: auth?.currentUser?.uid || null };
  const reference = await addDoc(collection(requireDb(), APPLICATIONS), {
    ...application,
    createdAt: serverTimestamp(),
  });
  return { id: reference.id, ...application };
}

// Marks the application approved and adds the applicant to `members` in one atomic write.
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
    transaction.set(doc(collection(db, 'members')), {
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
  });
}

export function rejectApplication(id) {
  return updateDoc(doc(requireDb(), APPLICATIONS, id), { status: 'rejected', reviewedAt: serverTimestamp() });
}

export function deleteApplication(id) {
  return deleteDoc(doc(requireDb(), APPLICATIONS, id));
}
