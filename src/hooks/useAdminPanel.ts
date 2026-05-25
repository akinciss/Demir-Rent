import { useState, useEffect, useCallback } from "react";
import { adminService } from "@/services/adminService";
import { carRepository } from "@/repositories/carRepository";
import type { Rental } from "@/types/rental";
import type { Car } from "@/types/car";

/**
 * useAdminPanel — admin sayfasının tüm state ve iş mantığını yönetir.
 * Her aksiyon kendi hata mesajını fırlatır; caller toast.error ile gösterir.
 */
export function useAdminPanel() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [rentalError, setRentalError] = useState<string | null>(null);

  const [cars, setCars] = useState<Car[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  // ── Rentals ────────────────────────────────────────────────────

  const fetchRentals = useCallback(async () => {
    setLoadingRentals(true);
    setRentalError(null);
    try {
      const data = await adminService.getAllRentalsWithDetails();
      // En güncel (createdAt) başa gelecek şekilde sırala
      data.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.startDate).getTime();
        const dateB = new Date(b.createdAt || b.startDate).getTime();
        return dateB - dateA;
      });
      setRentals(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setRentalError(msg || "Rezervasyonlar yüklenemedi.");
    } finally {
      setLoadingRentals(false);
    }
  }, []);

  const approveRental = async (rentalId: string) => {
    await adminService.approveRental(rentalId);
    await fetchRentals();
  };

  const rejectRental = async (rentalId: string) => {
    await adminService.rejectRental(rentalId);
    await fetchRentals();
  };

  const cancelRental = async (rentalId: string) => {
    await adminService.cancelRental(rentalId);
    await fetchRentals();
  };

  const completeRental = async (rentalId: string) => {
    await adminService.completeRental(rentalId);
    await fetchRentals();
  };

  // ── Cars ───────────────────────────────────────────────────────

  const fetchCars = useCallback(async () => {
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
  }, []);

  const addCar = async (carData: Omit<Car, "id">) => {
    await adminService.addCar(carData);
    await fetchCars();
  };

  const deleteCar = async (carId: string) => {
    await adminService.deleteCar(carId);
    setCars((prev) => prev.filter((c) => c.id !== carId));
  };

  // ── Init ──────────────────────────────────────────────────────

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const rentalsData = await adminService.getAllRentalsWithDetails();
        const carsData = await carRepository.getAllCars();

        if (active) {
          rentalsData.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.startDate).getTime();
            const dateB = new Date(b.createdAt || b.startDate).getTime();
            return dateB - dateA;
          });
          setRentals(rentalsData);
          setCars(carsData);
          setLoadingRentals(false);
          setLoadingCars(false);
        }
      } catch (err: unknown) {
        if (active) {
          const msg = err instanceof Error ? err.message : String(err);
          setRentalError(msg || "Yükleme sırasında hata oluştu.");
          setLoadingRentals(false);
          setLoadingCars(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return {
    rentals,
    loadingRentals,
    rentalError,
    cars,
    loadingCars,
    refetchRentals: fetchRentals,
    refetchCars: fetchCars,
    approveRental,
    rejectRental,
    cancelRental,
    completeRental,
    addCar,
    deleteCar,
  };
}
