import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subteams as defaultSubteams } from '../data/subteams.js';
import { subscribeToLeaderOverrides, toLeaders } from '../services/subteamLeadersService.js';

const SubteamsContext = createContext(null);

// The SubTeams with their live leaders: Firestore `subteam_leaders` first, src/data/subteams.js as the fallback.
export function SubteamsProvider({ children }) {
  const [overrides, setOverrides] = useState({});

  useEffect(() => subscribeToLeaderOverrides(setOverrides), []);

  const value = useMemo(() => {
    const subteams = defaultSubteams.map((team) => ({
      ...team,
      leaders: overrides[team.id] ?? toLeaders(team.leaders),
    }));
    return { subteams, getSubteam: (id) => subteams.find((team) => team.id === id) };
  }, [overrides]);

  return <SubteamsContext.Provider value={value}>{children}</SubteamsContext.Provider>;
}

export function useSubteams() {
  const context = useContext(SubteamsContext);
  if (!context) throw new Error('useSubteams must be used inside <SubteamsProvider>');
  return context;
}
