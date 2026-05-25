import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { FIREBASE_CONFIG, validateFirebaseConfig } from "./config";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let isFirebaseInitialized = false;

if (validateFirebaseConfig().ok) {
	try {
		app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();
		auth = getAuth(app);
		db = getFirestore(app);
		isFirebaseInitialized = true;
	} catch (err) {
		// If initialization fails, don't throw — let the app render a graceful fallback.
		console.error("Firebase initialization failed:", err);
		isFirebaseInitialized = false;
	}
} else {
	console.warn("Firebase config is invalid or incomplete — skipping initialization.");
}

export { auth, db, isFirebaseInitialized, app as firebaseApp };
