import "./globals.css";
import Navbar from "@/components/Navbar";
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
  return (
    <html lang="tr">
      <body className="min-h-screen" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
