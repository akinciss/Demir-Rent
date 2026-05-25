"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { rolesRepository } from "@/repositories/rolesRepository";
import { ShieldCheck, PlusCircle, RefreshCcw, Settings, Car } from "lucide-react";
import { useAdminPanel } from "@/hooks/useAdminPanel";
import { AdminCarForm } from "@/components/admin/AdminCarForm";
import { AdminCarList } from "@/components/admin/AdminCarList";
import { AdminRentalList } from "@/components/admin/AdminRentalList";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const {
    pendingRentals,
    loadingRentals,
    cars,
    loadingCars,
    refetchRentals,
    approveRental,
    rejectRental,
    cancelRental,
    completeRental,
    addCar,
    deleteCar,
  } = useAdminPanel();

  // Auth + admin check
  useEffect(() => {
    if (!auth) {
      setCheckingAuth(false);
      setIsAdmin(false);
      setTimeout(() => router.push("/"), 2000);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const roles = await rolesRepository.getRoleByUserId(user.uid);
          if (roles?.admin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            setTimeout(() => router.push("/"), 2000);
          }
        } else {
          setIsAdmin(false);
          setTimeout(() => router.push("/"), 2000);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setIsAdmin(false);
        setTimeout(() => router.push("/"), 2000);
      } finally {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ── Action handlers with toast feedback ──────────────────────

  const handleApprove = async (rentalId: string) => {
    try {
      await approveRental(rentalId);
      toast.success("Rezervasyon onaylandı.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Onay işlemi başarısız.");
    }
  };

  const handleReject = async (rentalId: string) => {
    try {
      await rejectRental(rentalId);
      toast.success("Rezervasyon reddedildi.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Red işlemi başarısız.");
    }
  };

  const handleCancel = async (rentalId: string) => {
    try {
      await cancelRental(rentalId);
      toast.success("Rezervasyon iptal edildi.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "İptal işlemi başarısız.");
    }
  };

  const handleComplete = async (rentalId: string) => {
    try {
      await completeRental(rentalId);
      toast.success("Rezervasyon tamamlandı olarak işaretlendi.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Tamamlama işlemi başarısız.");
    }
  };

  const handleAddCar = async (carData: Parameters<typeof addCar>[0]) => {
    try {
      await addCar(carData);
      toast.success("Araç başarıyla eklendi!");
      setShowForm(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Araç eklenirken hata oluştu.");
    }
  };

  const handleDeleteCar = async (carId: string) => {
    try {
      await deleteCar(carId);
      toast.success("Araç silindi.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Araç silinirken hata oluştu.");
    }
  };

  // ── Render guards ────────────────────────────────────────────

  if (checkingAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }}
        />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg)" }}>
        <div
          className="rounded-2xl border p-8 text-center max-w-md"
          style={{ borderColor: "rgba(201,123,90,0.3)", backgroundColor: "rgba(201,123,90,0.08)" }}
        >
          <h2 className="mb-2 text-2xl" style={{ fontFamily: "'Playfair Display', serif", color: "#c97b5a" }}>
            Erişim Reddedildi
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Bu sayfaya erişim yetkiniz yoktur. Yönlendiriliyorsunuz...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-20" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="mx-auto max-w-7xl px-6 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-3"
        >
          <Settings className="h-7 w-7" style={{ color: "var(--color-vizon)" }} />
          <h1
            className="text-3xl font-medium"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}
          >
            Yönetim Paneli
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* LEFT: Araç Envanteri */}
          <div>
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="flex items-center gap-2 text-lg font-medium"
                  style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}
                >
                  <Car className="h-5 w-5" style={{ color: "var(--color-vizon)" }} />
                  Araç Envanteri
                </h2>
                <button
                  id="toggle-add-car-form"
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:opacity-80"
                  style={{ backgroundColor: "var(--color-vizon)" }}
                >
                  <PlusCircle className="h-4 w-4" />
                  {showForm ? "İptal" : "Yeni Araç"}
                </button>
              </div>

              {showForm && (
                <AdminCarForm onAdd={handleAddCar} onCancel={() => setShowForm(false)} />
              )}

              <AdminCarList
                cars={cars}
                loading={loadingCars}
                onDelete={handleDeleteCar}
              />
            </div>
          </div>

          {/* RIGHT: Rezervasyon Talepleri */}
          <div>
            <div className="glass-card rounded-3xl p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2
                  className="flex items-center gap-2 text-lg font-medium"
                  style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}
                >
                  <ShieldCheck className="h-5 w-5" style={{ color: "var(--color-vizon)" }} />
                  Rezervasyon Yönetimi
                </h2>
                <button
                  id="refresh-rentals"
                  onClick={refetchRentals}
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-60"
                  style={{ color: "var(--color-text-muted)" }}
                  aria-label="Rezervasyonları yenile"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Yenile
                </button>
              </div>

              <AdminRentalList
                rentals={pendingRentals}
                loading={loadingRentals}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
                onComplete={handleComplete}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
