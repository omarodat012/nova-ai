import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Live subscription to a whole Firestore collection. `error` is the Firestore error (e.g. permission-denied).
// `fromCache` is true while `items` is only what this browser already had cached, which can be a small part of the
// collection (e.g. the one member document read at sign-in). Never treat such a list as the complete collection.
export function useCollection(name) {
  const [state, setState] = useState({ items: [], loading: Boolean(db), error: null, fromCache: true });

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(
      collection(db, name),
      (snapshot) => {
        setState({
          items: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })),
          loading: false,
          error: null,
          fromCache: snapshot.metadata.fromCache,
        });
      },
      (error) => {
        console.error(`[NOVA AI] Could not load "${name}" from Firestore.`, error);
        setState({ items: [], loading: false, error, fromCache: true });
      },
    );
  }, [name]);

  return state;
}
