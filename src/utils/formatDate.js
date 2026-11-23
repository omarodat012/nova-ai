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

const RELATIVE_UNITS = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];
const WEEK_SECONDS = 7 * 86400;

// "5 minutes ago" / "قبل 5 دقائق" for the last week, the full date for anything older. Same inputs as formatDate.
export function formatRelativeTime(value, lang) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value ?? NaN);
  if (Number.isNaN(date.getTime())) return '';

  // A device clock that runs behind would otherwise report an update "in 2 minutes".
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds >= WEEK_SECONDS) return formatDate(date, lang);

  const formatter = new Intl.RelativeTimeFormat(lang === 'ar' ? 'ar' : 'en', { numeric: 'auto' });
  const match = RELATIVE_UNITS.find(([, size]) => seconds >= size);
  return match ? formatter.format(-Math.floor(seconds / match[1]), match[0]) : formatter.format(0, 'second');
}

// Today's local calendar date as 'YYYY-MM-DD', the format <input type="date"> uses.
export function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}
