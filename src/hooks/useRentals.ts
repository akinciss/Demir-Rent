import { useState, useEffect } from "react";
import { rentalService } from "@/services/rentalService";
import { auth } from "@/lib/firebase";
import type { Rental } from "@/types/car";

export function useRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!auth.currentUser) {
        setRentals([]);
        return;
      }
      const data = await rentalService.getUserRentalsWithCarDetails(auth.currentUser.uid);
      setRentals(data);
    } catch (err: any) {
      setError(err.message || "Siparişler yüklenirken hata oluştu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if currentUser is available, usually components using this hook ensure auth state
    if (auth.currentUser) {
      fetchUserRentals();
    } else {
      setLoading(false);
    }
  }, []);

  return { rentals, loading, error, refetch: fetchUserRentals };
}
