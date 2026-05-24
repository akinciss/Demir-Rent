import "./globals.css";
import Navbar from "@/components/Navbar";
import ToasterProvider from "@/components/ToasterProvider";
import React from "react";

export const metadata = {
  title: "Demir Rent — Zarif Bir Sürüş Deneyimi",
  description: "Premium araç kiralama platformu. Seçkin koleksiyon, şeffaf fiyatlandırma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Firebase config eksik olsa bile layout'u render et.
  // Demo mode kontrolü repository/hook seviyesinde yapılır.
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
