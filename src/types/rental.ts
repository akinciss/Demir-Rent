import type { Car } from "./car";

export interface Rental {
  id: string;
  userId: string;
  carId: string;
  slotId?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  receiptInfo?: string;
  createdAt?: string;
  carDetails?: Car;
}
