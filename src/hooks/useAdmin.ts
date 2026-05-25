import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import type { Rental } from "@/types/rental";

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
    await adminService.approveRental(rentalId);
    setPendingRentals(prev => prev.filter(r => r.id !== rentalId));
  };

  const rejectRental = async (rentalId: string, reason?: string) => {
    await adminService.rejectRental(rentalId, reason);
    setPendingRentals(prev => prev.filter(r => r.id !== rentalId));
  };

  const cancelRental = async (rentalId: string, reason?: string) => {
    await adminService.cancelRental(rentalId, reason);
    // cancelled rentals are aktif → removed from pending list is not needed
    // but we refetch to keep the list consistent
    await fetchPendingRentals();
  };

  const completeRental = async (rentalId: string) => {
    await adminService.completeRental(rentalId);
    await fetchPendingRentals();
  };

  useEffect(() => {
    fetchPendingRentals();
  }, []);

  return {
    pendingRentals,
    loading,
    error,
    refetch: fetchPendingRentals,
    approveRental,
    rejectRental,
    cancelRental,
    completeRental,
  };
}
