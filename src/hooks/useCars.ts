import { useState, useEffect, useCallback } from "react";
import { carService } from "@/services/carService";
import { isDemoMode } from "@/lib/config";
import type { Car } from "@/types/car";

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const demoMode = isDemoMode();

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carService.getCars();
      setCars(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Araçlar yüklenirken bir hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await carService.getCars();
        if (active) {
          setCars(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (active) {
          const message = err instanceof Error ? err.message : String(err);
          setError(message || "Araçlar yüklenirken bir hata oluştu.");
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

  return { cars, loading, error, demoMode, refetch: fetchCars };
}
