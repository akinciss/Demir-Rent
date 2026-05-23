import { db, isFirebaseInitialized } from "@/lib/firebaseClient";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, type Firestore } from "firebase/firestore";
import { carConverter } from "@/lib/converters";
import { validateFirebaseConfig } from "@/lib/config";
import type { Car } from "@/types/car";

const COLLECTION_NAME = "cars";

export const carRepository = {
  async getAllCars(): Promise<Car[]> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const carsCollectionRef = collection(db as Firestore, COLLECTION_NAME).withConverter(carConverter);
    const querySnapshot = await getDocs(carsCollectionRef);

    // Deterministic defaults for malformed/partial documents
    const defaultType = "Sedan";
    const defaultCapacity = 4;

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        type: data.type || defaultType,
        capacity: data.capacity || data.seats || defaultCapacity,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      } as Car;
    });
  },

  async getCarById(id: string): Promise<Car | null> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const docRef = doc(db as Firestore, COLLECTION_NAME, id).withConverter(carConverter);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return { id: docSnap.id, ...data } as Car;
  },

  async addCar(carData: Omit<Car, "id">): Promise<string> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const carsCollectionRef = collection(db as Firestore, COLLECTION_NAME).withConverter(carConverter);
    const docRef = await addDoc(carsCollectionRef, carData);
    return docRef.id;
  },

  async updateCar(id: string, carData: Partial<Car>): Promise<void> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const docRef = doc(db as Firestore, COLLECTION_NAME, id).withConverter(carConverter);
    await updateDoc(docRef, carData as Partial<Car>);
  },

  async deleteCar(id: string): Promise<void> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const docRef = doc(db as Firestore, COLLECTION_NAME, id).withConverter(carConverter);
    await deleteDoc(docRef);
  }
};
