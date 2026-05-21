import type { Car } from "../types/car";

export const cars: Car[] = [
  {
    id: 1,
    brand: "BMW",
    model: "320i M Sport",
    year: 2023,
    fuel: "Benzin",
    transmission: "Otomatik",
    seats: 5,
    pricePerDay: 2500,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 2,
    brand: "Mercedes",
    model: "C200 AMG",
    year: 2022,
    fuel: "Dizel",
    transmission: "Otomatik",
    seats: 5,
    pricePerDay: 3200,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    brand: "Audi",
    model: "A4 Quattro",
    year: 2024,
    fuel: "Benzin",
    transmission: "Otomatik",
    seats: 5,
    pricePerDay: 4100,
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop",
  },
];