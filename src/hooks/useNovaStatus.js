import { useEffect, useState } from 'react';
import { EMPTY_NOVA_STATUS, subscribeToNovaStatus } from '../services/novaStatusService.js';

// Live settings/novaStatus. A read error leaves the status empty, so the home page simply shows nothing.
export function useNovaStatus() {
  const [state, setState] = useState({ status: EMPTY_NOVA_STATUS, loading: true, error: null });

  useEffect(
    () =>
      subscribeToNovaStatus(
        (status) => setState({ status, loading: false, error: null }),
        (error) => {
          console.warn(`[NOVA AI] Could not load the NOVA status (${error.code}).`);
          setState({ status: EMPTY_NOVA_STATUS, loading: false, error });
        },
      ),
    [],
  );

  return state;
}
