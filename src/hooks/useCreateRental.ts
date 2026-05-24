import { useState } from "react";
import { auth } from "@/lib/firebase";

interface UseCreateRentalResult {
  reserveSlot: (slotId: string, receiptInfo: string) => Promise<string>;
  loading: boolean;
  error: string | null;
  rentalId: string | null;
}

/**
 * Slot-bazlı rezervasyon oluşturma hook'u.
 * Server-side API route'a token ile istek atar.
 * Transaction hatalarını UI-friendly mesaja çevirir.
 */
export function useCreateRental(): UseCreateRentalResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rentalId, setRentalId] = useState<string | null>(null);

  const reserveSlot = async (
    slotId: string,
    receiptInfo: string
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    setRentalId(null);

    try {
      if (!auth?.currentUser) {
        throw new Error("Giriş yapmanız gerekiyor.");
      }

      const token = await auth.currentUser.getIdToken();

      const res = await fetch("/api/rentals/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slotId, receiptInfo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Rezervasyon oluşturulurken bir hata oluştu."
        );
      }

      setRentalId(data.rentalId);
      return data.rentalId;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reserveSlot, loading, error, rentalId };
}
