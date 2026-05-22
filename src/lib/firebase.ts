import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import FIREBASE_CONFIG, {
  FIREBASE_API_KEY,
  validateFirebaseConfig,
} from "./config";

// Temporary debug: print the resolved API key (remove after debugging)
// eslint-disable-next-line no-console
console.log('DEBUG: NEXT_PUBLIC_FIREBASE_API_KEY =', FIREBASE_API_KEY);
// eslint-disable-next-line no-console
const cfgCheck = validateFirebaseConfig();
// eslint-disable-next-line no-console
console.log('DEBUG: firebase config valid =', cfgCheck.ok, 'missing=', cfgCheck.missing);
// Next.js'in yapısı gereği uygulamanın her renderda tekrar tekrar başlatılmasını önler
const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);