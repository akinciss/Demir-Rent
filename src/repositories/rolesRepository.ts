import { db, isFirebaseInitialized } from "@/lib/firebaseClient";
import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import { validateFirebaseConfig } from "@/lib/config";

const COLLECTION_NAME = "roles";

export const rolesRepository = {
  async getRoleByUserId(uid: string): Promise<{ admin?: boolean } | null> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const docRef = doc(db as Firestore, COLLECTION_NAME, uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as { admin?: boolean };
  },

  async setAdmin(uid: string, isAdmin: boolean): Promise<void> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const docRef = doc(db as Firestore, COLLECTION_NAME, uid);
    await setDoc(docRef, { admin: isAdmin }, { merge: true });
  }
};
