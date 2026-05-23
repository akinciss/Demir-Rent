"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Car, ClipboardList, LogOut, LogIn, UserPlus, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/cars", label: "Filomuz" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      setUser(null);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Çıkış yaparken hata:", error);
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-500 glass-nav ${
          scrolled ? "shadow-[0_4px_32px_-8px_rgba(45,41,38,0.12)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: "var(--color-vizon)" }}
            >
              <Car className="h-4 w-4 text-white" />
            </div>
            <span
              className="text-[1.35rem] tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif", color: "var(--color-text)", fontWeight: 700, letterSpacing: "0.01em" }}
            >
              Demir Rent
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium transition-colors duration-300 group"
                  style={{ color: isActive ? "var(--color-text)" : "var(--color-text-muted)" }}
                >
                  {link.label}
                  {/* Animated underline */}
                  <span
                    className="absolute -bottom-0.5 left-0 h-[1.5px] transition-all duration-300"
                    style={{
                      width: isActive ? "100%" : "0%",
                      backgroundColor: "var(--color-vizon)",
                    }}
                  />
                  <span
                    className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: "var(--color-vizon)", opacity: isActive ? 0 : 1 }}
                  />
                </Link>
              );
            })}
          </div>

          {/* DESKTOP AUTH ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 hover:text-[#2D2926]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <LogIn className="h-4 w-4" />
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:shadow-[0_4px_16px_rgba(139,126,116,0.45)] hover:-translate-y-px"
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
                  className="flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:shadow-sm"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-gold)" }}
                >
                  <ClipboardList className="h-4 w-4" />
                  Rezervasyonum
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 hover:opacity-70"
                  style={{ backgroundColor: "rgba(139,126,116,0.1)", color: "var(--color-vizon)" }}
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış
                </button>
              </>
            )}
          </div>

          {/* MOBILE: Hamburger */}
          <button
            className="md:hidden flex items-center justify-center rounded-xl p-2 transition-colors duration-200"
            style={{ color: "var(--color-text)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menüyü aç/kapat"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-0 top-[65px] z-40 mx-3 rounded-2xl px-6 py-6 shadow-xl md:hidden"
            style={{
              backgroundColor: "rgba(253,251,249,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between text-base font-medium transition-colors"
                  style={{ color: pathname === link.href ? "var(--color-vizon)" : "var(--color-text)" }}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-vizon)" }} />
                  )}
                </Link>
              ))}

              <div className="h-px" style={{ backgroundColor: "var(--color-border)" }} />

              {!user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 rounded-full border py-3 text-sm font-medium transition-colors"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  >
                    <LogIn className="h-4 w-4" />
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white"
                    style={{ backgroundColor: "var(--color-vizon)" }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Kayıt Ol
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/my-rentals"
                    className="flex items-center justify-center gap-2 rounded-full border py-3 text-sm font-medium transition-colors"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-gold)" }}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Rezervasyonum
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-medium"
                    style={{ backgroundColor: "rgba(139,126,116,0.1)", color: "var(--color-vizon)" }}
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
