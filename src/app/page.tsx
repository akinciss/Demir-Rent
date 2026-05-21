"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CarCard from "../components/CarCard";
import { useCars } from "@/hooks/useCars";

const tabs = [
  { id: "yeni", label: "Son Eklenenler", desc: "Koleksiyonumuzun en yeni üyeleriyle tanışın." },
  { id: "haftasonu", label: "Hafta Sonuna Özel", desc: "Kısa süreliğine muhteşem fırsatları yakalayın." },
  { id: "seckin", label: "Seçkin Araçlar", desc: "Uzun dönem veya butik sürüş keyfi arayanlara." },
];

export default function HomePage() {
  const { cars, loading, error } = useCars();
  const [activeTab, setActiveTab] = useState("yeni");

  const getCarsForTab = () => {
    switch (activeTab) {
      case "yeni": return cars.slice(0, 3);
      case "haftasonu": return cars.slice(3, 6);
      case "seckin": return cars.slice(6, 9);
      default: return cars.slice(0, 3);
    }
  };

  const displayedCars = getCarsForTab();
  const activeTabData = tabs.find(t => t.id === activeTab)!;

  return (
    <main className="min-h-screen pb-20 overflow-x-hidden" style={{ backgroundColor: "var(--color-bg)" }}>

      {/* HERO */}
      <section style={{ backgroundColor: "var(--color-bg)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="mx-auto max-w-5xl px-6 py-36 text-center flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--color-vizon)" }}
          >
            Premium Araç Kiralama
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-4xl text-5xl md:text-7xl font-light leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}
          >
            Zarif bir sürüş <em>deneyimi</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 max-w-xl text-lg font-light leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            Minimalist tasarımımız ve üstün kalite anlayışımızla tanışın.
            Size en uygun butik aracı saniyeler içinde keşfedin.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex items-center gap-6"
          >
            <a
              href="/cars"
              className="rounded-full px-10 py-3.5 text-sm font-medium text-white transition-all duration-500 hover:opacity-85 hover:shadow-lg"
              style={{ backgroundColor: "var(--color-vizon)" }}
            >
              Koleksiyonu İncele
            </a>
            <a
              href="/cars"
              className="rounded-full border px-8 py-3.5 text-sm font-medium transition-all duration-500 hover:opacity-60"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
            >
              Nasıl Çalışır?
            </a>
          </motion.div>

          {/* Decorative line */}
          <div className="mt-20 flex items-center gap-4 opacity-40">
            <div className="h-px w-20" style={{ backgroundColor: "var(--color-vizon)" }} />
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-vizon)" }} />
            <div className="h-px w-20" style={{ backgroundColor: "var(--color-vizon)" }} />
          </div>
        </div>
      </section>

      {/* CAR CATALOG WITH TABS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--color-vizon)", borderTopColor: "transparent" }} />
          </div>
        ) : error ? (
          <div className="rounded-2xl p-16 text-center" style={{ border: "1px solid rgba(201,123,90,0.3)", backgroundColor: "rgba(201,123,90,0.06)" }}>
            <p style={{ color: "#c97b5a" }}>{error}</p>
          </div>
        ) : cars.length === 0 ? (
          <div className="rounded-2xl border p-16 text-center" style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(255,255,255,0.4)" }}>
            <p className="text-xl font-light" style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}>Henüz araç yüklenmedi</p>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>Veritabanında gösterilecek araç bulunamadı.</p>
          </div>
        ) : (
          <>
            {/* TAB NAVIGATION */}
            <div className="flex flex-col items-center mb-14">
              <div className="flex p-1.5 rounded-full gap-1 mb-8" style={{ backgroundColor: "rgba(139,126,116,0.1)" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-7 py-2.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap"
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
                  transition={{ duration: 0.25 }}
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
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayedCars.map((car, idx) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                  >
                    <CarCard {...car} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* View All CTA */}
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
