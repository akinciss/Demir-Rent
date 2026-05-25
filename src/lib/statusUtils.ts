import { RentalStatus } from "@/types/rental";

/**
 * Maps both english (new) and turkish (legacy) status codes to Turkish UI strings.
 */
export function translateStatus(status: RentalStatus | string): string {
  switch (status) {
    case "pending":
    case "onay_bekliyor":
      return "Beklemede";
    case "active":
    case "aktif":
      return "Aktif";
    case "rejected":
    case "reddedildi":
      return "Reddedildi";
    case "cancelled":
    case "iptal":
      return "İptal Edildi";
    case "completed":
    case "tamamlandi":
      return "Tamamlandı";
    default:
      return status;
  }
}

/**
 * Returns consistent styling classes based on the rental status.
 */
export function translateStatusColor(status: RentalStatus | string): string {
  switch (status) {
    case "pending":
    case "onay_bekliyor":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "active":
    case "aktif":
      return "bg-green-100 text-green-800 border-green-200";
    case "rejected":
    case "reddedildi":
      return "bg-red-100 text-red-800 border-red-200";
    case "cancelled":
    case "iptal":
      return "bg-stone-100 text-stone-600 border-stone-200";
    case "completed":
    case "tamamlandi":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

/**
 * Normalizes legacy turkish status codes from the database into the new English standard enums.
 * Used in Firestore converters to ensure the app logic only deals with the English standard.
 */
export function normalizeStatusToEnglish(status: string): RentalStatus {
  switch (status) {
    case "onay_bekliyor":
      return "pending";
    case "aktif":
      return "active";
    case "reddedildi":
      return "rejected";
    case "iptal":
      return "cancelled";
    case "tamamlandi":
      return "completed";
    default:
      return status as RentalStatus;
  }
}
