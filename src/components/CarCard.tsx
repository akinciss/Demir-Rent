"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Key } from "lucide-react";

type CarCardProps = {
  id?: string | number;
  brand: string;
  model: string;
  year: number;
  fuel: string;
  transmission: string;
  pricePerDay: number;
  image: string;
};

export default function CarCard({
  id,
  brand,
  model,
  year,
  fuel,
  transmission,
  pricePerDay,
  image,
}: CarCardProps) {
  const [userLoaded, setUserLoaded] = useState(false);
  const router = useRouter();

  console.log("CarCard bileşenine ulaşan araç verisi:", { id, brand, model });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setUserLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const handleRent = () => {
    if (auth.currentUser) {
      if (id) {
        router.push(`/rent/${id}`);
      } else {
        alert("Araç ID'si bulunamadı.");
      }
      return;
    }

    router.push("/login");
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-stone-200 flex flex-col h-full">
      <div className="h-56 w-full bg-stone-100 shrink-0">
        <img src={image} alt={brand} className="h-full w-full object-cover" />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-stone-800">{brand}</h2>
            <p className="mt-1 text-sm text-stone-500">{model}</p>
          </div>
          <span className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600">
            {year}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-600">
          <div className="rounded-lg bg-stone-50 border border-stone-100 px-3 py-2">{fuel}</div>
          <div className="rounded-lg bg-stone-50 border border-stone-100 px-3 py-2">{transmission}</div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-stone-100">
          <div>
            <p className="text-xs uppercase tracking-wider text-stone-400">Günlük Fiyat</p>
            <h3 className="text-2xl font-semibold text-stone-800">₺{pricePerDay}</h3>
          </div>
          <button
            onClick={handleRent}
            className="flex items-center gap-2 rounded-xl bg-stone-800 px-6 py-3 text-sm font-medium text-[#F7F5F0] transition-colors duration-500 hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!userLoaded && !auth.currentUser}
          >
            <Key className="h-4 w-4" />
            Kirala
          </button>
        </div>
      </div>
    </div>
  );
}
