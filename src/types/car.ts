export interface Car {
  id: string | number;
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
  isAvailable?: boolean;
}

// Rental tipi src/types/rental.ts'e taşındı.
// Mevcut importları kırmamak için re-export:
export type { Rental } from "./rental";