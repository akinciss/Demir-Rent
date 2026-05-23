import { useState, useEffect } from "react";
import { carService } from "@/services/carService";
import type { Car } from "@/types/car";

export function useCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carService.getCars();
      setCars(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Araçlar yüklenirken bir hata oluştu.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return { cars, loading, error, refetch: fetchCars };
}
