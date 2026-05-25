// Read env vars with explicit property access so Next.js can inline them
// at build/dev time for client bundles.
export const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '';
export const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '';
export const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '';
export const FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '';
export const FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '';
export const FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '';
export const FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '';

export const FIREBASE_CONFIG = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

export default FIREBASE_CONFIG;

const requiredEntries = [
  ['NEXT_PUBLIC_FIREBASE_API_KEY', FIREBASE_API_KEY],
  ['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', FIREBASE_AUTH_DOMAIN],
  ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', FIREBASE_PROJECT_ID],
  ['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', FIREBASE_STORAGE_BUCKET],
  ['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', FIREBASE_MESSAGING_SENDER_ID],
  ['NEXT_PUBLIC_FIREBASE_APP_ID', FIREBASE_APP_ID],
];

export function validateFirebaseConfig(): { ok: boolean; missing: string[] } {
  const missing = requiredEntries.filter(([, value]) => !value).map(([key]) => key);
  return { ok: missing.length === 0, missing };
}

export function assertFirebaseConfig(): void {
  const { ok, missing } = validateFirebaseConfig();
  if (!ok) {
    if (process.env.NODE_ENV === 'production') {
      // In production, missing config is a hard failure — never silently fall
      // back to demo/mock data. The operator must fix the deployment config.
      throw new Error(
        `[Demir Rent] Firebase configuration is missing in production. ` +
        `Missing variables: ${missing.join(', ')}. ` +
        `Set these environment variables in your deployment configuration.`
      );
    }
    console.warn(
      `[Demir Rent] Missing Firebase environment variables: ${missing.join(', ')}. ` +
      `Running in demo mode with mock data. Set variables in .env.local to use Firebase.`
    );
  }
}

export function isFirebaseConfigValid(): boolean {
  return validateFirebaseConfig().ok;
}

/**
 * Demo mode: Firebase config eksikse true döner.
 * SADECE geliştirme ortamında (NODE_ENV !== "production") geçerlidir.
 * Production ortamında assertFirebaseConfig() çağrılmalı ve uygulama crash etmeli.
 */
export function isDemoMode(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false; // production'da demo mode yoktur
  }
  return !validateFirebaseConfig().ok;
}
