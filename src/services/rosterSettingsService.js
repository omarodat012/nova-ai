import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, requireDb } from '../firebase/config.js';
import { subteams } from '../data/subteams.js';

// settings/rosterVisibility: { showRoster: { [subteamId]: boolean }, showMemberDetails: boolean, updatedAt }.
// Admins edit it in the dashboard; it decides what verified members see in the "Team Members" section of a SubTeam page.
const SETTINGS = 'settings';
const ROSTER_VISIBILITY = 'rosterVisibility';

// Used until an admin saves the document: every roster is visible to members, contact and study details are hidden.
export const DEFAULT_ROSTER_SETTINGS = toRosterSettings(null);

// Fills in every switch, so a missing document or a SubTeam added later still gets a defined value.
export function toRosterSettings(raw) {
  return {
    showRoster: Object.fromEntries(subteams.map((team) => [team.id, raw?.showRoster?.[team.id] !== false])),
    showMemberDetails: raw?.showMemberDetails === true,
  };
}

// Calls back with the settings now and on every change. Returns the unsubscribe function.
// firestore.rules only lets signed-in accounts with a verified email read the document.
export function subscribeToRosterSettings(onSettings, onError) {
  if (!db) {
    onSettings(DEFAULT_ROSTER_SETTINGS);
    return () => {};
  }

  return onSnapshot(
    doc(db, SETTINGS, ROSTER_VISIBILITY),
    (snapshot) => onSettings(toRosterSettings(snapshot.data())),
    onError,
  );
}

export function saveRosterSettings({ showRoster, showMemberDetails }) {
  return setDoc(doc(requireDb(), SETTINGS, ROSTER_VISIBILITY), {
    showRoster,
    showMemberDetails,
    updatedAt: serverTimestamp(),
  });
}
