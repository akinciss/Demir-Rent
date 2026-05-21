import { carRepository } from "@/repositories/carRepository";
import { rentalRepository } from "@/repositories/rentalRepository";
import type { Car, Rental } from "@/types/car";

export const adminService = {
  async addCar(carData: Omit<Car, "id">): Promise<void> {
    if (!carData.brand || !carData.model || !carData.pricePerDay || !carData.image) {
      throw new Error("Lütfen zorunlu alanları (Marka, Model, Fiyat, Görsel) doldurun.");
    }
    
    // Add default values for filtering if missing
    const newCar = {
      ...carData,
      type: carData.type || "Sedan",
      capacity: carData.capacity || carData.seats || 5,
      isAvailable: carData.isAvailable !== undefined ? carData.isAvailable : true
    };

    await carRepository.addCar(newCar);
  },

  async getPendingRentalsWithDetails(): Promise<Rental[]> {
    const pendingRentals = await rentalRepository.getPendingRentals();
    
    return await Promise.all(
      pendingRentals.map(async (rental) => {
        const carDetails = await carRepository.getCarById(rental.carId);
        return {
          ...rental,
          carDetails: carDetails || undefined
        };
      })
    );
  },

  async approveRental(rentalId: string): Promise<void> {
    await rentalRepository.updateRentalStatus(rentalId, "aktif");
  }
};
