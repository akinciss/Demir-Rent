"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { Car } from "@/types/car";
import { CreditCard, AlertCircle, CheckCircle, Info, Calendar } from "lucide-react";
import { carService } from "@/services/carService";
import { rentalService, type PricingBreakdown } from "@/services/rentalService";
import { carSlotRepository } from "@/repositories/carSlotRepository";
import type { CarSlot } from "@/types/carSlot";
import { useCreateRental } from "@/hooks/useCreateRental";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";

export default function RentPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Slots state
  const [allSlots, setAllSlots] = useState<CarSlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<CarSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const { reserveSlot, loading: creatingRental } = useCreateRental();

  // Availability state
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  // 30-day occupancy timeline
  const [occupancy, setOccupancy] = useState<{ date: string; booked: boolean }[]>([]);

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
    const fetchCar = async () => {
      if (!params.id) return;
      try {
        const fetchedCar = await carService.getCarDetails(params.id as string);
        setCar(fetchedCar);
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [params.id]);

  // Fetch 30-day occupancy when car loads
  useEffect(() => {
    if (!params.id) return;
    rentalService.getOccupancyForDays(params.id as string, 30).then(setOccupancy);
    carSlotRepository.getSlotsByCarId(params.id as string).then(slots => {
      setAllSlots(slots);
      setAvailableSlots(slots.filter(s => s.status === "available"));
    }).catch(console.error);
  }, [params.id]);

  // Derived pricing: compute on render using useMemo instead of storing in state
  const pricing = useMemo<PricingBreakdown | null>(() => {
    let s = startDate;
    let e = endDate;
    if (selectedSlotId) {
      const slot = availableSlots.find(slot => slot.id === selectedSlotId);
      if (slot) {
        s = slot.startAt;
        e = slot.endAt;
      }
    }
    if (!s || !e || !car) return null;
    const start = new Date(s);
    const end = new Date(e);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (end < start) return null;
    return rentalService.calculateDynamicPrice(car.pricePerDay, s, e);
  }, [startDate, endDate, car, selectedSlotId, availableSlots]);

  // Availability check moved to an explicit event handler to avoid unnecessary effects
  const handleCheckAvailability = useCallback(async () => {
    if (!params.id || !startDate || !endDate) return;
    setIsCheckingAvailability(true);
    try {
      const result = await rentalService.checkDateAvailability(params.id as string, startDate, endDate);
      setIsAvailable(result.available);
    } catch {
      setIsAvailable(null);
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [params.id, startDate, endDate]);

  const handleConfirmRent = async () => {
    const currentUser = auth?.currentUser;
    if (!currentUser || !params.id) return;

    // Slot-based reservation
    if (allSlots.length > 0) {
      if (availableSlots.length === 0) return;
      if (!selectedSlotId || !pricing || !receiptInfo.trim()) return;
      try {
        await reserveSlot(selectedSlotId, receiptInfo);
        setSubmitted(true);
        setTimeout(() => router.push("/"), 2500);
      } catch (err: any) {
        toast.error(err.message || "Rezervasyon sırasında bir hata oluştu.");
      }
      return;
    }

    // Legacy date-based reservation
    if (!startDate || !endDate || !pricing || !receiptInfo.trim() || !isAvailable) return;

    setIsSubmitting(true);
    try {
      await rentalService.createRental({
        userId: currentUser.uid,
        carId: params.id as string,
        startDate,
        endDate,
        totalPrice: pricing.totalPrice,
        receiptInfo,
        status: "onay_bekliyor",
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
      setTimeout(() => router.push("/"), 2500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message || "Kiralama sırasında bir hata oluştu.");
      setIsSubmitting(false);
    }
  };

  const hasSlotSystem = allSlots.length > 0;
  const hasAvailableSlots = availableSlots.length > 0;
  const isSlotMode = hasSlotSystem && hasAvailableSlots;

  const canSubmit = hasSlotSystem
    ? hasAvailableSlots && selectedSlotId && pricing && receiptInfo.trim() && !creatingRental
    : startDate && endDate && pricing && receiptInfo.trim() && isAvailable === true && !isSubmitting;

  // Occupancy timeline helpers
  const isInRange = (date: string) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }}></div>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <p style={{ color: "var(--color-text-muted)" }}>Araç bulunamadı.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-4xl px-6 pt-10">
        <AnimatePresence>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(139,126,116,0.15)" }}>
                <CheckCircle className="h-10 w-10" style={{ color: "var(--color-vizon)" }} />
              </div>
              <h2 className="text-3xl font-medium" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}>
                Talebiniz Alındı
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--color-text-muted)" }}>
                Ödeme bildiriminiz admin onayına gönderildi. Yönlendiriliyorsunuz...
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="glass-card overflow-hidden rounded-3xl"
            >
              <div className="grid md:grid-cols-2">
                {/* Car Image */}
                <div className="relative h-72 md:h-full overflow-hidden">
                  <Image src={car.image} alt={car.brand} fill className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-5 left-5">
                    <h1
                      className="text-2xl font-semibold text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {car.brand} {car.model}
                    </h1>
                    <div className="mt-1 flex items-center gap-3 text-sm text-white/80">
                      <span>{car.year}</span>
                      <span>·</span>
                      <span>{car.fuel}</span>
                      <span>·</span>
                      <span>{car.transmission}</span>
                    </div>

                    {!hasSlotSystem && (
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleCheckAvailability}
                          disabled={!startDate || !endDate || isCheckingAvailability}
                          className="rounded-full px-4 py-2 text-sm font-medium text-white"
                          style={{ backgroundColor: "var(--color-vizon)" }}
                        >
                          {isCheckingAvailability ? "Kontrol ediliyor..." : "Müsaitlik Kontrol Et"}
                        </button>
                        {isAvailable === true && <span className="text-sm text-emerald-600">Müsait</span>}
                        {isAvailable === false && <span className="text-sm text-rose-600">Dolu</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Form */}
                <div className="p-8 lg:p-10">
                  <div className="space-y-5">
                    {/* Date Inputs or Slots */}
                    {hasSlotSystem ? (
                      hasAvailableSlots ? (
                        <div>
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                            Uygun Tarih Aralıkları (Slotlar)
                          </label>
                          <div className="space-y-2">
                            {availableSlots.map(slot => (
                              <button
                                key={slot.id}
                                onClick={() => setSelectedSlotId(slot.id)}
                                className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all flex justify-between items-center ${selectedSlotId === slot.id ? 'ring-2' : ''}`}
                                style={{ 
                                  borderColor: selectedSlotId === slot.id ? "var(--color-vizon)" : "var(--color-border)", 
                                  backgroundColor: selectedSlotId === slot.id ? "rgba(139,126,116,0.1)" : "rgba(255,255,255,0.6)", 
                                  color: "var(--color-text)" 
                                }}
                              >
                                <span>{slot.startAt} &rarr; {slot.endAt}</span>
                                {selectedSlotId === slot.id && <CheckCircle className="h-4 w-4" style={{ color: "var(--color-vizon)" }} />}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "rgba(201,123,90,0.05)", border: "1px solid rgba(201,123,90,0.1)" }}>
                          <AlertCircle className="mx-auto h-8 w-8 mb-3" style={{ color: "#c97b5a", opacity: 0.8 }} />
                          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                            Bu araç için şu anda uygun tarih aralığı bulunmamaktadır.
                          </p>
                          <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                            Lütfen daha sonra tekrar kontrol edin veya farklı bir araç seçin.
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                            Alış Tarihi
                          </label>
                          <input
                            type="date"
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                            style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255,255,255,0.6)", color: "var(--color-text)" }}
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setIsAvailable(null); }}
                            min={today}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                            Teslim Tarihi
                          </label>
                          <input
                            type="date"
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                            style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255,255,255,0.6)", color: "var(--color-text)" }}
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setIsAvailable(null); }}
                            min={startDate || today}
                          />
                        </div>
                      </div>
                    )}

                    {/* 30-day Occupancy Timeline (Only for legacy mode) */}
                    {!hasSlotSystem && occupancy.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" style={{ color: "var(--color-text-muted)" }} />
                          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                            Önümüzdeki 30 Gün
                          </span>
                        </div>
                        <div className="flex gap-[2px] h-3 rounded overflow-hidden">
                          {occupancy.map((day) => {
                            const inRange = isInRange(day.date);
                            let bg = day.booked ? "#c97b5a" : "rgba(139,126,116,0.2)";
                            if (inRange && !day.booked) bg = "var(--color-gold)";
                            return (
                              <div
                                key={day.date}
                                title={`${day.date}: ${day.booked ? "Dolu" : "Müsait"}`}
                                className="flex-1 rounded-[2px] transition-all duration-300"
                                style={{ backgroundColor: bg }}
                              />
                            );
                          })}
                        </div>
                        <div className="mt-1.5 flex gap-4 text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                          <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: "rgba(139,126,116,0.2)" }} /> Müsait</span>
                          <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: "#c97b5a" }} /> Dolu</span>
                          <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: "var(--color-gold)" }} /> Seçiminiz</span>
                        </div>
                      </div>
                    )}

                    {/* Availability Status (Only for legacy mode) */}
                    {!hasSlotSystem && (
                      <AnimatePresence mode="wait">
                        {isCheckingAvailability && (
                          <motion.div
                            key="checking"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 text-sm"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }} />
                            Uygunluk kontrol ediliyor...
                          </motion.div>
                        )}
                        {!isCheckingAvailability && isAvailable === false && (
                          <motion.div
                            key="unavailable"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium"
                            style={{ backgroundColor: "rgba(201,123,90,0.12)", color: "#c97b5a" }}
                          >
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            Bu tarihlerde araç doludur. Lütfen farklı bir aralık seçin.
                          </motion.div>
                        )}
                        {!isCheckingAvailability && isAvailable === true && pricing && (
                          <motion.div
                            key="available"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium"
                            style={{ backgroundColor: "rgba(139,126,116,0.1)", color: "var(--color-vizon)" }}
                          >
                            <CheckCircle className="h-5 w-5 shrink-0" />
                            Bu tarihler müsait.
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}

                    {/* Pricing Breakdown */}
                    {pricing && (isSlotMode ? selectedSlotId : isAvailable === true) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-2xl p-5 space-y-3"
                        style={{ backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid var(--color-border)" }}
                      >
                        <div className="flex items-center justify-between text-sm" style={{ color: "var(--color-text-muted)" }}>
                          <span>{pricing.totalDays} gün × ₺{car.pricePerDay}</span>
                          <span>₺{car.pricePerDay * pricing.totalDays}</span>
                        </div>
                        {pricing.hasWeekendSurcharge && (
                          <>
                            <div className="flex items-center justify-between text-sm" style={{ color: "var(--color-gold)" }}>
                              <span>{pricing.weekendDays} hafta sonu günü (+%25)</span>
                              <span>+₺{Math.round(car.pricePerDay * 0.25 * pricing.weekendDays)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: "rgba(166,138,100,0.1)", color: "var(--color-gold)" }}>
                              <Info className="h-3.5 w-3.5 shrink-0" />
                              Hafta sonu avantajlı fiyatlandırma dahil edildi.
                            </div>
                          </>
                        )}
                        <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
                          <span className="font-medium" style={{ color: "var(--color-text)" }}>Toplam Tutar</span>
                          <span
                            className="text-2xl font-semibold"
                            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-gold)" }}
                          >
                            ₺{pricing.totalPrice}
                          </span>
                        </div>

                        {/* Bank Transfer Info */}
                        <div className="rounded-xl p-4 space-y-1.5 text-sm" style={{ backgroundColor: "rgba(248,245,242,0.8)", border: "1px solid var(--color-border)" }}>
                          <p className="font-medium mb-2" style={{ color: "var(--color-text)" }}>Banka Havalesi / EFT</p>
                          <p style={{ color: "var(--color-text-muted)" }}><span className="font-medium" style={{ color: "var(--color-text)" }}>Firma:</span> Demir Rent A.Ş.</p>
                          <p style={{ color: "var(--color-text-muted)" }}><span className="font-medium" style={{ color: "var(--color-text)" }}>Banka:</span> Garanti BBVA</p>
                          <p className="font-mono text-xs pt-1" style={{ color: "var(--color-text)" }}>TR12 3456 7890 0000 0000 00</p>
                          <p className="text-xs pt-1" style={{ color: "var(--color-gold)" }}>Açıklamaya araç modelini yazmayı unutmayın.</p>
                        </div>

                        {/* Receipt Info Input */}
                        <div>
                          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                            Gönderici Ad Soyad / Dekont Referans No <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                            style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255,255,255,0.7)", color: "var(--color-text)" }}
                            value={receiptInfo}
                            onChange={(e) => setReceiptInfo(e.target.value)}
                            placeholder="Örn: Ahmet Yılmaz — REF12345"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    {(!hasSlotSystem || hasAvailableSlots) && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleConfirmRent}
                        disabled={!canSubmit}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-medium text-white transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ backgroundColor: canSubmit ? "var(--color-vizon)" : "var(--color-vizon)" }}
                      >
                        <CreditCard className="h-5 w-5" />
                        {hasSlotSystem
                          ? (creatingRental ? "Gönderiliyor..." : "Ödeme Bildirimi Yap")
                          : (isSubmitting
                            ? "Gönderiliyor..."
                            : isAvailable === false
                            ? "Bu Tarihler Müsait Değil"
                            : "Ödeme Bildirimi Yap")}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
