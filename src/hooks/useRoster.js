import { useEffect, useState } from 'react';
import { DEFAULT_ROSTER_SETTINGS, subscribeToRosterSettings, toRosterSettings } from '../services/rosterSettingsService.js';
import { subscribeToSubteamMembers } from '../services/membersService.js';

// Used when the settings cannot be read: nothing is shown to members rather than risking showing too much.
const HIDDEN_ROSTER_SETTINGS = toRosterSettings({
  showRoster: Object.fromEntries(Object.keys(DEFAULT_ROSTER_SETTINGS.showRoster).map((id) => [id, false])),
});

// Live settings/rosterVisibility. Pass `enabled` only for accounts allowed to read it (a verified email).
export function useRosterSettings(enabled) {
  const [state, setState] = useState({ settings: DEFAULT_ROSTER_SETTINGS, loading: true, error: null });

  useEffect(() => {
    if (!enabled) return undefined;
    return subscribeToRosterSettings(
      (settings) => setState({ settings, loading: false, error: null }),
      (error) => {
        console.warn(`[NOVA AI] Could not load the roster settings (${error.code}).`);
        setState({ settings: HIDDEN_ROSTER_SETTINGS, loading: false, error });
      },
    );
  }, [enabled]);

  return state;
}

// Live members of one SubTeam. Pass `enabled` only for admins and NOVA AI members; firestore.rules refuses everyone else.
export function useSubteamRoster(subteamId, enabled) {
  const [state, setState] = useState({ subteamId: null, members: [], error: null });

  useEffect(() => {
    if (!enabled) return undefined;
    return subscribeToSubteamMembers(
      subteamId,
      (members) => setState({ subteamId, members, error: null }),
      (error) => {
        console.warn(`[NOVA AI] Could not load the SubTeam roster (${error.code}).`);
        setState({ subteamId, members: [], error });
      },
    );
  }, [subteamId, enabled]);

  // Answers for another SubTeam are ignored, so switching pages never flashes the previous team's members.
  const current = state.subteamId === subteamId;
  return { members: current ? state.members : [], loading: !current, error: current ? state.error : null };
}
