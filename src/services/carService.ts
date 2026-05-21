import { carRepository } from "@/repositories/carRepository";
import type { Car } from "@/types/car";

export const carService = {
  async getCars(): Promise<Car[]> {
    return await carRepository.getAllCars();
  },

  async getCarDetails(id: string): Promise<Car | null> {
    return await carRepository.getCarById(id);
  },

  filterCars(cars: Car[], filters: {
    type: string;
    capacity: string;
    maxBudget: number;
    onlyAvailable: boolean;
  }): Car[] {
    return cars.filter(car => {
      const typeMatch = filters.type === "Tümü" || car.type === filters.type;
      
      const capStr = filters.capacity === "Tümü" ? "Tümü" : 
                     filters.capacity === "4 Kişilik" ? 4 : 
                     filters.capacity === "5 Kişilik" ? 5 : 7;
                     
      const capacityMatch = filters.capacity === "Tümü" || 
                            (capStr === 7 ? (car.capacity || 0) >= 7 : (car.capacity === capStr));
      
      const budgetMatch = car.pricePerDay <= filters.maxBudget;
      const availabilityMatch = !filters.onlyAvailable || car.isAvailable;
    
      return typeMatch && capacityMatch && budgetMatch && availabilityMatch;
    });
  }
};
