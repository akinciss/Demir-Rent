import { carRepository } from "@/repositories/carRepository";
import type { Car, Rental } from "@/types/car";
import { auth } from "@/lib/firebase";

// ── Helper: Admin token ile API route'a istek at ──────────────────

async function adminPost(path: string, body: Record<string, unknown>): Promise<void> {
  if (!auth?.currentUser) {
    throw new Error("Giriş yapmanız gerekiyor.");
  }

  const token = await auth.currentUser.getIdToken();
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "İşlem sırasında bir hata oluştu.");
  }
}

// ─────────────────────────────────────────────────────────────────

export const adminService = {
  async addCar(carData: Omit<Car, "id">): Promise<void> {
    if (!carData.brand || !carData.model || !carData.pricePerDay || !carData.image) {
      throw new Error("Lütfen zorunlu alanları (Marka, Model, Fiyat, Görsel) doldurun.");
    }

    const newCar = {
      ...carData,
      type: carData.type || "Sedan",
      capacity: carData.capacity || carData.seats || 5,
      isActive: carData.isActive !== undefined ? carData.isActive : true,
    };

    await carRepository.addCar(newCar);
  },

  async getPendingRentalsWithDetails(): Promise<Rental[]> {
    const { rentalRepository } = await import("@/repositories/rentalRepository");
    const pendingRentals = await rentalRepository.getPendingRentals();

    return await Promise.all(
      pendingRentals.map(async (rental) => {
        const carDetails = await carRepository.getCarById(rental.carId);
        return {
          ...rental,
          carDetails: carDetails || undefined,
        };
      })
    );
  },

  async getAllRentalsWithDetails(): Promise<Rental[]> {
    const { rentalRepository } = await import("@/repositories/rentalRepository");
    const allRentals = await rentalRepository.getAllRentals();

    return await Promise.all(
      allRentals.map(async (rental) => {
        const carDetails = await carRepository.getCarById(rental.carId);
        return {
          ...rental,
          carDetails: carDetails || undefined,
        };
      })
    );
  },

  /**
   * Onaylama — /api/admin/approve üzerinden güvenli transaction.
   * Admin SDK ile slot/çakışma kontrolü yapılır.
   */
  async approveRental(rentalId: string): Promise<void> {
    await adminPost("/api/admin/approve", { rentalId });
  },

  /**
   * Reddetme — /api/admin/reject üzerinden güvenli transaction.
   * onay_bekliyor → reddedildi, slot tekrar available.
   */
  async rejectRental(rentalId: string, reason?: string): Promise<void> {
    await adminPost("/api/admin/reject", { rentalId, reason });
  },

  /**
   * İptal — /api/admin/cancel üzerinden güvenli transaction.
   * aktif → iptal, slot tekrar available.
   */
  async cancelRental(rentalId: string, reason?: string): Promise<void> {
    await adminPost("/api/admin/cancel", { rentalId, reason });
  },

  /**
   * Tamamlandı — /api/admin/complete üzerinden güvenli transaction.
   * aktif → tamamlandi, slot booked olarak kalır.
   */
  async completeRental(rentalId: string): Promise<void> {
    await adminPost("/api/admin/complete", { rentalId });
  },

  /**
   * Yeni slot ekler (API üzerinden overlap kontrolüyle).
   */
  async addSlot(carId: string, startAt: string, endAt: string): Promise<void> {
    await adminPost("/api/admin/slots", { carId, startAt, endAt });
  },

  /**
   * Slot siler (sadece available olanları).
   */
  async deleteSlot(slotId: string): Promise<void> {
    if (!auth?.currentUser) {
      throw new Error("Giriş yapmanız gerekiyor.");
    }
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`/api/admin/slots?slotId=${slotId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Slot silinirken hata oluştu.");
    }
  },
};
