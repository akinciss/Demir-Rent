"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import CarCard from "../components/CarCard";
import { useCars } from "@/hooks/useCars";
import { Search, MapPin, Calendar, ChevronDown } from "lucide-react";

const tabs = [
  { id: "yeni", label: "Son Eklenenler", desc: "Koleksiyonumuzun en yeni üyeleriyle tanışın." },
  { id: "haftasonu", label: "Hafta Sonuna Özel", desc: "Kısa süreliğine muhteşem fırsatları yakalayın." },
  { id: "seckin", label: "Seçkin Araçlar", desc: "Uzun dönem veya butik sürüş keyfi arayanlara." },
];

const carTypes = ["Tümü", "Sedan", "SUV", "Hatchback"];

// Fade-in-up variant factory
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, delay, ease: "easeOut" as const },
});

export default function HomePage() {
  const { cars, loading, error } = useCars();
  const [activeTab, setActiveTab] = useState("yeni");
  const router = useRouter();

  // Quick Search state — connects to real /cars filters
  const [searchDate, setSearchDate] = useState("");
  const [searchType, setSearchType] = useState("Tümü");

  const handleQuickSearch = () => {
    const params = new URLSearchParams();
    if (searchType && searchType !== "Tümü") params.set("type", searchType);
    if (searchDate) params.set("date", searchDate);
    router.push(`/cars?${params.toString()}`);
  };

  const getCarsForTab = () => {
    switch (activeTab) {
      case "yeni": return cars.slice(0, 3);
      case "haftasonu": return cars.slice(3, 6);
      case "seckin": return cars.slice(6, 9);
      default: return cars.slice(0, 3);
    }
  };

  const displayedCars = getCarsForTab();
  const activeTabData = tabs.find((t) => t.id === activeTab)!;
  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "var(--color-bg)" }}>

      {/* ===================== HERO ===================== */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop"
            alt="Premium araç"
            className="h-full w-full object-cover object-center"
          />
          {/* Layered gradient overlay */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(20,16,14,0.55) 0%, rgba(20,16,14,0.38) 55%, rgba(20,16,14,0.78) 100%)"
          }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-20 text-center">
          <motion.span {...fadeUp(0)} className="mb-5 inline-block rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em]"
            style={{ backgroundColor: "rgba(139,126,116,0.35)", color: "#e8ddd6", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}>
            Premium Araç Kiralama · Demir Rent
          </motion.span>

          <motion.h1
            {...fadeUp(0.12)}
            className="max-w-4xl text-5xl font-light leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Hayalindeki Yolculuğa{" "}
            <em className="block mt-2 not-italic" style={{ color: "#e0c9a8" }}>Demir At</em>
          </motion.h1>

          <motion.p
            {...fadeUp(0.24)}
            className="mt-7 max-w-2xl text-base font-light leading-relaxed sm:text-lg"
            style={{ color: "rgba(240,234,226,0.82)" }}
          >
            Geniş araç filomuzla konforlu, hızlı ve güvenli sürüş deneyimi şimdi bir tık uzağında.
            Seçkin koleksiyonumuzdan yolculuğunuzu başlatın.
          </motion.p>

          <motion.div {...fadeUp(0.36)} className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/cars"
              className="flex items-center gap-2 rounded-full px-9 py-3.5 text-sm font-semibold text-white shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
              style={{ backgroundColor: "var(--color-vizon)" }}
            >
              <Search className="h-4 w-4" />
              Hemen Kirala
            </a>
            <a
              href="/cars"
              className="flex items-center gap-2 rounded-full border px-8 py-3.5 text-sm font-medium text-white transition-all duration-500 hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.35)" }}
            >
              Araçları Keşfet
              <ChevronDown className="h-4 w-4" />
            </a>
          </motion.div>

          {/* QUICK SEARCH BAR */}
          <motion.div
            {...fadeUp(0.48)}
            className="mt-14 w-full max-w-3xl"
          >
            <div
              className="flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center sm:gap-0 sm:p-2"
              style={{
                backgroundColor: "rgba(253,251,249,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 20px 60px -12px rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              {/* Location — dekoratif, /cars'a yönlendirir */}
              <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 sm:border-r" style={{ borderColor: "var(--color-border)" }}>
                <MapPin className="h-4 w-4 shrink-0" style={{ color: "var(--color-vizon)" }} />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Lokasyon</p>
                  <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>İstanbul, Türkiye</p>
                </div>
              </div>

              {/* Date Picker */}
              <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 sm:border-r" style={{ borderColor: "var(--color-border)" }}>
                <Calendar className="h-4 w-4 shrink-0" style={{ color: "var(--color-vizon)" }} />
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Tarih</p>
                  <input
                    type="date"
                    min={today}
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium outline-none"
                    style={{ color: searchDate ? "var(--color-text)" : "var(--color-text-muted)" }}
                  />
                </div>
              </div>

              {/* Car Type */}
              <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3">
                <Car className="h-4 w-4 shrink-0" style={{ color: "var(--color-vizon)" }} />
                <div className="flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>Araç Tipi</p>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium outline-none cursor-pointer"
                    style={{ color: "var(--color-text)" }}
                  >
                    {carTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleQuickSearch}
                className="flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-md sm:shrink-0"
                style={{ backgroundColor: "var(--color-vizon)" }}
              >
                <Search className="h-4 w-4" />
                <span>Ara</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.45)" }}>Keşfet</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <ChevronDown className="h-4 w-4" style={{ color: "rgba(255,255,255,0.45)" }} />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===================== CAR CATALOG WITH TABS ===================== */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }}
            />
          </div>
        ) : error ? (
          <div className="rounded-2xl p-16 text-center" style={{ border: "1px solid rgba(201,123,90,0.3)", backgroundColor: "rgba(201,123,90,0.06)" }}>
            <p style={{ color: "#c97b5a" }}>{error}</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="rounded-2xl border p-16 text-center" style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255,255,255,0.4)" }}>
            <p className="text-xl font-light" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}>
              Henüz araç yüklenmedi
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Veritabanında gösterilecek araç bulunamadı.
            </p>
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="mb-12 text-center">
              <p className="mb-2 text-xs uppercase tracking-[0.2em]" style={{ color: "var(--color-vizon)" }}>
                Koleksiyonumuz
              </p>
              <h2 className="text-3xl font-light" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}>
                Seçkin Araç Filomuz
              </h2>
            </div>

            {/* TAB NAVIGATION */}
            <div className="flex flex-col items-center mb-12">
              <div className="flex p-1.5 rounded-full gap-1 mb-7 overflow-x-auto max-w-full" style={{ backgroundColor: "rgba(139,126,116,0.1)" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-6 py-2.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap"
                    style={{ color: activeTab === tab.id ? "var(--color-text)" : "var(--color-text-muted)" }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 rounded-full bg-white shadow-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={activeTab + "_desc"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {activeTabData.desc}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* CARS GRID */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayedCars.map((car, idx) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.09, duration: 0.42 }}
                  >
                    <CarCard {...car} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* View All */}
            <div className="mt-14 text-center">
              <a
                href="/cars"
                className="inline-flex items-center gap-2 rounded-full border px-8 py-3 text-sm font-medium transition-all duration-500 hover:opacity-60"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
              >
                Tüm Araçları Görüntüle
              </a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

// Local Car icon inline to avoid adding another import confusion
function Car(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 17H5a2 2 0 0 1-2-2V9l2.39-4.78A1 1 0 0 1 6.28 4h11.44a1 1 0 0 1 .89.55L21 9v6a2 2 0 0 1-2 2Z" />
      <circle cx="7.5" cy="17.5" r="2.5" />
      <circle cx="16.5" cy="17.5" r="2.5" />
    </svg>
  );
}
