export const memberRoles = [
  { id: 'member', label: { ar: 'عضو', en: 'Member' } },
  { id: 'leader', label: { ar: 'قائد فريق', en: 'Team Leader' } },
];

export function getRoleById(id) {
  return memberRoles.find((role) => role.id === id);
}
