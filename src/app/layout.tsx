import "./globals.css";
import Navbar from "@/components/Navbar";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-[#F7F5F0] text-stone-900">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
