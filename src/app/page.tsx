"use client";

import { useEffect, useState } from "react";
import CarCard from "../components/CarCard";
import { db } from "../lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { cars as dummyCars } from "../data/cars";
import type { Car } from "../types/car";

export default function HomePage() {
  const [carList, setCarList] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Sadece Firestore'dan veri çeken fonksiyon
  const fetchCars = async () => {
    try {
      setLoading(true);
      const carsCollectionRef = collection(db, "cars");
      const querySnapshot = await getDocs(carsCollectionRef);

      const fetchedCars = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }) as Car);
      setCarList(fetchedCars);
    } catch (error) {
      console.error("Araçları çekerken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Geçici veritabanı doldurma fonksiyonu (Buton ile çalışacak)
  const handleSeedDatabase = async () => {
    try {
      const carsCollectionRef = collection(db, "cars");
      for (const car of dummyCars) {
        const carDocRef = doc(carsCollectionRef, car.id.toString());
        await setDoc(carDocRef, car);
      }
      alert("Veriler Firestore'a başarıyla yüklendi!");
      // Yüklendikten sonra güncel listeyi çek
      fetchCars();
    } catch (error) {
      console.error("Veri yükleme hatası:", error);
      alert("Veri yüklenirken bir hata oluştu.");
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F0] pb-20">
      {/* Geçici Veri Yükleme Alanı */}
      <div className="bg-stone-200/50 px-4 py-2 text-center border-b border-stone-200 flex justify-center items-center gap-4">
        <p className="text-xs font-medium text-stone-600">
          Geliştirici Modu: Eğer araç listesi boşsa butona tıklayarak varsayılan verileri veritabanına ekleyebilirsiniz.
        </p>
        <button
          onClick={handleSeedDatabase}
          className="rounded-full border border-stone-400 bg-transparent px-4 py-1 text-xs font-medium text-stone-600 transition-colors duration-500 hover:bg-stone-300 hover:text-stone-800"
        >
          Verileri Yükle
        </button>
      </div>

      <section className="bg-[#F7F5F0] text-stone-900 border-b border-stone-200">
        <div className="mx-auto max-w-5xl px-6 py-32 text-center flex flex-col items-center">
          <h1 className="max-w-4xl text-5xl md:text-7xl font-light tracking-tight leading-tight text-stone-800">
            Zarif bir sürüş deneyimi
          </h1>

          <p className="mt-8 max-w-xl text-lg font-light text-stone-500 leading-relaxed">
            Minimalist tasarımımız ve üstün kalite anlayışımızla tanışın. Size en uygun butik aracı saniyeler içinde keşfedin.
          </p>

          <button className="mt-12 rounded-full border border-stone-800 bg-transparent px-10 py-3.5 text-sm font-medium tracking-wide text-stone-800 transition-colors duration-500 hover:bg-stone-800 hover:text-[#F7F5F0]">
            Koleksiyonu İncele
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : carList.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">
              Henüz araç yüklenmedi
            </h3>
            <p className="mt-2 text-gray-500">
              Veritabanında (Firestore) gösterilecek araç bulunamadı. Lütfen yukarıdaki butonu kullanarak verileri yükleyin.
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            
            {/* 1. Kategori: Son Eklenen Araçlar */}
            <div>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-light tracking-tight text-stone-800">Son Eklenen Araçlar</h2>
                <p className="mt-2 text-md font-light text-stone-500">Koleksiyonumuzun en yeni üyeleriyle tanışın.</p>
              </div>
              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-8 pb-8 scrollbar-hide px-2">
                {carList.slice(0, 3).map((car) => (
                  <div key={car.id} className="w-[320px] shrink-0 snap-center">
                    <CarCard {...car} />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Kategori: Hafta Sonuna Özel Fiyatlar */}
            <div>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-light tracking-tight text-stone-800">Hafta Sonuna Özel</h2>
                <p className="mt-2 text-md font-light text-stone-500">Kısa süreliğine muhteşem fırsatları yakalayın.</p>
              </div>
              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-8 pb-8 scrollbar-hide px-2">
                {carList.slice(3, 6).map((car) => (
                  <div key={car.id} className="w-[320px] shrink-0 snap-center">
                    <CarCard {...car} />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Kategori: İndirimli Araçlar */}
            <div>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-light tracking-tight text-stone-800">Seçkin Araçlar</h2>
                <p className="mt-2 text-md font-light text-stone-500">Uzun dönem veya butik sürüş keyfi arayanlara.</p>
              </div>
              <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-8 pb-8 scrollbar-hide px-2">
                {carList.slice(6, 9).map((car) => (
                  <div key={car.id} className="w-[320px] shrink-0 snap-center">
                    <CarCard {...car} />
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
      </section>
    </main>
  );
}
