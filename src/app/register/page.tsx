"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase"; 
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!auth) {
        setError("Sistem şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
        toast.error("Sistem şu an kullanılamıyor.");
        setLoading(false);
        return;
      }
      console.log("1. Firebase kayıt isteği gönderiliyor...", email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("2. Firebase kayıt başarılı! Kullanıcı:", userCredential.user);
      router.push("/login");
      toast.success("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");

    } catch (err: unknown) {
      console.error("Kayıt sırasında hata yakalandı:", err);
      if (err instanceof FirebaseError) {
        const code = err.code;
        if (code === "auth/email-already-in-use") {
          setError("Bu e-posta adresi zaten kullanımda! Lütfen başka bir e-posta deneyin.");
          toast.error("Bu e-posta adresi zaten kullanımda");
        } else if (code === "auth/weak-password") {
          setError("Şifre çok zayıf. En az 6 karakter olmalıdır.");
          toast.error("Şifre çok zayıf");
        } else if (code === "auth/invalid-email") {
          setError("Geçersiz bir e-posta adresi girdiniz.");
          toast.error("Geçersiz e-posta");
        } else {
          setError(err.message);
          toast.error(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        const s = String(err);
        setError(s);
        toast.error(s);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-gray-800 tracking-tight">
          Kayıt Ol
        </h2>
        
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ornek@mail.com"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </button>
        </form>
      </div>
    </div>
  );
}