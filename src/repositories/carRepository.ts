import { db, isFirebaseInitialized } from "@/lib/firebaseClient";
import { collection, getDocs, doc, getDoc, type Firestore } from "firebase/firestore";
import { carConverter } from "@/lib/converters";
import { isDemoMode } from "@/lib/config";
import { mockCars } from "@/data/mockCars";
import type { Car } from "@/types/car";

const COLLECTION_NAME = "cars";

// ── Data Source Interface ──────────────────────────────────────────

interface CarDataSource {
  getAllCars(): Promise<Car[]>;
  getCarById(id: string): Promise<Car | null>;
  addCar(carData: Omit<Car, "id">): Promise<string>;
  updateCar(id: string, carData: Partial<Car>): Promise<void>;
  deleteCar(id: string): Promise<void>;
}

// ── Firebase Data Source ───────────────────────────────────────────

const firebaseCarDataSource: CarDataSource = {
  async getAllCars(): Promise<Car[]> {
    if (!isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const carsCollectionRef = collection(db as Firestore, COLLECTION_NAME).withConverter(carConverter);
    const querySnapshot = await getDocs(carsCollectionRef);

    const defaultType = "Sedan";
    const defaultCapacity = 4;

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        type: data.type || defaultType,
        capacity: data.capacity || data.seats || defaultCapacity,
        // isActive: handled by carConverter (isActive ?? isAvailable ?? true)
      } as Car;
    });
  },

  async getCarById(id: string): Promise<Car | null> {
    if (!isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const docRef = doc(db as Firestore, COLLECTION_NAME, id).withConverter(carConverter);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    return { id: docSnap.id, ...data } as Car;
  },

  async addCar(): Promise<string> {
    throw new Error("Client-side yazma işlemleri kapatıldı. Lütfen adminService (API) üzerinden işlem yapın.");
  },

  async updateCar(): Promise<void> {
    throw new Error("Client-side yazma işlemleri kapatıldı. Lütfen adminService (API) üzerinden işlem yapın.");
  },

  async deleteCar(): Promise<void> {
    throw new Error("Client-side yazma işlemleri kapatıldı. Lütfen adminService (API) üzerinden işlem yapın.");
  },
};

// ── Mock Data Source ──────────────────────────────────────────────

const mockCarDataSource: CarDataSource = {
  async getAllCars(): Promise<Car[]> {
    return [...mockCars];
  },

  async getCarById(id: string): Promise<Car | null> {
    return mockCars.find((car) => String(car.id) === id) ?? null;
  },

  async addCar(): Promise<string> {
    throw new Error("Demo modunda araç ekleme işlemi yapılamaz.");
  },

  async updateCar(): Promise<void> {
    throw new Error("Demo modunda araç güncelleme işlemi yapılamaz.");
  },

  async deleteCar(): Promise<void> {
    throw new Error("Demo modunda araç silme işlemi yapılamaz.");
  },
};

// ── Exported Repository (auto-selects data source) ────────────────

function getDataSource(): CarDataSource {
  return isDemoMode() ? mockCarDataSource : firebaseCarDataSource;
}

export const carRepository: CarDataSource = {
  getAllCars: () => getDataSource().getAllCars(),
  getCarById: (id) => getDataSource().getCarById(id),
  addCar: (carData) => getDataSource().addCar(carData),
  updateCar: (id, carData) => getDataSource().updateCar(id, carData),
  deleteCar: (id) => getDataSource().deleteCar(id),
};
