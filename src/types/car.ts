export interface Car {
  /** Firestore document ID — always a string */
  id: string;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  image: string;
  type?: string;
  capacity?: number;
  /**
   * Aracın sistemde aktif/yayında olup olmadığı.
   * Gerçek tarih müsaitliği slot sistemi üzerinden yönetilir.
   *
   * Backward compat: Firestore'da hâlâ `isAvailable` olarak saklanan
   * eski veriler converter tarafında `isActive ?? isAvailable ?? true`
   * mantığıyla okunur. Yeni kayıtlar `isActive` olarak yazılır.
   */
  isActive?: boolean;
}

// Rental tipi src/types/rental.ts'e taşındı.
// Mevcut importları kırmamak için re-export:
export type { Rental } from "./rental";