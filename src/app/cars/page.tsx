"use client";

import { useState } from "react";
import CarCard from "@/components/CarCard";
import { useCars } from "@/hooks/useCars";
import { carService } from "@/services/carService";

export default function CarsPage() {
  const { cars: carList, loading, error } = useCars();

  // Filtre State'leri
  const [filterType, setFilterType] = useState<string>("Tümü");
  const [filterCapacity, setFilterCapacity] = useState<string>("Tümü");
  const [maxBudget, setMaxBudget] = useState<number>(10000);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

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
        {!loading && !error && carList.length > 0 && (
          <div className="mb-10 rounded-3xl bg-white p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-stone-700 mb-2">Araç Tipi</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-stone-400 transition-colors text-stone-700"
              >
                <option value="Tümü">Tümü</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
            
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-stone-700 mb-2">Kişi Sayısı</label>
              <select 
                value={filterCapacity} 
                onChange={(e) => setFilterCapacity(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 outline-none focus:border-stone-400 transition-colors text-stone-700"
              >
                <option value="Tümü">Tümü</option>
                <option value="4 Kişilik">4 Kişilik</option>
                <option value="5 Kişilik">5 Kişilik</option>
                <option value="7+ Kişilik">7+ Kişilik</option>
              </select>
            </div>
            
            <div className="flex-1 w-full">
              <label className="flex justify-between text-sm font-medium text-stone-700 mb-2">
                <span>Maksimum Bütçe</span>
                <span className="text-stone-900 font-semibold">₺{maxBudget}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="15000" 
                step="500"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
              />
            </div>
            
            <div className="flex-1 w-full flex items-center h-[50px]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-5 h-5 rounded border-stone-300 text-stone-800 focus:ring-stone-500 cursor-pointer accent-stone-800"
                />
                <span className="text-sm font-medium text-stone-700">Sadece Kiralamaya Uygun Olanlar</span>
              </label>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-stone-800 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-16 text-center shadow-sm">
            <h3 className="text-xl font-medium text-red-800">{error}</h3>
          </div>
        ) : carList.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-16 text-center shadow-sm">
            <h3 className="text-xl font-medium text-stone-900">
              Henüz araç yüklenmedi
            </h3>
            <p className="mt-2 text-stone-500">
              Veritabanında gösterilecek araç bulunamadı.
            </p>
          </div>
        ) : (() => {
          // Servis üzerinden filtreleme Mantığı
          const filteredCars = carService.filterCars(carList, {
            type: filterType,
            capacity: filterCapacity,
            maxBudget,
            onlyAvailable
          });

          if (filteredCars.length === 0) {
            return (
              <div className="rounded-3xl border border-stone-200 bg-white p-16 text-center shadow-sm">
                <h3 className="text-xl font-medium text-stone-900">
                  Aradığınız kriterlere uygun araç bulunamadı.
                </h3>
                <p className="mt-2 text-stone-500">
                  Lütfen filtreleri değiştirerek tekrar deneyin.
                </p>
                <button 
                  onClick={() => {
                    setFilterType("Tümü");
                    setFilterCapacity("Tümü");
                    setMaxBudget(10000);
                    setOnlyAvailable(false);
                  }}
                  className="mt-6 rounded-full border border-stone-800 bg-transparent px-6 py-2.5 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-800 hover:text-[#F7F5F0]"
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
                  type={car.type}
                  capacity={car.capacity}
                  isAvailable={car.isActive !== false}
                />
              ))}
            </div>
          );
        })()}
      </section>
    </main>
  );
}
