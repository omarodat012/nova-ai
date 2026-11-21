const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[\d\s()-]+$/;

// Arabic keyboards can type ٠-٩ or ۰-۹; phone numbers are validated and stored with 0-9.
export function toLatinDigits(text) {
  return text.replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) & 0xf));
}

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email.trim());
}

export function isValidPhone(phone) {
  const normalized = toLatinDigits(phone.trim());
  const digitCount = normalized.replace(/\D/g, '').length;
  return PHONE_PATTERN.test(normalized) && digitCount >= 7 && digitCount <= 15;
}
