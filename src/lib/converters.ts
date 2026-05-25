import type { Car, Rental } from "@/types/car";
import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { normalizeDate } from "@/lib/dateUtils";

export const carConverter = {
  toFirestore(car: Omit<Car, "id">): DocumentData {
    // Always write isActive for new records. Drop the legacy isAvailable field
    // so the document stays clean, but the fromFirestore side handles both.
    const { ...rest } = car;
    return { ...rest, isActive: car.isActive ?? true } as DocumentData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Car {
    const data = snapshot.data(options) as DocumentData;
    return {
      id: snapshot.id,
      ...data,
      // Backward compat: accept both isActive (new) and isAvailable (legacy)
      isActive: data.isActive ?? data.isAvailable ?? true,
    } as Car;
  }
};

export const rentalConverter = {
  toFirestore(rental: Omit<Rental, "id">): DocumentData {
    return { ...rental } as DocumentData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Rental {
    const data = snapshot.data(options) as DocumentData;
    return {
      id: snapshot.id,
      ...data,
      startDate: normalizeDate(data.startDate) ?? data.startDate,
      endDate: normalizeDate(data.endDate) ?? data.endDate,
      createdAt: normalizeDate(data.createdAt) ?? data.createdAt,
      updatedAt: normalizeDate(data.updatedAt) ?? data.updatedAt,
    } as unknown as Rental;
  }
};
