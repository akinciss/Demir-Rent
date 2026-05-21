"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import type { Car, Rental } from "@/types/car";
import { ClipboardList, CalendarDays, Search } from "lucide-react";

export default function MyRentalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserChecked(true);

      try {
        setLoading(true);
        // Kullanıcının siparişlerini çek
        const q = query(
          collection(db, "rentals"), 
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedRentals = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Rental[];

        // Her siparişin carId'sine göre araç detaylarını çek
        const rentalsWithCars = await Promise.all(
          fetchedRentals.map(async (rental) => {
            try {
              const carDoc = await getDoc(doc(db, "cars", rental.carId));
              if (carDoc.exists()) {
                rental.carDetails = { id: carDoc.id, ...carDoc.data() } as Car;
              }
            } catch (err) {
              console.error("Araç bilgisi çekilemedi", err);
            }
            return rental;
          })
        );

        // Tarihe göre sırala
        rentalsWithCars.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        
        setRentals(rentalsWithCars);
      } catch (error) {
        console.error("Siparişler çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!userChecked || loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 font-medium text-gray-500">Siparişleriniz yükleniyor...</p>
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

        {rentals.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-lg">
            <Search className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <p className="text-xl font-medium text-gray-900">Henüz hiç araç kiralamadınız.</p>
            <p className="mt-2 text-gray-500">Araçlarımızı keşfetmek için hemen kataloğa göz atın.</p>
            <button 
              onClick={() => router.push('/cars')}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Car className="h-5 w-5" />
              Araçları Keşfet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {rentals.map((rental) => (
              <div key={rental.id} className="overflow-hidden rounded-3xl bg-white shadow-lg border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="grid md:grid-cols-4 gap-6 p-6">
                  {/* Araç Görseli */}
                  <div className="col-span-1 h-32 md:h-full bg-gray-200 rounded-xl overflow-hidden">
                    {rental.carDetails ? (
                      <img src={rental.carDetails.image} alt={rental.carDetails.brand} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">Görsel Yok</div>
                    )}
                  </div>
                  
                  {/* Araç ve Tarih Detayları */}
                  <div className="col-span-2 flex flex-col justify-center">
                    {rental.carDetails ? (
                      <>
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{rental.carDetails.brand} {rental.carDetails.model}</h2>
                        <p className="mt-1 text-sm font-medium text-slate-500">{rental.carDetails.year} • {rental.carDetails.fuel} • {rental.carDetails.transmission}</p>
                      </>
                    ) : (
                      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Bilinmeyen Araç</h2>
                    )}
                    
                    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700">
                      <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100 shadow-sm">
                        <span className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Alış Tarihi
                        </span>
                        {rental.startDate}
                      </div>
                      <span className="text-slate-300">&rarr;</span>
                      <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100 shadow-sm">
                        <span className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          Teslim Tarihi
                        </span>
                        {rental.endDate}
                      </div>
                    </div>
                  </div>
                  
                  {/* Fiyat ve Durum */}
                  <div className="col-span-1 flex flex-col items-start md:items-end justify-center border-t border-gray-100 pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                    <p className="text-sm text-gray-500 mb-1">Toplam Tutar</p>
                    <p className="text-3xl font-extrabold text-blue-700 mb-4">₺{rental.totalPrice}</p>
                    
                    {rental.status === "onay_bekliyor" ? (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
                        <span className="mr-2 h-2 w-2 rounded-full bg-orange-500"></span>
                        Onay Bekliyor
                      </span>
                    ) : rental.status === "aktif" ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                        Onaylandı / Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
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
