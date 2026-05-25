"use client";

import { CheckCircle } from "lucide-react";
import type { CarSlot } from "@/types/carSlot";

interface SlotSelectorProps {
  slots: CarSlot[];
  selectedSlotId: string;
  onSelect: (id: string) => void;
}

export function SlotSelector({ slots, selectedSlotId, onSelect }: SlotSelectorProps) {
  if (slots.length === 0) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{
          backgroundColor: "rgba(201,123,90,0.05)",
          border: "1px solid rgba(201,123,90,0.1)",
        }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
          Bu araç için şu anda uygun tarih aralığı bulunmamaktadır.
        </p>
        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
          Lütfen daha sonra tekrar kontrol edin veya farklı bir araç seçin.
        </p>
      </div>
    );
  }

  return (
    <div>
      <label
        className="mb-1.5 block text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        Uygun Tarih Aralıkları
      </label>
      <div className="space-y-2">
        {slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelect(slot.id)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all flex justify-between items-center${isSelected ? " ring-2" : ""}`}
              style={{
                borderColor: isSelected ? "var(--color-vizon)" : "var(--color-border)",
                backgroundColor: isSelected
                  ? "rgba(139,126,116,0.1)"
                  : "rgba(255,255,255,0.6)",
                color: "var(--color-text)",
              }}
              aria-pressed={isSelected}
              aria-label={`Slot: ${slot.startAt} ile ${slot.endAt} arasında`}
            >
              <span>
                {slot.startAt} &rarr; {slot.endAt}
              </span>
              {isSelected && (
                <CheckCircle className="h-4 w-4 shrink-0" style={{ color: "var(--color-vizon)" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
