"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ClipboardList, CalendarDays, Search, Car } from "lucide-react";
import { useRentals } from "@/hooks/useRentals";
import Image from "next/image";

export default function MyRentalsPage() {
  const router = useRouter();
  const [userChecked, setUserChecked] = useState(false);
  const { rentals, loading, error } = useRentals();

  useEffect(() => {
    if (!auth) {
      router.push("/login");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserChecked(true);
    });

    return () => unsubscribe();
  }, [router]);

  if (!userChecked || loading) {
    return (
      <main className="min-h-screen bg-[#F7F5F0]">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-800 border-t-transparent"></div>
            <p className="mt-4 font-medium text-stone-500">Siparişleriniz yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] pb-20">
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <div className="mb-8 flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-stone-800" />
          <h1 className="text-3xl font-light text-stone-800 tracking-tight">Siparişlerim</h1>
        </div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-16 text-center shadow-sm">
            <p className="text-xl font-medium text-red-800">{error}</p>
          </div>
        ) : rentals.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-16 text-center shadow-sm">
            <Search className="mx-auto h-16 w-16 text-stone-300 mb-4" />
            <p className="text-xl font-medium text-stone-900">Henüz hiç araç kiralamadınız.</p>
            <p className="mt-2 text-stone-500">Araçlarımızı keşfetmek için hemen kataloğa göz atın.</p>
            <button 
              onClick={() => router.push('/cars')}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-800 bg-transparent px-8 py-3 text-sm font-medium tracking-wide text-stone-800 transition-colors duration-500 hover:bg-stone-800 hover:text-[#F7F5F0]"
            >
              <Car className="h-5 w-5" />
              Araçları Keşfet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {rentals.map((rental) => (
              <div key={rental.id} className="overflow-hidden rounded-2xl bg-white shadow-sm border border-stone-200 transition-all duration-500 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1">
                <div className="grid md:grid-cols-4 gap-6 p-6">
                  {/* Araç Görseli */}
                  <div className="col-span-1 h-32 md:h-full bg-stone-100 rounded-xl overflow-hidden shrink-0">
                      {rental.carDetails ? (
                      <Image src={rental.carDetails.image} alt={rental.carDetails.brand} width={320} height={200} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-400">Görsel Yok</div>
                    )}
                  </div>
                  
                  {/* Araç ve Tarih Detayları */}
                  <div className="col-span-2 flex flex-col justify-center">
                    {rental.carDetails ? (
                      <>
                        <h2 className="text-xl font-medium tracking-tight text-stone-800">{rental.carDetails.brand} {rental.carDetails.model}</h2>
                        <p className="mt-1 text-sm text-stone-500">{rental.carDetails.year} • {rental.carDetails.fuel} • {rental.carDetails.transmission}</p>
                      </>
                    ) : (
                      <h2 className="text-xl font-medium tracking-tight text-stone-800">Bilinmeyen Araç</h2>
                    )}
                    
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-stone-700">
                      <div className="rounded-xl bg-stone-50 px-4 py-3 border border-stone-100">
                        <span className="flex items-center gap-1.5 text-stone-400 text-xs mb-1 uppercase tracking-wider">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Alış Tarihi
                        </span>
                        {rental.startDate}
                      </div>
                      <span className="text-stone-300">&rarr;</span>
                      <div className="rounded-xl bg-stone-50 px-4 py-3 border border-stone-100">
                        <span className="flex items-center gap-1.5 text-stone-400 text-xs mb-1 uppercase tracking-wider">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Teslim Tarihi
                        </span>
                        {rental.endDate}
                      </div>
                    </div>
                  </div>
                  
                  {/* Fiyat ve Durum */}
                  <div className="col-span-1 flex flex-col items-start md:items-end justify-center border-t border-stone-100 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                    <p className="text-sm text-stone-500 mb-1">Toplam Tutar</p>
                    <p className="text-2xl font-semibold text-stone-800 mb-4">₺{rental.totalPrice}</p>
                    
                    {rental.status === "onay_bekliyor" ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-700">
                        <span className="mr-2 h-2 w-2 rounded-full bg-amber-500"></span>
                        Onay Bekliyor
                      </span>
                    ) : rental.status === "aktif" ? (
                      <span className="inline-flex items-center rounded-full bg-stone-100 border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700">
                        <span className="mr-2 h-2 w-2 rounded-full bg-stone-500"></span>
                        Onaylandı / Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-800">
                        {rental.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
