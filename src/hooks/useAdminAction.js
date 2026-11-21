import { useState } from 'react';

const ERROR_KEYS = {
  'permission-denied': 'permission',
  'application/already-reviewed': 'alreadyReviewed',
  'firebase/not-configured': 'permission',
};

// Runs one admin write at a time. `busyId` marks the row being changed; `errorKey` is a key under `admin.errors`.
export function useAdminAction() {
  const [busyId, setBusyId] = useState(null);
  const [errorKey, setErrorKey] = useState(null);

  const run = async (id, action) => {
    setBusyId(id);
    setErrorKey(null);
    try {
      await action();
      return true;
    } catch (error) {
      console.error('[NOVA AI] Admin action failed.', error);
      setErrorKey(ERROR_KEYS[error.code] ?? 'action');
      return false;
    } finally {
      setBusyId(null);
    }
  };

  return { busyId, errorKey, run };
}
