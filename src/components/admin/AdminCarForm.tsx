"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { Car } from "@/types/car";
import toast from "react-hot-toast";

interface AdminCarFormProps {
  onAdd: (carData: Omit<Car, "id">) => Promise<void>;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#8B7E74]";
const inputStyle = {
  borderColor: "var(--color-border)",
  backgroundColor: "rgba(255,255,255,0.7)",
  color: "var(--color-text)",
};

const INITIAL_STATE = {
  brand: "",
  model: "",
  year: new Date().getFullYear(),
  fuel: "Benzin",
  transmission: "Otomatik",
  pricePerDay: 0,
  image: "",
  seats: 5,
  type: "Sedan",
};

export function AdminCarForm({ onAdd, onCancel }: AdminCarFormProps) {
  const [carData, setCarData] = useState(INITIAL_STATE);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const brand = carData.brand.trim();
    const model = carData.model.trim();
    const year = Number(carData.year);
    const pricePerDay = Number(carData.pricePerDay);
    const image = carData.image.trim();
    const seats = Number(carData.seats);

    if (!brand || !model) {
      toast.error("Marka ve Model alanları boş bırakılamaz.");
      return;
    }

    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 2) {
      toast.error(`Geçersiz yıl. Yıl değeri 1900 ile ${currentYear + 2} arasında olmalıdır.`);
      return;
    }

    if (isNaN(pricePerDay) || pricePerDay <= 0) {
      toast.error("Günlük kiralama ücreti sıfırdan büyük olmalıdır.");
      return;
    }

    const isValidUrl = image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/");
    if (!isValidUrl) {
      toast.error("Geçersiz Görsel URL. Lütfen geçerli bir http/https linki veya local path girin.");
      return;
    }

    setIsAdding(true);
    try {
      await onAdd({
        brand,
        model,
        year,
        fuel: carData.fuel,
        transmission: carData.transmission,
        pricePerDay,
        image,
        seats,
        capacity: seats,
        type: carData.type,
        isActive: true,
      });
      setCarData(INITIAL_STATE);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mb-6 space-y-3 overflow-hidden rounded-2xl p-5"
      style={{
        backgroundColor: "rgba(255,255,255,0.5)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Marka
          </label>
          <input required type="text" className={inputClass} style={inputStyle} placeholder="BMW"
            value={carData.brand} onChange={e => setCarData({ ...carData, brand: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Model
          </label>
          <input required type="text" className={inputClass} style={inputStyle} placeholder="320i"
            value={carData.model} onChange={e => setCarData({ ...carData, model: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Yıl
          </label>
          <input required type="number" className={inputClass} style={inputStyle}
            value={carData.year} onChange={e => setCarData({ ...carData, year: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Günlük (₺)
          </label>
          <input required type="number" min="1" className={inputClass} style={inputStyle}
            value={carData.pricePerDay || ""}
            onChange={e => setCarData({ ...carData, pricePerDay: Number(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Yakıt
          </label>
          <select className={inputClass} style={inputStyle} value={carData.fuel}
            onChange={e => setCarData({ ...carData, fuel: e.target.value })}>
            <option>Benzin</option><option>Dizel</option><option>Elektrik</option><option>Hibrit</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Vites
          </label>
          <select className={inputClass} style={inputStyle} value={carData.transmission}
            onChange={e => setCarData({ ...carData, transmission: e.target.value })}>
            <option>Otomatik</option><option>Manuel</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Tip
          </label>
          <select className={inputClass} style={inputStyle} value={carData.type}
            onChange={e => setCarData({ ...carData, type: e.target.value })}>
            <option>Sedan</option><option>SUV</option><option>Hatchback</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Görsel URL
        </label>
        <input required type="url" className={inputClass} style={inputStyle}
          placeholder="https://..." value={carData.image}
          onChange={e => setCarData({ ...carData, image: e.target.value })} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isAdding}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-all duration-300 hover:opacity-80 disabled:opacity-50"
          style={{ backgroundColor: "var(--color-vizon)" }}
        >
          <PlusCircle className="h-4 w-4" />
          {isAdding ? "Ekleniyor..." : "Aracı Ekle"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border px-5 py-3 text-sm font-medium transition-colors hover:bg-white/50"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          İptal
        </button>
      </div>
    </motion.form>
  );
}
