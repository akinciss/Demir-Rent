import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import type { Rental } from "@/types/rental";

export function useAdmin() {
  const [pendingRentals, setPendingRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingRentals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getPendingRentalsWithDetails();
      setPendingRentals(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Bekleyen siparişler yüklenirken hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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
    await fetchPendingRentals();
  };

  const completeRental = async (rentalId: string) => {
    await adminService.completeRental(rentalId);
    await fetchPendingRentals();
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await adminService.getPendingRentalsWithDetails();
        if (active) {
          setPendingRentals(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message || "Bekleyen siparişler yüklenirken hata oluştu.");
          console.error(err);
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
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
