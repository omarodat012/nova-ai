const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

// Accepts a 'YYYY-MM-DD' string, a Date, or a Firestore Timestamp. Returns '' when there is no usable date.
export function formatDate(value, lang) {
  const isDateOnly = typeof value === 'string' && DATE_ONLY.test(value);
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value ?? NaN);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO' : 'en-GB', {
    dateStyle: 'long',
    // Date-only strings are parsed as UTC midnight; formatting in UTC keeps the same calendar day everywhere.
    timeZone: isDateOnly ? 'UTC' : undefined,
  }).format(date);
}

// Today's local calendar date as 'YYYY-MM-DD', the format <input type="date"> uses.
export function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
