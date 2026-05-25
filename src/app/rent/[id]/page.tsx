"use client";

import { AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { safeImageSrc } from "@/lib/imageUtils";
import toast from "react-hot-toast";
import { useRentalPage } from "@/hooks/useRentalPage";
import { SlotSelector } from "@/components/rental/SlotSelector";
import { PricingSummary } from "@/components/rental/PricingSummary";
import { PaymentReferenceBox } from "@/components/rental/PaymentReferenceBox";

export default function RentPage() {
  const {
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
  } = useRentalPage();

  const onSubmit = async () => {
    try {
      await handleConfirmRent();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Rezervasyon sırasında bir hata oluştu.";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }}
        />
      </main>
    );
  }

  if (!car) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center space-y-3">
          <AlertCircle className="mx-auto h-10 w-10" style={{ color: "var(--color-text-muted)" }} />
          <p style={{ color: "var(--color-text-muted)" }}>Araç bulunamadı.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-4xl px-6 pt-10">
        <AnimatePresence>
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(139,126,116,0.15)" }}
              >
                <CheckCircle className="h-10 w-10" style={{ color: "var(--color-vizon)" }} />
              </div>
              <h2
                className="text-3xl font-medium"
                style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}
              >
                Talebiniz Alındı
              </h2>
              <p className="mt-3 text-base" style={{ color: "var(--color-text-muted)" }}>
                Ödeme bildiriminiz admin onayına gönderildi. Yönlendiriliyorsunuz...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="glass-card overflow-hidden rounded-3xl"
            >
              <div className="grid md:grid-cols-2">
                {/* Car Image */}
                <div className="relative h-72 md:h-full overflow-hidden">
                  <Image
                    src={safeImageSrc(car.image)}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="h-full w-full object-cover"
                  />
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
                  </div>
                </div>

                {/* Booking Form */}
                <div className="p-8 lg:p-10">
                  <div className="space-y-5">
                    {/* Slot Selector */}
                    <SlotSelector
                      slots={availableSlots}
                      selectedSlotId={selectedSlotId}
                      onSelect={setSelectedSlotId}
                    />

                    {/* Pricing + Payment info (shown only when slot selected) */}
                    {pricing && selectedSlotId && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                      >
                        <PricingSummary pricing={pricing} pricePerDay={car.pricePerDay} />
                        <PaymentReferenceBox value={receiptInfo} onChange={setReceiptInfo} />
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    {availableSlots.length > 0 && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-medium text-white transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ backgroundColor: "var(--color-vizon)" }}
                        aria-busy={creatingRental}
                      >
                        <CreditCard className="h-5 w-5" />
                        {creatingRental ? "Gönderiliyor..." : "Ödeme Bildirimi Yap"}
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
