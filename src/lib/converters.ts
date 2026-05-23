import type { Car, Rental } from "@/types/car";
import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";

export const carConverter = {
  toFirestore(car: Omit<Car, "id">): DocumentData {
    return { ...car } as DocumentData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Car {
    const data = snapshot.data(options) as DocumentData;
    return { id: snapshot.id, ...data } as Car;
  }
};

export const rentalConverter = {
  toFirestore(rental: Omit<Rental, "id">): DocumentData {
    return { ...rental } as DocumentData;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Rental {
    const data = snapshot.data(options) as DocumentData;
    return { id: snapshot.id, ...data } as Rental;
  }
};
