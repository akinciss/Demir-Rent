import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import type { Car } from "@/types/car";

const COLLECTION_NAME = "cars";

export const carRepository = {
  async getAllCars(): Promise<Car[]> {
    const carsCollectionRef = collection(db, COLLECTION_NAME);
    const querySnapshot = await getDocs(carsCollectionRef);
    
    // Default types logic for existing dirty data
    const defaultTypes = ["Sedan", "SUV", "Hatchback"];
    
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        type: data.type || defaultTypes[Math.floor(Math.random() * defaultTypes.length)],
        capacity: data.capacity || data.seats || (Math.random() > 0.5 ? 5 : 4),
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      } as Car;
    });
  },

  async getCarById(id: string): Promise<Car | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return { id: docSnap.id, ...data } as Car;
  },

  async addCar(carData: Omit<Car, "id">): Promise<string> {
    const carsCollectionRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(carsCollectionRef, carData);
    return docRef.id;
  },

  async updateCar(id: string, carData: Partial<Car>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, carData);
  },

  async deleteCar(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
