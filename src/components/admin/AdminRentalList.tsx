"use client";

import { CheckCircle, XCircle, Ban, PackageCheck } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Rental, RentalStatus } from "@/types/rental";
import { safeImageSrc } from "@/lib/imageUtils";
import { formatDate } from "@/lib/dateUtils";
import { translateStatus, translateStatusColor } from "@/lib/statusUtils";

interface AdminRentalListProps {
  rentals: Rental[];
  loading: boolean;
  onApprove: (rentalId: string) => Promise<void>;
  onReject: (rentalId: string) => Promise<void>;
  onCancel: (rentalId: string) => Promise<void>;
  onComplete: (rentalId: string) => Promise<void>;
}

export function AdminRentalList({
  rentals,
  loading,
  onApprove,
  onReject,
  onCancel,
  onComplete,
}: AdminRentalListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (rentals.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border-2 border-dashed py-12 text-center"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p style={{ color: "var(--color-text-muted)" }}>Onay bekleyen talep yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
      {rentals.map((rental) => {
        const status = rental.status as RentalStatus;
        const isPending = status === "pending";
        const isActive = status === "active";

        return (
          <motion.div
            key={rental.id}
            layout
            className="rounded-2xl p-5 space-y-3 transition-colors"
            style={{
              border: "1px solid var(--color-border)",
              backgroundColor: "rgba(255,255,255,0.5)",
            }}
          >
            {/* Status badge */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium border ${translateStatusColor(status)}`}
              >
                {translateStatus(status)}
              </span>
            </div>

            {/* Car Info */}
            {rental.carDetails && (
              <div
                className="flex items-center gap-3 pb-3"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div className="h-10 w-14 overflow-hidden rounded-lg shrink-0">
                  <Image
                    src={safeImageSrc(rental.carDetails.image)}
                    alt={rental.carDetails.brand}
                    width={56}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                    {rental.carDetails.brand} {rental.carDetails.model}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {rental.carDetails.year}
                  </p>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>
                  Tarih
                </p>
                <p className="font-medium text-xs" style={{ color: "var(--color-text)" }}>
                  {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>
                  Tutar
                </p>
                <p
                  className="font-semibold"
                  style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-gold)" }}
                >
                  ₺{rental.totalPrice}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>
                  Kullanıcı ID
                </p>
                <p className="font-mono text-xs" style={{ color: "var(--color-text)" }}>
                  {rental.userId.substring(0, 12)}...
                </p>
              </div>
            </div>

            {/* Receipt Info */}
            {rental.receiptInfo ? (
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: "rgba(166,138,100,0.1)",
                  border: "1px solid rgba(166,138,100,0.25)",
                }}
              >
                <p
                  className="text-[10px] uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-gold)" }}
                >
                  Dekont / Referans No
                </p>
                <p
                  className="text-base font-semibold break-all"
                  style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}
                >
                  {rental.receiptInfo}
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: "rgba(201,123,90,0.08)", border: "1px solid rgba(201,123,90,0.2)" }}
              >
                <p className="text-xs text-center" style={{ color: "#c97b5a" }}>
                  Dekont bilgisi girilmemiş.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* onay_bekliyor → Onayla or Reddet */}
              {isPending && (
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onApprove(rental.id)}
                    disabled={!rental.receiptInfo}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-white transition-all duration-300 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                    style={{ backgroundColor: "var(--color-vizon)" }}
                    aria-label="Rezervasyonu onayla"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {rental.receiptInfo ? "Onayla" : "Dekont Bekleniyor"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onReject(rental.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all duration-300 hover:bg-red-50"
                    style={{ borderColor: "rgba(201,123,90,0.4)", color: "#c97b5a" }}
                    aria-label="Rezervasyonu reddet"
                  >
                    <XCircle className="h-4 w-4" />
                    Reddet
                  </motion.button>
                </div>
              )}

              {/* aktif → İptal or Tamamlandı */}
              {isActive && (
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onComplete(rental.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium text-white transition-all duration-300 hover:opacity-80"
                    style={{ backgroundColor: "#6366f1" }}
                    aria-label="Kiralama tamamlandı olarak işaretle"
                  >
                    <PackageCheck className="h-4 w-4" />
                    Tamamlandı
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onCancel(rental.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-medium transition-all duration-300 hover:bg-red-50"
                    style={{ borderColor: "rgba(107,114,128,0.4)", color: "#6b7280" }}
                    aria-label="Aktif kiralama iptal et"
                  >
                    <Ban className="h-4 w-4" />
                    İptal Et
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
