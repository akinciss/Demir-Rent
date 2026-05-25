import type { Car } from "./car";

/**
 * Geçerli rental status değerleri.
 * - onay_bekliyor: kullanıcı ödeme bildirimi yaptı, admin onayı bekleniyor
 * - aktif: admin onayladı, kiralama aktif
 * - reddedildi: admin reddetti (slot tekrar available olur)
 * - iptal: admin veya kullanıcı iptal etti (slot tekrar available olur)
 * - tamamlandi: kiralama tamamlandı (slot geçmiş olarak kalır)
 */
export type RentalStatus =
  | "onay_bekliyor"
  | "aktif"
  | "reddedildi"
  | "iptal"
  | "tamamlandi";

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
