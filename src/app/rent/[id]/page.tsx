"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import type { Car } from "@/types/car";
import { CreditCard, ShieldCheck } from "lucide-react";

export default function RentPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState("");

  // Kullanıcı giriş yapmamışsa login'e yönlendir
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Firestore'dan o anki arabanın verisini çek
  useEffect(() => {
    const fetchCar = async () => {
      if (!params.id) return;
      
      try {
        const carDocRef = doc(db, "cars", params.id as string);
        const carSnapshot = await getDoc(carDocRef);

        if (carSnapshot.exists()) {
          setCar({ id: carSnapshot.id, ...carSnapshot.data() } as Car);
        } else {
          console.error("Araç bulunamadı!");
        }
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [params.id]);

  // Tarihlere göre toplam tutarı hesapla
  useEffect(() => {
    if (startDate && endDate && car) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      
      // Aynı gün seçilirse en az 1 gün say
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      
      // Bitiş tarihi başlangıçtan önce değilse hesapla
      if (diffTime >= 0) {
        setTotalPrice(diffDays * car.pricePerDay);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [startDate, endDate, car]);

  const handleConfirmRent = async () => {
    if (!auth.currentUser) return;
    if (!startDate || !endDate || totalPrice <= 0 || !receiptInfo.trim()) return;

    setIsSubmitting(true);

    try {
      const rentalsCollectionRef = collection(db, "rentals");
      await addDoc(rentalsCollectionRef, {
        userId: auth.currentUser.uid,
        carId: params.id,
        startDate,
        endDate,
        totalPrice,
        receiptInfo,
        status: "onay_bekliyor",
        createdAt: new Date().toISOString()
      });

      // İşlem başarılı olunca 2 saniye bekleyip anasayfaya at
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Kiralama hatası:", error);
      alert("Kiralama sırasında bir hata oluştu.");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 font-medium text-gray-500">Yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!car) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-xl text-gray-500">Araç bulunamadı.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] pb-20">
      <div className="mx-auto max-w-4xl px-6 pt-10">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-stone-200">
          <div className="grid md:grid-cols-2">
            {/* Araba Görseli */}
            <div className="h-64 bg-gray-200 md:h-full">
              <img src={car.image} alt={car.brand} className="h-full w-full object-cover" />
            </div>

            {/* Kiralama Detayları */}
            <div className="p-8 lg:p-12">
              <div className="mb-6 border-b border-gray-100 pb-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{car.brand} {car.model}</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                  <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">{car.year}</span>
                  <span>{car.fuel}</span>
                  <span>{car.transmission}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Alış Tarihi</label>
                  <input 
                    type="date" 
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Teslim Tarihi</label>
                  <input 
                    type="date" 
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="mt-6 rounded-2xl bg-blue-50 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Günlük Fiyat</span>
                    <span className="font-semibold text-gray-900">₺{car.pricePerDay}</span>
                  </div>
                  <div className="my-4 border-t border-blue-100"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Toplam Tutar</span>
                    <span className="text-3xl font-extrabold text-blue-700">
                      {totalPrice > 0 ? `₺${totalPrice}` : "-"}
                    </span>
                  </div>
                  
                  {totalPrice > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="rounded-xl bg-white p-4 shadow-sm border border-blue-100">
                        <h4 className="font-semibold text-gray-900 mb-2">Banka Havalesi / EFT Bilgileri</h4>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Şirket Adı:</span> Premium Rent A Car A.Ş.</p>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-800">Banka:</span> Garanti BBVA</p>
                        <p className="text-sm font-mono text-gray-800 font-medium">TR12 3456 7890 0000 0000 00</p>
                        <p className="mt-2 text-xs text-yellow-600">Lütfen açıklamaya araç modelini yazmayı unutmayınız.</p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Gönderici Ad Soyad / Dekont Referans No <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          required
                          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          value={receiptInfo}
                          onChange={(e) => setReceiptInfo(e.target.value)}
                          placeholder="Örn: Ahmet Yılmaz - REF12345"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleConfirmRent}
                  disabled={!startDate || !endDate || totalPrice <= 0 || !receiptInfo.trim() || isSubmitting}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  <CreditCard className="h-5 w-5" />
                  {isSubmitting ? "Ödeme Bildirimi Alındı! Yönlendiriliyorsunuz..." : "Ödeme Bildirimi Yap (Dekont)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
