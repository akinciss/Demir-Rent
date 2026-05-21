"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Car, Home, ClipboardList, LogOut, LogIn, UserPlus } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
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
    <nav className="sticky top-0 z-50 w-full border-b border-stone-200 bg-[#F7F5F0]/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-stone-900">
            <Car className="h-6 w-6 text-amber-900" />
            Demir Rent
          </Link>
          <div className="flex flex-wrap items-center gap-6 text-sm text-stone-600">
            <Link href="/" className="flex items-center gap-1.5 font-medium hover:text-stone-900 transition-colors duration-300">
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Link>
            <Link href="/cars" className="flex items-center gap-1.5 font-medium hover:text-stone-900 transition-colors duration-300">
              <Car className="h-4 w-4" />
              Araçlar
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {!user ? (
            <>
              <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors duration-300">
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-full border border-stone-800 bg-transparent px-5 py-2 text-sm font-medium text-stone-800 transition-colors duration-500 hover:bg-stone-800 hover:text-[#F7F5F0]"
              >
                <UserPlus className="h-4 w-4" />
                Kayıt Ol
              </Link>
            </>
          ) : (
            <>
              <Link href="/my-rentals" className="mr-2 flex items-center gap-1.5 text-sm font-medium text-amber-900 hover:text-stone-900 transition-colors duration-300">
                <ClipboardList className="h-4 w-4" />
                Siparişlerim
              </Link>
              <span className="text-sm font-medium text-stone-500">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-full bg-stone-200 text-stone-700 px-4 py-2 text-sm font-medium transition-colors duration-500 hover:bg-stone-300"
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
