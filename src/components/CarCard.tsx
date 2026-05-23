"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Key } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
type CarCardProps = {
  id?: string | number;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  transmission: string;
  pricePerDay: number;
  image: string;
  type?: string;
  capacity?: number;
  isAvailable?: boolean;
};

export default function CarCard({
  id,
  brand,
  model,
  year,
  fuel,
  transmission,
  pricePerDay,
  image,
  type,
  capacity,
  isAvailable,
}: CarCardProps) {
  const [userLoaded, setUserLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      // If auth isn't initialized, mark as loaded to avoid blocking UI
      setUserLoaded(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, () => {
      setUserLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const handleRent = () => {
    if (auth?.currentUser) {
      if (id) {
        router.push(`/rent/${id}`);
      } else {
        toast.error("Araç ID'si bulunamadı.");
      }
      return;
    }
    router.push("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ scale: 1.025, y: -4 }}
      className="glass-card overflow-hidden rounded-2xl flex flex-col h-full cursor-pointer transition-all duration-500"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      {/* Image */}
      <div className="relative h-52 w-full shrink-0 overflow-hidden">
        <Image
          src={image}
          alt={brand}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
        />
        {/* Availability Badge */}
        {isAvailable !== undefined && (
          <div className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-medium ${
            isAvailable
              ? "bg-white/80 text-emerald-700 backdrop-blur-sm"
              : "bg-white/80 text-rose-600 backdrop-blur-sm"
          }`}>
            {isAvailable ? "Müsait" : "Dolu"}
          </div>
        )}
        {/* Type Badge */}
        {type && (
          <div className="absolute top-3 left-3 rounded-full bg-white/70 backdrop-blur-sm px-2.5 py-1 text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
            {type}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              className="text-lg font-medium leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)" }}
            >
              {brand}
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
              {model}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: "rgba(139,126,116,0.1)", color: "var(--color-vizon)" }}
          >
            {year}
          </span>
        </div>

        {/* Details */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[fuel, transmission].map((tag) => (
            <span
              key={tag}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium"
              style={{ backgroundColor: "rgba(248,245,242,0.9)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
            >
              {tag}
            </span>
          ))}
          {capacity && (
            <span
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium"
              style={{ backgroundColor: "rgba(248,245,242,0.9)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
            >
              {capacity} Kişi
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div
          className="mt-auto flex items-center justify-between gap-4 pt-4 mt-5"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
              Günlük
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-gold)" }}
            >
              ₺{pricePerDay}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleRent}
            disabled={!userLoaded && !auth?.currentUser}
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-all duration-500 hover:opacity-85 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--color-vizon)" }}
          >
            <Key className="h-4 w-4" />
            Kirala
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
