"use client";

import { Info } from "lucide-react";
import type { PricingBreakdown } from "@/services/rentalService";

interface PricingSummaryProps {
  pricing: PricingBreakdown;
  pricePerDay: number;
}

export function PricingSummary({ pricing, pricePerDay }: PricingSummaryProps) {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{
        backgroundColor: "rgba(255,255,255,0.6)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Base price row */}
      <div
        className="flex items-center justify-between text-sm"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span>
          {pricing.totalDays} gün × ₺{pricePerDay}
        </span>
        <span>₺{pricePerDay * pricing.totalDays}</span>
      </div>

      {/* Weekend surcharge */}
      {pricing.hasWeekendSurcharge && (
        <>
          <div
            className="flex items-center justify-between text-sm"
            style={{ color: "var(--color-gold)" }}
          >
            <span>{pricing.weekendDays} hafta sonu günü (+%25)</span>
            <span>+₺{Math.round(pricePerDay * 0.25 * pricing.weekendDays)}</span>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs"
            style={{ backgroundColor: "rgba(166,138,100,0.1)", color: "var(--color-gold)" }}
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            Hafta sonu avantajlı fiyatlandırma dahil edildi.
          </div>
        </>
      )}

      {/* Total */}
      <div
        className="flex items-center justify-between border-t pt-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="font-medium" style={{ color: "var(--color-text)" }}>
          Toplam Tutar
        </span>
        <span
          className="text-2xl font-semibold"
          style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-gold)" }}
        >
          ₺{pricing.totalPrice}
        </span>
      </div>

      {/* Bank transfer info */}
      <div
        className="rounded-xl p-4 space-y-1.5 text-sm"
        style={{
          backgroundColor: "rgba(248,245,242,0.8)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p className="font-medium mb-2" style={{ color: "var(--color-text)" }}>
          Banka Havalesi / EFT
        </p>
        <p style={{ color: "var(--color-text-muted)" }}>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>
            Firma:
          </span>{" "}
          Demir Rent A.Ş.
        </p>
        <p style={{ color: "var(--color-text-muted)" }}>
          <span className="font-medium" style={{ color: "var(--color-text)" }}>
            Banka:
          </span>{" "}
          Garanti BBVA
        </p>
        <p className="font-mono text-xs pt-1" style={{ color: "var(--color-text)" }}>
          TR12 3456 7890 0000 0000 00
        </p>
        <p className="text-xs pt-1" style={{ color: "var(--color-gold)" }}>
          Açıklamaya araç modelini yazmayı unutmayın.
        </p>
      </div>
    </div>
  );
}
