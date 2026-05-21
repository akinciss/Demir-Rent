import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from "firebase/firestore";
import type { Rental } from "@/types/car";

const COLLECTION_NAME = "rentals";

export const rentalRepository = {
  async getAllRentals(): Promise<Rental[]> {
    const rentalsRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(rentalsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Rental);
  },

  async getRentalsByUserId(userId: string): Promise<Rental[]> {
    const rentalsRef = collection(db, COLLECTION_NAME);
    const q = query(rentalsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Rental);
  },

  async getPendingRentals(): Promise<Rental[]> {
    const rentalsRef = collection(db, COLLECTION_NAME);
    const q = query(rentalsRef, where("status", "==", "onay_bekliyor"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Rental);
  },

  async createRental(rentalData: Omit<Rental, "id">): Promise<string> {
    const rentalsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(rentalsRef, rentalData);
    return docRef.id;
  },

  async updateRentalStatus(id: string, status: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { status });
  },

  async getActiveRentalsByCarId(carId: string): Promise<Rental[]> {
    const rentalsRef = collection(db, COLLECTION_NAME);
    const q = query(rentalsRef, where("carId", "==", carId), where("status", "==", "aktif"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Rental);
  }
};
