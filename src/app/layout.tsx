import "./globals.css";
import Navbar from "@/components/Navbar";
import ToasterProvider from "@/components/ToasterProvider";
import React from "react";
import { validateFirebaseConfig } from "@/lib/config";

export const metadata = {
  title: "Demir Rent — Zarif Bir Sürüş Deneyimi",
  description: "Premium araç kiralama platformu. Seçkin koleksiyon, şeffaf fiyatlandırma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebaseOk = validateFirebaseConfig().ok;

  if (!firebaseOk) {
    return (
      <html lang="tr">
        <body className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
          <main className="prose text-center">
            <h1>Sistem bakımda</h1>
            <p>Şu anda sistemsel bir sorun var veya yapılandırma eksik. Lütfen daha sonra tekrar deneyin.</p>
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="tr">
      <body className="min-h-screen" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
        <Navbar />
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
