"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Car, Home, ClipboardList, LogOut, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-500 glass-nav ${
        scrolled ? "shadow-[0_2px_24px_-4px_rgba(45,41,38,0.1)]" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Logo & Nav Links */}
        <div className="flex items-center justify-between gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-75"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-vizon)" }}>
              <Car className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-xl tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)", fontWeight: 600 }}
            >
              Demir Rent
            </span>
          </Link>

          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <Link
              href="/"
              className="flex items-center gap-1.5 font-medium transition-colors duration-300 hover:text-[#2D2926]"
            >
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Link>
            <Link
              href="/cars"
              className="flex items-center gap-1.5 font-medium transition-colors duration-300 hover:text-[#2D2926]"
            >
              <Car className="h-4 w-4" />
              Araçlar
            </Link>
          </div>
        </div>

        {/* Auth Actions */}
        <div className="flex flex-wrap items-center gap-4">
          {!user ? (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-300"
                style={{ color: "var(--color-text-muted)" }}
              >
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-medium text-white transition-all duration-500 hover:opacity-85 hover:shadow-md"
                style={{ backgroundColor: "var(--color-vizon)" }}
              >
                <UserPlus className="h-4 w-4" />
                Kayıt Ol
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/my-rentals"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 hover:text-[#2D2926]"
                style={{ color: "var(--color-gold)" }}
              >
                <ClipboardList className="h-4 w-4" />
                Siparişlerim
              </Link>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 hover:opacity-75"
                style={{ backgroundColor: "rgba(139,126,116,0.12)", color: "var(--color-vizon)" }}
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
