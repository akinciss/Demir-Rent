"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ShieldCheck, PlusCircle, CheckCircle, RefreshCcw, Settings } from "lucide-react";
import type { Rental } from "@/types/car";

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "eyleniyoruz.test01@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  // --- Section A: Add Car State ---
  const [carData, setCarData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    fuel: "Benzin",
    transmission: "Otomatik",
    pricePerDay: 0,
    image: "",
    seats: 5
  });
  const [isAdding, setIsAdding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // --- Section B: Rentals List State ---
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);

  const fetchPendingRentals = async () => {
    try {
      setLoadingRentals(true);
      const q = query(collection(db, "rentals"), where("status", "==", "onay_bekliyor"));
      const querySnapshot = await getDocs(q);
      const pendingRentals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Rental[];
      
      setRentals(pendingRentals);
    } catch (error) {
      console.error("Kiralama talepleri çekilemedi:", error);
    } finally {
      setLoadingRentals(false);
    }
  };

  useEffect(() => {
    fetchPendingRentals();
  }, []);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addDoc(collection(db, "cars"), {
        brand: carData.brand,
        model: carData.model,
        year: Number(carData.year),
        fuel: carData.fuel,
        transmission: carData.transmission,
        pricePerDay: Number(carData.pricePerDay),
        image: carData.image,
        seats: Number(carData.seats)
      });
      setSuccessMsg("Araç başarıyla eklendi!");
      setCarData({
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        fuel: "Benzin",
        transmission: "Otomatik",
        pricePerDay: 0,
        image: "",
        seats: 5
      });
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error("Araç ekleme hatası:", error);
      alert("Araç eklenirken bir hata oluştu.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleApprove = async (rentalId: string) => {
    try {
      const rentalRef = doc(db, "rentals", rentalId);
      await updateDoc(rentalRef, {
        status: "aktif"
      });
      // Onaylanan aracı listeden anında çıkar
      setRentals(prev => prev.filter(r => r.id !== rentalId));
      alert("Kiralama başarıyla onaylandı!");
    } catch (error) {
      console.error("Onaylama hatası:", error);
      alert("Onaylanırken hata oluştu.");
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center max-w-lg shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-red-700">Erişim Reddedildi</h2>
            <p className="text-red-600 font-medium">Bu sayfaya erişim yetkiniz yoktur! Yönlendiriliyorsunuz...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F5F0] pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-stone-800" />
          <h1 className="text-3xl font-light text-stone-800 tracking-tight">Yönetim Paneli</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* BÖLÜM A: Yeni Araç Ekleme Formu */}
          <div className="rounded-3xl bg-white p-8 shadow-lg border border-slate-100">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <PlusCircle className="h-6 w-6 text-blue-600" />
              Yeni Araç Ekle
            </h2>
            
            <form onSubmit={handleAddCar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Marka</label>
                  <input required type="text" className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500" value={carData.brand} onChange={e => setCarData({...carData, brand: e.target.value})} placeholder="Örn: BMW" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Model</label>
                  <input required type="text" className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500" value={carData.model} onChange={e => setCarData({...carData, model: e.target.value})} placeholder="Örn: 320i" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Yıl</label>
                  <input required type="number" className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500" value={carData.year} onChange={e => setCarData({...carData, year: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Günlük Fiyat (₺)</label>
                  <input required type="number" className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500" value={carData.pricePerDay || ""} onChange={e => setCarData({...carData, pricePerDay: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Yakıt Tipi</label>
                  <select className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500" value={carData.fuel} onChange={e => setCarData({...carData, fuel: e.target.value})}>
                    <option value="Benzin">Benzin</option>
                    <option value="Dizel">Dizel</option>
                    <option value="Elektrik">Elektrik</option>
                    <option value="Hibrit">Hibrit</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-700">Vites Tipi</label>
                  <select className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500" value={carData.transmission} onChange={e => setCarData({...carData, transmission: e.target.value})}>
                    <option value="Otomatik">Otomatik</option>
                    <option value="Manuel">Manuel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Görsel URL (imageUrl)</label>
                <input required type="url" className="w-full rounded-xl border border-gray-300 p-3 text-gray-900 outline-none focus:border-blue-500" value={carData.image} onChange={e => setCarData({...carData, image: e.target.value})} placeholder="https://images.unsplash.com/..." />
              </div>

              <button 
                type="submit" 
                disabled={isAdding}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              >
                <PlusCircle className="h-5 w-5" />
                {isAdding ? "Ekleniyor..." : "Aracı Veritabanına Ekle"}
              </button>
              
              {successMsg && (
                <div className="mt-4 rounded-xl bg-green-50 p-4 text-center font-medium text-green-700 border border-green-200">
                  {successMsg}
                </div>
              )}
            </form>
          </div>

          {/* BÖLÜM B: Kiralama Onay Listesi */}
          <div className="rounded-3xl bg-white p-8 shadow-lg border border-slate-100 flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                Bekleyen Ödemeler
              </h2>
              <button onClick={fetchPendingRentals} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-indigo-600 transition">
                <RefreshCcw className="h-4 w-4" />
                Yenile
              </button>
            </div>

            {loadingRentals ? (
              <div className="flex flex-1 items-center justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : rentals.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
                <p className="text-gray-500">Onay bekleyen kiralama talebi yok.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-2" style={{ maxHeight: '500px' }}>
                {rentals.map(rental => (
                  <div key={rental.id} className="rounded-xl border border-gray-200 p-5 transition hover:border-blue-300 hover:shadow-md">
                    <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="block text-xs font-semibold text-gray-400">Kullanıcı ID</span> 
                        <span className="font-mono text-gray-800">{rental.userId.substring(0, 10)}...</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-gray-400">Araç ID</span> 
                        <span className="font-mono text-gray-800">{rental.carId.substring(0, 10)}...</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-xs font-semibold text-gray-400">Tarih Aralığı</span> 
                        <span className="text-gray-800">{rental.startDate} &rarr; {rental.endDate}</span>
                      </div>
                      <div className="col-span-2 flex justify-between items-center bg-blue-50 p-3 rounded-lg mt-1">
                        <span className="font-semibold text-blue-900">Toplam Tutar:</span> 
                        <span className="font-extrabold text-blue-700 text-lg">₺{rental.totalPrice}</span>
                      </div>
                      {rental.receiptInfo && (
                        <div className="col-span-2 mt-2 bg-gray-50 border border-gray-200 p-3 rounded-lg">
                          <span className="block text-xs font-semibold text-gray-500 mb-1">Dekont / Referans Bilgisi</span>
                          <span className="font-medium text-gray-900 break-all">{rental.receiptInfo}</span>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleApprove(rental.id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Kiralama ve Ödemeyi Onayla
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
