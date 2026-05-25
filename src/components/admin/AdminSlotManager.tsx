"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Calendar, RefreshCcw, Car } from "lucide-react";
import { carSlotRepository } from "@/repositories/carSlotRepository";
import { adminService } from "@/services/adminService";
import type { Car as CarType } from "@/types/car";
import type { CarSlot } from "@/types/carSlot";
import { formatDate } from "@/lib/dateUtils";
import toast from "react-hot-toast";

interface AdminSlotManagerProps {
  cars: CarType[];
}

export function AdminSlotManager({ cars }: AdminSlotManagerProps) {
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [slots, setSlots] = useState<CarSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // New slot form state
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchSlots = useCallback(async (carId: string) => {
    if (!carId) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    try {
      const data = await carSlotRepository.getSlotsByCarId(carId);
      // Sort slots by start date
      data.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
      setSlots(data);
    } catch {
      toast.error("Slotlar yüklenirken bir hata oluştu.");
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!selectedCarId) {
        setSlots([]);
        return;
      }
      setLoadingSlots(true);
      try {
        const data = await carSlotRepository.getSlotsByCarId(selectedCarId);
        if (active) {
          data.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
          setSlots(data);
          setLoadingSlots(false);
        }
      } catch {
        if (active) {
          toast.error("Slotlar yüklenirken bir hata oluştu.");
          setLoadingSlots(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selectedCarId]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId) {
      toast.error("Lütfen bir araç seçin.");
      return;
    }
    if (!startAt || !endAt) {
      toast.error("Lütfen başlangıç ve bitiş tarihlerini girin.");
      return;
    }

    const newStart = new Date(startAt).getTime();
    const newEnd = new Date(endAt).getTime();

    if (newStart >= newEnd) {
      toast.error("Başlangıç tarihi bitiş tarihinden önce olmalıdır.");
      return;
    }

    // Front-end overlap check
    const isOverlapping = slots.some((slot) => {
      const existingStart = new Date(slot.startAt).getTime();
      const existingEnd = new Date(slot.endAt).getTime();
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (isOverlapping) {
      toast.error("Bu tarih aralığı mevcut bir slot ile çakışıyor!");
      return;
    }

    setSubmitting(true);
    try {
      await adminService.addSlot(selectedCarId, startAt, endAt);
      toast.success("Slot başarıyla eklendi.");
      setStartAt("");
      setEndAt("");
      fetchSlots(selectedCarId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Slot eklenirken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Bu slotu silmek istediğinize emin misiniz?")) return;

    try {
      await adminService.deleteSlot(slotId);
      toast.success("Slot silindi.");
      fetchSlots(selectedCarId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Slot silinirken hata oluştu.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Car Selector */}
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wider">
          Araç Seçin
        </label>
        <div className="relative">
          <select
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-stone-800 focus:outline-none"
          >
            <option value="">Araç Seçiniz...</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.brand} {car.model} ({car.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCarId ? (
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {/* Left: Add Slot Form */}
          <div className="rounded-2xl p-5 border border-stone-200 bg-white space-y-4">
            <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4 text-stone-600" />
              Yeni Slot Tanımla
            </h3>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm focus:border-stone-800 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  min={startAt || new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm focus:border-stone-800 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--color-vizon)" }}
              >
                {submitting ? "Ekleniyor..." : "Slot Ekle"}
              </button>
            </form>
          </div>

          {/* Right: Slots List */}
          <div className="rounded-2xl p-5 border border-stone-200 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-stone-600" />
                Mevcut Slotlar
              </h3>
              <button
                onClick={() => fetchSlots(selectedCarId)}
                className="p-1 hover:bg-stone-50 rounded-lg transition-colors"
                title="Yenile"
              >
                <RefreshCcw className="h-3.5 w-3.5 text-stone-500" />
              </button>
            </div>

            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-transparent" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-8">
                Bu araç için henüz tanımlanmış slot bulunmuyor.
              </p>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {slots.map((slot) => {
                  const statusColors: Record<string, string> = {
                    available: "bg-green-50 text-green-700 border-green-200",
                    reserved: "bg-amber-50 text-amber-700 border-amber-200",
                    booked: "bg-blue-50 text-blue-700 border-blue-200",
                    closed: "bg-stone-50 text-stone-500 border-stone-200",
                  };
                  const statusLabels: Record<string, string> = {
                    available: "Müsait",
                    reserved: "Rezerve",
                    booked: "Dolu",
                    closed: "Kapalı",
                  };

                  return (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-100 text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-stone-700">
                          {formatDate(slot.startAt)} &rarr; {formatDate(slot.endAt)}
                        </p>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full border text-[10px] ${
                            statusColors[slot.status] || "bg-stone-100 text-stone-800"
                          }`}
                        >
                          {statusLabels[slot.status] || slot.status}
                        </span>
                      </div>
                      {slot.status === "available" && (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Slotu Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-stone-200 rounded-2xl">
          <Car className="h-8 w-8 text-stone-300 mb-2" />
          <p className="text-sm text-stone-500">
            Slotları yönetmek için yukarıdan bir araç seçin.
          </p>
        </div>
      )}
    </div>
  );
}
