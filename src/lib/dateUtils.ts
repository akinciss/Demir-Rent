/**
 * dateUtils.ts
 * Helper functions for safely handling and formatting various date formats,
 * including raw Firestore Timestamp objects, to prevent React render crashes.
 */

// Basic interface to match a Firestore Timestamp without importing firebase directly
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

/**
 * Safely formats any date-like value into a local date string (DD.MM.YYYY).
 * If the value is missing or invalid, it returns a fallback (default "-").
 */
export function formatDate(dateValue: any, fallback: string = "-"): string {
  if (dateValue == null) {
    return fallback;
  }

  let dateObj: Date;

  // 1. If it's already a Date
  if (dateValue instanceof Date) {
    dateObj = dateValue;
  }
  // 2. If it's a Firestore Timestamp with .toDate()
  else if (typeof dateValue === 'object' && typeof dateValue.toDate === 'function') {
    dateObj = dateValue.toDate();
  }
  // 3. If it's a raw Firestore Timestamp object { seconds, nanoseconds }
  else if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    dateObj = new Date(dateValue.seconds * 1000);
  }
  // 4. If it's a string or number
  else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    dateObj = new Date(dateValue);
  }
  else {
    return fallback;
  }

  // Check if it's a valid Date
  if (isNaN(dateObj.getTime())) {
    return fallback;
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Normalizes a Firebase Timestamp, Date, or string to a standard YYYY-MM-DD string.
 * Useful for normalizing data in Firestore converters.
 */
export function normalizeDate(dateValue: any): string | undefined {
  if (dateValue == null) return undefined;

  let dateObj: Date;

  if (dateValue instanceof Date) {
    dateObj = dateValue;
  } else if (typeof dateValue === 'object' && typeof dateValue.toDate === 'function') {
    dateObj = dateValue.toDate();
  } else if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    dateObj = new Date(dateValue.seconds * 1000);
  } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    dateObj = new Date(dateValue);
  } else {
    return undefined;
  }

  if (isNaN(dateObj.getTime())) return undefined;

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
