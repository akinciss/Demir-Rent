"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import type { Car } from "@/types/car";
import CarCard from "@/components/CarCard";

export default function CarsPage() {
  const [carList, setCarList] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre State'leri
  const [filterType, setFilterType] = useState<string>("Tümü");
  const [filterCapacity, setFilterCapacity] = useState<string>("Tümü");
  const [maxBudget, setMaxBudget] = useState<number>(10000);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const carsCollectionRef = collection(db, "cars");
        const querySnapshot = await getDocs(carsCollectionRef);

        const defaultTypes = ["Sedan", "SUV", "Hatchback"];
        
        const fetchedCars = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Eğer Firestore'da yoksa varsayılan değerleri ata
          const type = data.type || defaultTypes[Math.floor(Math.random() * defaultTypes.length)];
          const capacity = data.capacity || data.seats || (Math.random() > 0.5 ? 5 : 4);
          const isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
          
          return {
            id: doc.id,
            ...data,
            type,
            capacity,
            isAvailable
          } as Car;
        });
        setCarList(fetchedCars);
      } catch (error) {
        console.error("Araçları çekerken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <main className="bg-[#F7F5F0] pb-20 min-h-screen">
      <section className="mx-auto max-w-7xl px-6 mt-10">
        <div className="mb-10 rounded-3xl bg-white p-10 shadow-sm border border-stone-200">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-light tracking-tight text-stone-800">
              Göz alıcı araba seçenekleri
            </h1>
            <p className="mt-4 text-lg font-light text-stone-500">
              Herkes için açık bir galeri. Beğendiğiniz aracı seçin, hemen kiralamaya başlayın.
            </p>
          </div>
        </div>

        {/* FİLTRELEME PANELİ */}
        {!loading && carList.length > 0 && (
          <div className="mb-10 rounded-3xl bg-white p-6 shadow-md border border-slate-100 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-700 mb-2">Araç Tipi</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Tümü">Tümü</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
            
            <div className="flex-1 w-full">
              <label className="block text-sm font-bold text-gray-700 mb-2">Kişi Sayısı</label>
              <select 
                value={filterCapacity} 
                onChange={(e) => setFilterCapacity(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Tümü">Tümü</option>
                <option value="4 Kişilik">4 Kişilik</option>
                <option value="5 Kişilik">5 Kişilik</option>
                <option value="7+ Kişilik">7+ Kişilik</option>
              </select>
            </div>
            
            <div className="flex-1 w-full">
              <label className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                <span>Maksimum Bütçe</span>
                <span className="text-blue-600">₺{maxBudget}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="15000" 
                step="500"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            
            <div className="flex-1 w-full flex items-center h-[50px]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-gray-700">Sadece Kiralamaya Uygun Olanlar</span>
              </label>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : carList.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-lg">
            <h3 className="text-xl font-bold text-gray-900">
              Henüz araç yüklenmedi
            </h3>
            <p className="mt-2 text-gray-500">
              Veritabanında gösterilecek araç bulunamadı. Lütfen ana sayfadan veri yüklemesi yapın.
            </p>
          </div>
        ) : (() => {
          // Filtreleme Mantığı
          const filteredCars = carList.filter(car => {
            const typeMatch = filterType === "Tümü" || car.type === filterType;
            
            const capStr = filterCapacity === "Tümü" ? "Tümü" : 
                           filterCapacity === "4 Kişilik" ? 4 : 
                           filterCapacity === "5 Kişilik" ? 5 : 7;
                           
            const capacityMatch = filterCapacity === "Tümü" || 
                                  (capStr === 7 ? (car.capacity || 0) >= 7 : (car.capacity === capStr));
            
            const budgetMatch = car.pricePerDay <= maxBudget;
            const availabilityMatch = !onlyAvailable || car.isAvailable;
          
            return typeMatch && capacityMatch && budgetMatch && availabilityMatch;
          });

          if (filteredCars.length === 0) {
            return (
              <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-lg">
                <h3 className="text-xl font-bold text-gray-900">
                  Aradığınız kriterlere uygun araç bulunamadı.
                </h3>
                <p className="mt-2 text-gray-500">
                  Lütfen filtreleri değiştirerek tekrar deneyin.
                </p>
                <button 
                  onClick={() => {
                    setFilterType("Tümü");
                    setFilterCapacity("Tümü");
                    setMaxBudget(10000);
                    setOnlyAvailable(false);
                  }}
                  className="mt-6 rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  Filtreleri Temizle
                </button>
              </div>
            );
          }

          return (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredCars.map((car) => (
                <CarCard
                  key={car.id}
                  id={car.id}
                  brand={car.brand}
                  model={car.model}
                  year={car.year}
                  fuel={car.fuel}
                  transmission={car.transmission}
                  pricePerDay={car.pricePerDay}
                  image={car.image}
                />
              ))}
            </div>
          );
        })()}
      </section>
    </main>
  );
}
