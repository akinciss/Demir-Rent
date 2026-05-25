import type { Car } from "./car";

/**
 * Geçerli rental status değerleri.
 * - pending: kullanıcı ödeme bildirimi yaptı, admin onayı bekleniyor (eski: onay_bekliyor)
 * - active: admin onayladı, kiralama aktif (eski: aktif)
 * - rejected: admin reddetti (slot tekrar available olur)
 * - cancelled: admin veya kullanıcı iptal etti (slot tekrar available olur)
 * - completed: kiralama tamamlandı (slot geçmiş olarak kalır)
 */
export type RentalStatus =
  | "pending"
  | "active"
  | "rejected"
  | "cancelled"
  | "completed";

export interface Rental {
  id: string;
  userId: string;
  carId: string;
  slotId?: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: RentalStatus;
  receiptInfo?: string;
  createdAt?: string;
  carDetails?: Car;
}
