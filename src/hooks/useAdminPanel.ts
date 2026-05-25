import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { carRepository } from "@/repositories/carRepository";
import type { Rental } from "@/types/rental";
import type { Car } from "@/types/car";

/**
 * useAdminPanel — admin sayfasının tüm state ve iş mantığını yönetir.
 * Her aksiyon kendi hata mesajını fırlatır; caller toast.error ile gösterir.
 */
export function useAdminPanel() {
  const [pendingRentals, setPendingRentals] = useState<Rental[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);

  const [cars, setCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  // ── Rentals ────────────────────────────────────────────────────

  const fetchPendingRentals = async () => {
    setLoadingRentals(true);
    try {
      const data = await adminService.getPendingRentalsWithDetails();
      setPendingRentals(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || "Bekleyen rezervasyonlar yüklenemedi.");
    } finally {
      setLoadingRentals(false);
    }
  };

  const approveRental = async (rentalId: string) => {
    await adminService.approveRental(rentalId);
    setPendingRentals((prev) => prev.filter((r) => r.id !== rentalId));
  };

  const rejectRental = async (rentalId: string) => {
    await adminService.rejectRental(rentalId);
    setPendingRentals((prev) => prev.filter((r) => r.id !== rentalId));
  };

  const cancelRental = async (rentalId: string) => {
    await adminService.cancelRental(rentalId);
    await fetchPendingRentals();
  };

  const completeRental = async (rentalId: string) => {
    await adminService.completeRental(rentalId);
    await fetchPendingRentals();
  };

  // ── Cars ───────────────────────────────────────────────────────

  const fetchCars = async () => {
    setLoadingCars(true);
    try {
      const data = await carRepository.getAllCars();
      setCars(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(msg || "Araçlar yüklenemedi.");
    } finally {
      setLoadingCars(false);
    }
  };

  const addCar = async (carData: Omit<Car, "id">) => {
    await adminService.addCar(carData);
    await fetchCars();
  };

  const deleteCar = async (carId: string) => {
    await carRepository.deleteCar(carId);
    setCars((prev) => prev.filter((c) => c.id !== carId));
  };

  // ── Init ──────────────────────────────────────────────────────

  useEffect(() => {
    fetchPendingRentals().catch(() => {/* errors are handled by callers */});
    fetchCars().catch(() => {/* errors are handled by callers */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    pendingRentals,
    loadingRentals,
    cars,
    loadingCars,
    refetchRentals: fetchPendingRentals,
    refetchCars: fetchCars,
    approveRental,
    rejectRental,
    cancelRental,
    completeRental,
    addCar,
    deleteCar,
  };
}
