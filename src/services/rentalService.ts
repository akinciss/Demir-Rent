import { rentalRepository } from "@/repositories/rentalRepository";
import { carRepository } from "@/repositories/carRepository";
import type { Rental } from "@/types/car";

export interface PricingBreakdown {
  totalPrice: number;
  totalDays: number;
  weekendDays: number;
  hasWeekendSurcharge: boolean;
}

export const rentalService = {
  /**
   * Dinamik fiyat hesaplama: Hafta sonu günleri 1.25x çarpanı uygulanır.
   */
  calculateDynamicPrice(pricePerDay: number, startDate: string, endDate: string): PricingBreakdown {
    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let totalPrice = 0;
    let weekendDays = 0;

    for (let i = 0; i < diffDays; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      const dayOfWeek = day.getDay(); // 0 = Pazar, 6 = Cumartesi

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        totalPrice += pricePerDay * 1.25;
        weekendDays++;
      } else {
        totalPrice += pricePerDay;
      }
    }

    return {
      totalPrice: Math.round(totalPrice),
      totalDays: diffDays,
      weekendDays,
      hasWeekendSurcharge: weekendDays > 0,
    };
  },

  /**
   * Basit toplam fiyat (geriye dönük uyumluluk)
   */
  calculateTotalPrice(pricePerDay: number, startDate: string, endDate: string): number {
    return this.calculateDynamicPrice(pricePerDay, startDate, endDate).totalPrice;
  },

  /**
   * Tarih çakışma kontrolü: Seçilen aralık, mevcut aktif kiralamalarla çakışıyor mu?
   */
  async checkDateAvailability(
    carId: string,
    startDate: string,
    endDate: string
  ): Promise<{ available: boolean; conflictingRental?: Rental }> {
    const activeRentals = await rentalRepository.getActiveRentalsByCarId(carId);

    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);
    reqStart.setHours(0, 0, 0, 0);
    reqEnd.setHours(0, 0, 0, 0);

    for (const rental of activeRentals) {
      const existStart = new Date(rental.startDate);
      const existEnd = new Date(rental.endDate);
      existStart.setHours(0, 0, 0, 0);
      existEnd.setHours(0, 0, 0, 0);

      // Overlap check: reqStart <= existEnd && reqEnd >= existStart
      const overlaps = reqStart <= existEnd && reqEnd >= existStart;
      if (overlaps) {
        return { available: false, conflictingRental: rental };
      }
    }

    return { available: true };
  },

  /**
   * Önümüzdeki N günlük doluluk verisi: Her gün için {date, booked} döner.
   */
  async getOccupancyForDays(carId: string, days: number = 30): Promise<{ date: string; booked: boolean }[]> {
    const activeRentals = await rentalRepository.getActiveRentalsByCarId(carId);
    const result: { date: string; booked: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);

      const isBooked = activeRentals.some((rental) => {
        const s = new Date(rental.startDate);
        const e = new Date(rental.endDate);
        s.setHours(0, 0, 0, 0);
        e.setHours(0, 0, 0, 0);
        return checkDate >= s && checkDate <= e;
      });

      result.push({
        date: checkDate.toISOString().split("T")[0],
        booked: isBooked,
      });
    }

    return result;
  },

  async createRental(rental: Omit<Rental, "id">): Promise<string> {
    if (new Date(rental.startDate) > new Date(rental.endDate)) {
      throw new Error("Teslim tarihi alış tarihinden önce olamaz.");
    }
    return await rentalRepository.createRental(rental);
  },

  async getUserRentalsWithCarDetails(userId: string): Promise<Rental[]> {
    const rentals = await rentalRepository.getRentalsByUserId(userId);

    return await Promise.all(
      rentals.map(async (rental) => {
        const carDetails = await carRepository.getCarById(rental.carId);
        return {
          ...rental,
          carDetails: carDetails || undefined,
        };
      })
    );
  },
};
