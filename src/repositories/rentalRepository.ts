import { db, isFirebaseInitialized } from "@/lib/firebaseClient";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, type Firestore } from "firebase/firestore";
import { rentalConverter } from "@/lib/converters";
import { validateFirebaseConfig } from "@/lib/config";
import type { Rental } from "@/types/car";

const COLLECTION_NAME = "rentals";

export const rentalRepository = {
  async getAllRentals(): Promise<Rental[]> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const rentalsRef = collection(db as Firestore, COLLECTION_NAME).withConverter(rentalConverter);
    const snapshot = await getDocs(rentalsRef);
    return snapshot.docs.map(doc => ({ ...doc.data() }) as Rental);
  },

  async getRentalsByUserId(userId: string): Promise<Rental[]> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const rentalsRef = collection(db as Firestore, COLLECTION_NAME).withConverter(rentalConverter);
    const q = query(rentalsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() }) as Rental);
  },

  async getPendingRentals(): Promise<Rental[]> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const rentalsRef = collection(db as Firestore, COLLECTION_NAME).withConverter(rentalConverter);
    const q = query(rentalsRef, where("status", "==", "onay_bekliyor"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() }) as Rental);
  },

  async createRental(rentalData: Omit<Rental, "id">): Promise<string> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const rentalsRef = collection(db as Firestore, COLLECTION_NAME).withConverter(rentalConverter);
    const docRef = await addDoc(rentalsRef, rentalData);
    return docRef.id;
  },

  async updateRentalStatus(id: string, status: string): Promise<void> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const docRef = doc(db as Firestore, COLLECTION_NAME, id).withConverter(rentalConverter);
    await updateDoc(docRef, { status } as Partial<Rental>);
  },

  async getActiveRentalsByCarId(carId: string): Promise<Rental[]> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const rentalsRef = collection(db as Firestore, COLLECTION_NAME).withConverter(rentalConverter);
    const q = query(rentalsRef, where("carId", "==", carId), where("status", "==", "aktif"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() }) as Rental);
  }
};
