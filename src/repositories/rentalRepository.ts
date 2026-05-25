import { db, isFirebaseInitialized } from "@/lib/firebaseClient";
import { collection, getDocs, query, where, type Firestore } from "firebase/firestore";
import { rentalConverter } from "@/lib/converters";
import { validateFirebaseConfig } from "@/lib/config";
import type { Rental } from "@/types/rental";
import type { RentalStatus } from "@/types/rental";

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
    const q = query(rentalsRef, where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() }) as Rental);
  },

  /**
   * Rental oluşturma — sadece Admin SDK üzerinden yapılmalı.
   * Bu method legacy uyumluluk için bırakılmıştır; doğrudan çağrılmamalı.
   * @deprecated Kullanmak yerine /api/rentals/reserve API route'unu kullanın.
   */
  async createRental(_rentalData: Omit<Rental, "id">): Promise<string> {
    throw new Error(
      "Kritik Güvenlik Hatası: createRental client-side üzerinden çağrılamaz! " +
      "Lütfen /api/rentals/reserve uç noktasını (useCreateRental) kullanın."
    );
  },

  /**
   * Status güncelleme — sadece geçerli RentalStatus değerlerini kabul eder.
   * @deprecated Kullanmak yerine güvenli admin API route'larını kullanın.
   */
  async updateRentalStatus(_id: string, _status: string): Promise<void> {
    throw new Error(
      "Kritik Güvenlik Hatası: updateRentalStatus client-side üzerinden çağrılamaz! " +
      "Lütfen adminService ve /api/admin/* endpointlerini kullanın."
    );
  },

  async getActiveRentalsByCarId(carId: string): Promise<Rental[]> {
    if (!validateFirebaseConfig().ok || !isFirebaseInitialized) {
      throw new Error("FIREBASE_CONFIG_MISSING");
    }

    const rentalsRef = collection(db as Firestore, COLLECTION_NAME).withConverter(rentalConverter);
    const q = query(rentalsRef, where("carId", "==", carId), where("status", "==", "active"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data() }) as Rental);
  }
};
