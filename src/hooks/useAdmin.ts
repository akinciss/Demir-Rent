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
    } catch (err: any) {
      setError(err.message || "Bekleyen siparişler yüklenirken hata oluştu.");
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
    } catch (err: any) {
      console.error(err);
      throw new Error(err.message || "Onay işlemi başarısız.");
    }
  };

  useEffect(() => {
    fetchPendingRentals();
  }, []);

  return { pendingRentals, loading, error, refetch: fetchPendingRentals, approveRental };
}
