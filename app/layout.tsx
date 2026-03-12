import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HYDE – Hybrid Document",
  description: "Sistem manajemen dokumen akademik HYDE — kirim dan kelola dokumen akademik Anda secara digital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preload" href="/img/dither_shadow.png" as="image" />
      </head>
      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
