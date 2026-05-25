import { useState, useEffect } from "react";
import { rentalService } from "@/services/rentalService";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { Rental } from "@/types/car";

export function useRentals() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRentals = async (uid: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await rentalService.getUserRentalsWithCarDetails(uid);
      // En yeni kiralamayı en üstte göster
      data.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.startDate).getTime();
        const dateB = new Date(b.createdAt || b.startDate).getTime();
        return dateB - dateA;
      });
      setRentals(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Siparişler yüklenirken hata oluştu.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      // Use set timeout or keep initial loading true until we are sure, but never call setState synchronously.
      // Better yet, we can do it inside a requestAnimationFrame or check condition.
      // If we just check auth synchronously and it's null, we defer setting loading.
      const timer = setTimeout(() => {
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserRentals(user.uid);
      } else {
        setRentals([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const refetch = async () => {
    if (auth?.currentUser) {
      await fetchUserRentals(auth.currentUser.uid);
    }
  };

  return { rentals, loading, error, refetch };
}
