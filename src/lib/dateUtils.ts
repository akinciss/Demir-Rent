export type FirestoreTimestampLike = {
  seconds: number;
  nanoseconds?: number;
};

export type FirestoreToDateLike = {
  toDate: () => Date;
};

function isFirestoreTimestampLike(value: unknown): value is FirestoreTimestampLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as Record<string, unknown>).seconds === "number"
  );
}

function isFirestoreToDateLike(value: unknown): value is FirestoreToDateLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Record<string, unknown>).toDate === "function"
  );
}

/**
 * Safely formats any date-like value into a local date string (DD.MM.YYYY).
 * If the value is missing or invalid, it returns a fallback (default "-").
 */
export function formatDate(dateValue: unknown, fallback: string = "-"): string {
  if (dateValue == null) {
    return fallback;
  }

  // Handle YYYY-MM-DD strings directly to prevent timezone shift (e.g. 2026-05-25 -> 25.05.2026)
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const parts = dateValue.split("-");
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  let dateObj: Date;

  // 1. If it's already a Date
  if (dateValue instanceof Date) {
    dateObj = dateValue;
  }
  // 2. If it's a Firestore Timestamp with .toDate()
  else if (isFirestoreToDateLike(dateValue)) {
    dateObj = dateValue.toDate();
  }
  // 3. If it's a raw Firestore Timestamp object { seconds, nanoseconds }
  else if (isFirestoreTimestampLike(dateValue)) {
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
export function normalizeDate(dateValue: unknown): string | undefined {
  if (dateValue == null) return undefined;

  // Already YYYY-MM-DD format
  if (typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  let dateObj: Date;

  if (dateValue instanceof Date) {
    dateObj = dateValue;
  } else if (isFirestoreToDateLike(dateValue)) {
    dateObj = dateValue.toDate();
  } else if (isFirestoreTimestampLike(dateValue)) {
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
