import { db, isFirebaseInitialized } from "@/lib/firebaseClient";
import {
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import { isDemoMode } from "@/lib/config";
import type { CarSlot } from "@/types/carSlot";

const COLLECTION_NAME = "carSlots";

function normalizeSlotDate(value: unknown): string {
  // Already string
  if (typeof value === "string") {
    return value;
  }

  // Firestore Timestamp object
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString().slice(0, 10);
  }

  // Plain object version: { seconds, nanoseconds }
  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds: number }).seconds === "number"
  ) {
    return new Date((value as { seconds: number }).seconds * 1000)
      .toISOString()
      .slice(0, 10);
  }

  return "";
}

function mapCarSlot(docId: string, data: Record<string, unknown>): CarSlot {
  return {
    id: docId,
    carId: String(data.carId ?? ""),
    startAt: normalizeSlotDate(data.startAt),
    endAt: normalizeSlotDate(data.endAt),
    status: data.status as CarSlot["status"],
  };
}

export const carSlotRepository = {
  /**
   * Bir aracın tüm slotlarını döner.
   */
  async getSlotsByCarId(carId: string): Promise<CarSlot[]> {
    if (isDemoMode() || !isFirebaseInitialized) {
      return [];
    }

    const slotsRef = collection(db as Firestore, COLLECTION_NAME);
    const q = query(slotsRef, where("carId", "==", carId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) =>
      mapCarSlot(doc.id, doc.data() as Record<string, unknown>)
    );
  },

  /**
   * Bir aracın sadece müsait (available) slotlarını döner.
   */
  async getAvailableSlotsByCarId(carId: string): Promise<CarSlot[]> {
    if (isDemoMode() || !isFirebaseInitialized) {
      return [];
    }

    const slotsRef = collection(db as Firestore, COLLECTION_NAME);

    const q = query(
      slotsRef,
      where("carId", "==", carId),
      where("status", "==", "available")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) =>
      mapCarSlot(doc.id, doc.data() as Record<string, unknown>)
    );
  },
};