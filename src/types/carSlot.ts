export type CarSlotStatus = 'available' | 'reserved' | 'booked' | 'closed';

export interface CarSlot {
  id: string;
  carId: string;
  startAt: string;   // ISO date string (YYYY-MM-DD)
  endAt: string;     // ISO date string (YYYY-MM-DD)
  status: CarSlotStatus;
}
