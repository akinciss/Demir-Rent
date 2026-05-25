import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F7F5F0] px-6 text-center">
      <div className="mb-6 rounded-full bg-stone-200 p-4 text-stone-600">
        <SearchX className="h-10 w-10" />
      </div>
      <h1 className="mb-4 text-4xl font-light tracking-tight text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
        Sayfa Bulunamadı
      </h1>
      <p className="mb-8 max-w-md text-stone-500 font-light">
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. URL&apos;yi kontrol edebilir veya ana sayfaya dönebilirsiniz.
      </p>
      <Link
        href="/"
        className="rounded-full bg-stone-800 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
