"use client";

import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { Car } from "@/types/car";
import { safeImageSrc } from "@/lib/imageUtils";

interface AdminCarListProps {
  cars: Car[];
  loading: boolean;
  onDelete: (carId: string) => void;
}

export function AdminCarList({ cars, loading, onDelete }: AdminCarListProps) {
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

  if (cars.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border-2 border-dashed py-12 text-center"
        style={{ borderColor: "var(--color-border)" }}
      >
        <p style={{ color: "var(--color-text-muted)" }}>Henüz araç eklenmedi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
      {cars.map((car) => (
        <motion.div
          key={car.id}
          layout
          className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/50"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={safeImageSrc(car.image)}
              alt={car.brand}
              width={80}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: "var(--color-text)" }}>
              {car.brand} {car.model}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {car.year} · {car.type} · ₺{car.pricePerDay}/gün
            </p>
            {car.isActive === false && (
              <span
                className="inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: "rgba(201,123,90,0.12)", color: "#c97b5a" }}
              >
                Pasif
              </span>
            )}
          </div>
          <button
            onClick={() => onDelete(car.id)}
            className="shrink-0 rounded-lg p-2 transition-colors hover:bg-red-50"
            title={`${car.brand} ${car.model} sil`}
            aria-label={`${car.brand} ${car.model} aracını sil`}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
