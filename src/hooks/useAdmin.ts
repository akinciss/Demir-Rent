import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import type { Rental } from "@/types/car";

export function useAdmin() {
  const [pendingRentals, setPendingRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getPendingRentalsWithDetails();
      setPendingRentals(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Bekleyen siparişler yüklenirken hata oluştu.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveRental = async (rentalId: string) => {
    try {
      await adminService.approveRental(rentalId);
      // Remove from pending list locally for instant UI update
      setPendingRentals(prev => prev.filter(r => r.id !== rentalId));
      return true;
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(message || "Onay işlemi başarısız.");
    }
  };

  useEffect(() => {
    fetchPendingRentals();
  }, []);

  return { pendingRentals, loading, error, refetch: fetchPendingRentals, approveRental };
}
