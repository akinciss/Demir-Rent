"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Rent Page Error Caught:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F7F5F0] px-6 text-center">
      <div className="mb-6 rounded-full bg-stone-200 p-4 text-stone-600">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h1 className="mb-4 text-3xl font-light tracking-tight text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
        Rezervasyon İşlemi Durakladı
      </h1>
      <p className="mb-8 max-w-md text-stone-500 font-light">
        Kiralama işlemine devam ederken bir bağlantı veya sistem hatası oluştu. Lütfen tekrar deneyin.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full bg-stone-800 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Tekrar Dene
        </button>
        <Link
          href="/cars"
          className="rounded-full border border-stone-300 bg-white px-8 py-3 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-50"
        >
          Araçlara Dön
        </Link>
      </div>
    </div>
  );
}
