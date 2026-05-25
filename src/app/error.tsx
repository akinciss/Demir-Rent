"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Sadece geliştirici ortamında logla, son kullanıcıya sadece arayüz göster.
    if (process.env.NODE_ENV !== "production") {
      console.error("Global Error Caught:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F7F5F0] px-6 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h1 className="mb-4 text-4xl font-light tracking-tight text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
        Beklenmeyen Bir Hata Oluştu
      </h1>
      <p className="mb-8 max-w-md text-stone-500 font-light">
        Sistemimizde geçici bir sorun yaşıyoruz. Ekibimiz bu durumu inceleyecektir. Lütfen tekrar deneyin veya ana sayfaya dönün.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full bg-stone-800 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="rounded-full border border-stone-300 bg-white px-8 py-3 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
