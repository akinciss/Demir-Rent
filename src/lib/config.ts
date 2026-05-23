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
  const { missing } = validateFirebaseConfig();
  if (missing.length > 0) {
    // Don't throw here to allow the application to present a graceful fallback UI
    // during build/dev/runtime when env vars are not present. Callers may still
    // inspect `validateFirebaseConfig()` to decide behavior.
    // eslint-disable-next-line no-console
    console.warn(
      `Missing Firebase environment variables: ${missing.join(', ')}. ` +
      `Proceeding without initializing Firebase so the app can show a maintenance fallback.`
    );
  }
}

export function isFirebaseConfigValid(): boolean {
  return validateFirebaseConfig().ok;
}
