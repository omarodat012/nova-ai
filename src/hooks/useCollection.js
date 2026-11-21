import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Live subscription to a whole Firestore collection. `error` is the Firestore error (e.g. permission-denied).
export function useCollection(name) {
  const [state, setState] = useState({ items: [], loading: Boolean(db), error: null });

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(
      collection(db, name),
      (snapshot) => {
        setState({
          items: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })),
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.error(`[NOVA AI] Could not load "${name}" from Firestore.`, error);
        setState({ items: [], loading: false, error });
      },
    );
  }, [name]);

  return state;
}
