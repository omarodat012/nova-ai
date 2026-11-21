const ERROR_KEYS = {
  'auth/invalid-credential': 'invalidCredential',
  'auth/wrong-password': 'invalidCredential',
  'auth/user-not-found': 'invalidCredential',
  'auth/invalid-email': 'invalidEmail',
  'auth/email-already-in-use': 'emailInUse',
  'auth/weak-password': 'weakPassword',
  'auth/password-does-not-meet-requirements': 'weakPassword',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/network-request-failed': 'network',
  'auth/popup-blocked': 'popupBlocked',
  'auth/operation-not-allowed': 'providerDisabled',
  'auth/unauthorized-domain': 'unauthorizedDomain',
  'auth/account-exists-with-different-credential': 'differentProvider',
  'auth/user-disabled': 'userDisabled',
  'firebase/not-configured': 'notConfigured',
};

const DISMISSED_CODES = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'];

// Returns a key under `auth.errors` in the translations, or null when the user simply closed the Google popup.
export function getAuthErrorKey(error) {
  if (DISMISSED_CODES.includes(error?.code)) return null;
  return ERROR_KEYS[error?.code] ?? 'generic';
}
