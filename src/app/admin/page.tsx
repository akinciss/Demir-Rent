"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ShieldCheck, PlusCircle, CheckCircle, RefreshCcw, Settings, Trash2, Car } from "lucide-react";
import { adminService } from "@/services/adminService";
import { useAdmin } from "@/hooks/useAdmin";
import { carRepository } from "@/repositories/carRepository";
import { useCars } from "@/hooks/useCars";
import { motion } from "framer-motion";
import type { Rental } from "@/types/car";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { pendingRentals, loading: loadingRentals, refetch, approveRental } = useAdmin();
  const { cars, loading: loadingCars, refetch: refetchCars } = useCars();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "eyleniyoruz.test01@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setTimeout(() => router.push("/"), 2000);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  // --- Add Car Form State ---
  const [carData, setCarData] = useState({
    brand: "", model: "", year: new Date().getFullYear(),
    fuel: "Benzin", transmission: "Otomatik", pricePerDay: 0,
    image: "", seats: 5, type: "Sedan"
  });
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await adminService.addCar({
        brand: carData.brand, model: carData.model, year: Number(carData.year),
        fuel: carData.fuel, transmission: carData.transmission,
        pricePerDay: Number(carData.pricePerDay), image: carData.image,
        seats: Number(carData.seats), capacity: Number(carData.seats),
        type: carData.type, isAvailable: true,
      });
      setSuccessMsg("Araç başarıyla eklendi!");
      setCarData({ brand: "", model: "", year: new Date().getFullYear(), fuel: "Benzin", transmission: "Otomatik", pricePerDay: 0, image: "", seats: 5, type: "Sedan" });
      setShowForm(false);
      refetchCars();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error: any) {
      alert(error.message || "Araç eklenirken bir hata oluştu.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCar = async (carId: string | number) => {
    if (!confirm("Bu aracı silmek istediğinizden emin misiniz?")) return;
    try {
      await carRepository.deleteCar(String(carId));
      refetchCars();
    } catch {
      alert("Araç silinirken hata oluştu.");
    }
  };

  const handleApprove = async (rentalId: string) => {
    try {
      await approveRental(rentalId);
    } catch {
      alert("Onaylanırken hata oluştu.");
    }
  };

  const inputClass = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[#8B7E74]";
  const inputStyle = { borderColor: "var(--color-border)", backgroundColor: "rgba(255,255,255,0.7)", color: "var(--color-text)" };

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }} />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="rounded-2xl border p-8 text-center max-w-md" style={{ borderColor: "rgba(201,123,90,0.3)", backgroundColor: "rgba(201,123,90,0.08)" }}>
          <h2 className="mb-2 text-2xl" style={{ fontFamily: "'Playfair Display', serif", color: "#c97b5a" }}>Erişim Reddedildi</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Bu sayfaya erişim yetkiniz yoktur. Yönlendiriliyorsunuz...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-6 pt-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Settings className="h-7 w-7" style={{ color: "var(--color-vizon)" }} />
          <h1 className="text-3xl font-medium" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}>
            Yönetim Paneli
          </h1>
        </div>

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
            style={{ backgroundColor: "rgba(139,126,116,0.12)", color: "var(--color-vizon)" }}
          >
            <CheckCircle className="h-4 w-4" />
            {successMsg}
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT: Araç Envanteri */}
          <div>
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="flex items-center gap-2 text-lg font-medium" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}>
                  <Car className="h-5 w-5" style={{ color: "var(--color-vizon)" }} />
                  Araç Envanteri
                </h2>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:opacity-80"
                  style={{ backgroundColor: "var(--color-vizon)" }}
                >
                  <PlusCircle className="h-4 w-4" />
                  {showForm ? "İptal" : "Yeni Araç"}
                </button>
              </div>

              {/* Add Car Form */}
              {showForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddCar}
                  className="mb-6 space-y-3 overflow-hidden rounded-2xl p-5"
                  style={{ backgroundColor: "rgba(255,255,255,0.5)", border: "1px solid var(--color-border)" }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Marka</label>
                      <input required type="text" className={inputClass} style={inputStyle} placeholder="BMW" value={carData.brand} onChange={e => setCarData({ ...carData, brand: e.target.value })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Model</label>
                      <input required type="text" className={inputClass} style={inputStyle} placeholder="320i" value={carData.model} onChange={e => setCarData({ ...carData, model: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Yıl</label>
                      <input required type="number" className={inputClass} style={inputStyle} value={carData.year} onChange={e => setCarData({ ...carData, year: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Günlük (₺)</label>
                      <input required type="number" className={inputClass} style={inputStyle} value={carData.pricePerDay || ""} onChange={e => setCarData({ ...carData, pricePerDay: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Yakıt</label>
                      <select className={inputClass} style={inputStyle} value={carData.fuel} onChange={e => setCarData({ ...carData, fuel: e.target.value })}>
                        <option>Benzin</option><option>Dizel</option><option>Elektrik</option><option>Hibrit</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Vites</label>
                      <select className={inputClass} style={inputStyle} value={carData.transmission} onChange={e => setCarData({ ...carData, transmission: e.target.value })}>
                        <option>Otomatik</option><option>Manuel</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Tip</label>
                      <select className={inputClass} style={inputStyle} value={carData.type} onChange={e => setCarData({ ...carData, type: e.target.value })}>
                        <option>Sedan</option><option>SUV</option><option>Hatchback</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Görsel URL</label>
                    <input required type="url" className={inputClass} style={inputStyle} placeholder="https://..." value={carData.image} onChange={e => setCarData({ ...carData, image: e.target.value })} />
                  </div>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-all duration-300 hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-vizon)" }}
                  >
                    <PlusCircle className="h-4 w-4" />
                    {isAdding ? "Ekleniyor..." : "Aracı Ekle"}
                  </button>
                </motion.form>
              )}

              {/* Car List */}
              {loadingCars ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }} />
                </div>
              ) : cars.length === 0 ? (
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed py-12 text-center" style={{ borderColor: "var(--color-border)" }}>
                  <p style={{ color: "var(--color-text-muted)" }}>Henüz araç eklenmedi.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {cars.map((car) => (
                    <motion.div
                      key={car.id}
                      layout
                      className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/50"
                      style={{ border: "1px solid var(--color-border)" }}
                    >
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                        <img src={car.image} alt={car.brand} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--color-text)" }}>{car.brand} {car.model}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{car.year} · {car.type} · ₺{car.pricePerDay}/gün</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCar(car.id)}
                        className="shrink-0 rounded-lg p-2 transition-colors hover:bg-red-50"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Rezervasyon Talepleri */}
          <div>
            <div className="glass-card rounded-3xl p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-medium" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}>
                  <ShieldCheck className="h-5 w-5" style={{ color: "var(--color-vizon)" }} />
                  Rezervasyon Talepleri
                </h2>
                <button
                  onClick={refetch}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-60"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Yenile
                </button>
              </div>

              {loadingRentals ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }} />
                </div>
              ) : pendingRentals.length === 0 ? (
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed py-12 text-center" style={{ borderColor: "var(--color-border)" }}>
                  <p style={{ color: "var(--color-text-muted)" }}>Onay bekleyen talep yok.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  {pendingRentals.map((rental: Rental) => (
                    <motion.div
                      key={rental.id}
                      layout
                      className="rounded-2xl p-5 space-y-3 transition-colors"
                      style={{ border: "1px solid var(--color-border)", backgroundColor: "rgba(255,255,255,0.5)" }}
                    >
                      {/* Car Info */}
                      {rental.carDetails && (
                        <div className="flex items-center gap-3 pb-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <div className="h-10 w-14 overflow-hidden rounded-lg shrink-0">
                            <img src={rental.carDetails.image} alt={rental.carDetails.brand} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{rental.carDetails.brand} {rental.carDetails.model}</p>
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{rental.carDetails.year}</p>
                          </div>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>Tarih</p>
                          <p className="font-medium text-xs" style={{ color: "var(--color-text)" }}>{rental.startDate} → {rental.endDate}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>Tutar</p>
                          <p className="font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-gold)" }}>₺{rental.totalPrice}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "var(--color-text-muted)" }}>Kullanıcı ID</p>
                          <p className="font-mono text-xs" style={{ color: "var(--color-text)" }}>{rental.userId.substring(0, 12)}...</p>
                        </div>
                      </div>

                      {/* Receipt Info — Prominent */}
                      {rental.receiptInfo ? (
                        <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(166,138,100,0.1)", border: "1px solid rgba(166,138,100,0.25)" }}>
                          <p className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--color-gold)" }}>Dekont / Referans No</p>
                          <p className="text-base font-semibold break-all" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}>
                            {rental.receiptInfo}
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(201,123,90,0.08)", border: "1px solid rgba(201,123,90,0.2)" }}>
                          <p className="text-xs text-center" style={{ color: "#c97b5a" }}>Dekont bilgisi girilmemiş — onay yapılamaz.</p>
                        </div>
                      )}

                      {/* Approve Button — only active if receiptInfo exists */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleApprove(rental.id)}
                        disabled={!rental.receiptInfo}
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-all duration-300 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
                        style={{ backgroundColor: "var(--color-vizon)" }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        {rental.receiptInfo ? "Ödemeyi Onayla" : "Dekont Bekleniyor"}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
