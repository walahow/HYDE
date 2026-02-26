"use client";

import { useState } from "react";
import { Search, ArrowRight, Building2, ChevronRight, FileText } from "lucide-react";
import TopNavbar from "@/components/ui/TopNavbar";
import PageLayout from "@/components/ui/PageLayout";
import HoverCard from "@/components/ui/HoverCard";
import { destinations } from "@/lib/dummy-data";
import type { UserProfile } from "@/lib/types";

const currentUser: UserProfile = {
  name: "Ahmad Fauzan",
  nim: "H1101221001",
  role: "mahasiswa",
  institution: "Universitas Lambung Mangkurat",
};

export default function DashboardMahasiswaPage() {
  const [query, setQuery] = useState("");

  const filtered = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.faculty.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <TopNavbar user={currentUser} />
      <PageLayout>
        {/* Hero header */}
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Mau kirim dokumen ke mana hari ini?
          </h1>
        </div>

        {/* Search bar */}
        <div className="relative mb-8">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tujuan... (misal: Fakultas, Prodi, LPPM)"
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
          />
        </div>

        {/* Divider */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs font-medium text-zinc-400">
            {filtered.length} tujuan tersedia
          </span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {/* Destination cards */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="text-sm text-zinc-500">
              Tidak ada tujuan yang cocok dengan pencarian Anda.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((dest) => (
              <HoverCard key={dest.id}>
                <div className="flex items-center justify-between px-5 py-4">
                  {/* Left: icon + info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                      <Building2 size={18} className="text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        {dest.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {dest.faculty} &middot; {dest.documentCount} dokumen aktif
                      </p>
                    </div>
                  </div>

                  {/* Right: CTA button */}
                  <button className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md">
                    Informasi Lebih Lanjut
                    <ChevronRight size={13} />
                  </button>
                </div>
              </HoverCard>
            ))}
          </div>
        )}
      </PageLayout>
    </>
  );
}
