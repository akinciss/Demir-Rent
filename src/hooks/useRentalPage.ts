import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { Car } from "@/types/car";
import type { CarSlot } from "@/types/carSlot";
import { carService } from "@/services/carService";
import { rentalService, type PricingBreakdown } from "@/services/rentalService";
import { carSlotRepository } from "@/repositories/carSlotRepository";
import { useCreateRental } from "@/hooks/useCreateRental";

export interface RentalPageState {
  car: Car | null;
  loading: boolean;
  availableSlots: CarSlot[];
  selectedSlotId: string;
  receiptInfo: string;
  pricing: PricingBreakdown | null;
  submitted: boolean;
  canSubmit: boolean;
  creatingRental: boolean;
  setSelectedSlotId: (id: string) => void;
  setReceiptInfo: (val: string) => void;
  handleConfirmRent: () => Promise<void>;
}

export function useRentalPage(): RentalPageState {
  const params = useParams();
  const router = useRouter();

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<CarSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [receiptInfo, setReceiptInfo] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const { reserveSlot, loading: creatingRental } = useCreateRental();

  // Auth guard
  useEffect(() => {
    if (!auth) {
      router.push("/login");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch car details
  useEffect(() => {
    if (!params.id) return;
    carService.getCarDetails(params.id as string)
      .then(setCar)
      .catch((err) => {
        console.error("Araç yüklenirken hata:", err);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  // Fetch available slots
  useEffect(() => {
    if (!params.id) return;
    carSlotRepository
      .getSlotsByCarId(params.id as string)
      .then((slots) => setAvailableSlots(slots.filter((s) => s.status === "available")))
      .catch((err) => {
        console.error("Slotlar yüklenirken hata:", err);
      });
  }, [params.id]);

  // Derived pricing from selected slot
  const pricing = useMemo<PricingBreakdown | null>(() => {
    if (!selectedSlotId || !car) return null;
    const slot = availableSlots.find((s) => s.id === selectedSlotId);
    if (!slot) return null;
    return rentalService.calculateDynamicPrice(car.pricePerDay, slot.startAt, slot.endAt);
  }, [selectedSlotId, car, availableSlots]);

  const canSubmit = Boolean(
    selectedSlotId &&
    pricing &&
    receiptInfo.trim() &&
    !creatingRental
  );

  const handleConfirmRent = useCallback(async () => {
    if (!canSubmit) return;
    const result = await reserveSlot(selectedSlotId, receiptInfo.trim());
    if (result) {
      setSubmitted(true);
      setTimeout(() => router.push("/"), 2500);
    }
  }, [canSubmit, reserveSlot, selectedSlotId, receiptInfo, router]);

  return {
    car,
    loading,
    availableSlots,
    selectedSlotId,
    receiptInfo,
    pricing,
    submitted,
    canSubmit,
    creatingRental,
    setSelectedSlotId,
    setReceiptInfo,
    handleConfirmRent,
  };
}
