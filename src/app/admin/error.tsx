"use client";

import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Admin Error Caught:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-stone-50 px-6 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 text-red-600">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight text-stone-800">
        Yönetim Paneli Hatası
      </h1>
      <p className="mb-8 max-w-md text-stone-500 font-medium">
        Yönetim işleminde beklenmeyen bir sorun oluştu. Oturumunuzu kontrol edip tekrar deneyiniz.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-stone-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Yeniden Dene
        </button>
      </div>
    </div>
  );
}
