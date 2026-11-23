export const memberRoles = [
  { id: 'member', label: { ar: 'عضو', en: 'Member' } },
  { id: 'leader', label: { ar: 'قائد فريق', en: 'Team Leader' } },
  { id: 'supervisor', label: { ar: 'مشرف', en: 'Supervisor' } },
];

export function getRoleById(id) {
  return memberRoles.find((role) => role.id === id);
}

// NOVA AI has a single Faculty Supervisor. Keep the address in sync with isSupervisor() in firestore.rules.
export const SUPERVISOR_EMAIL = 'enas.a@yu.edu.jo';
export const SUPERVISOR_MEMBER_ID = 'supervisor';
export const SUPERVISOR_PHOTO = '/assets/supervisor.jpg';
export const SUPERVISOR_NAME = { ar: 'د. إيناس خشاشنة', en: 'Dr. Enas Khashashneh' };

// Role values that count as leadership, including ones typed by hand into older documents.
const LEADER_ROLES = [
  'leader',
  'co-leader',
  'coleader',
  'co leader',
  'team leader',
  'founder',
  'co-founder',
  'قائد',
  'قائدة',
  'قائد فريق',
  'قائدة فريق',
  'نائب قائد',
  'نائبة قائد',
  'مؤسس',
  'مؤسسة',
];

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function isSupervisorEmail(email) {
  return normalize(email) === SUPERVISOR_EMAIL;
}

// 'supervisor' | 'leader' | 'member' | null for a person with this `members` document (or null) and this address.
// `subteams` are the SubTeams with their live leaders; an address listed there is a leader even without the role.
export function getRoleTier({ member = null, email = null, subteams = [] }) {
  const address = normalize(email ?? member?.emailLower ?? member?.email);
  const role = normalize(member?.role);

  if (role === 'supervisor' || address === SUPERVISOR_EMAIL) return 'supervisor';
  if (LEADER_ROLES.includes(role)) return 'leader';
  if (address && subteams.some((team) => team.leaders.some((leader) => normalize(leader.email) === address))) return 'leader';
  return member ? 'member' : null;
}

// A member's own photo, or the supervisor's official portrait until she uploads one.
export function getMemberPhoto(member) {
  if (member?.photoURL) return member.photoURL;
  return member && getRoleTier({ member }) === 'supervisor' ? SUPERVISOR_PHOTO : null;
}
