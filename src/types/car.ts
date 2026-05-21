export interface Car {
  id: string | number;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  image: string;
  type?: string;
  capacity?: number;
  isAvailable?: boolean;
}

export interface Rental {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  receiptInfo?: string;
  carDetails?: Car;
}