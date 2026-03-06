"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Building2, ChevronRight, FileText } from "lucide-react";
import TopNavbar from "@/components/ui/TopNavbar";
import DestinationCard from "@/components/ui/DestinationCard";
import { destinations } from "@/lib/dummy-data";
import type { UserProfile } from "@/lib/types";
import Lenis from "lenis";

const currentUser: UserProfile = {
  name: "Ahmad Fauzan",
  nim: "H1101221001",
  role: "mahasiswa",
  institution: "Universitas Lambung Mangkurat",
};

export default function DashboardMahasiswaPage() {
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filtered = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.faculty.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      orientation: "horizontal",
      gestureOrientation: "vertical", // Map vertical scroll to horizontal
      smoothWheel: true,
      lerp: 0.1,
    });

    // We don't need requestAnimationFrame unless we're hooking into a global loop
    // Lenis creates its own internal loop by default when not passed a custom requestAnimationFrame,
    // but the recommended way is to run it on every frame explicitly.
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#f5f5f7]">
      <TopNavbar user={currentUser} />

      {/* Search Header Container - Constrained Width */}
      <div className="mx-auto w-full max-w-5xl px-6 pt-6 pb-2 shrink-0">
        {/* Search bar Area */}
        <div className="relative mb-6 pb-2 pr-2 inline-block w-full">
          {/* Custom borders for extended intersecting lines on the search bar */}
          <div className="absolute top-0 left-0 right-2 h-px bg-blue-200" />
          <div className="absolute top-0 bottom-2 left-0 w-px bg-blue-200" />
          {/* Right border extending down */}
          <div className="absolute top-0 bottom-0 right-2 w-px bg-blue-300" />
          {/* Bottom border extending right */}
          <div className="absolute bottom-2 right-0 left-0 h-px bg-blue-300" />
          {/* Intersection point */}
          <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-blue-500 z-20 translate-x-1/2 translate-y-1/2" />

          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-[calc(50%+4px)] text-blue-400 z-10"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mau kirim dokumen ke mana hari ini? (misal: Fakultas, Prodi, LPPM)"
            className="w-full relative z-0 rounded-none bg-white py-3 pl-12 pr-4 text-base text-blue-950 shadow-sm placeholder:text-blue-400/70 focus:outline-none focus:bg-blue-50/50 transition-colors"
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs font-medium text-zinc-400">
            {filtered.length} tujuan tersedia
          </span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>
      </div>

      {/* Full-width Cards Container Area - Drives Horizontal Scrolling */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center pt-16">
          <FileText size={40} className="mb-3 text-zinc-300" />
          <p className="text-sm text-zinc-500">
            Tidak ada tujuan yang cocok dengan pencarian Anda.
          </p>
        </div>
      ) : (
        <div
          ref={wrapperRef}
          className="flex-1 w-full overflow-hidden self-stretch pb-4 pt-16"
        >
          {/* This content ref holds the wide array of cards and physically scrolls left/right. Aligned to bottom to use more space. */}
          <div
            ref={contentRef}
            className="flex flex-nowrap h-full items-end gap-6 px-[10vw] sm:px-24 xl:px-32 pr-[30vw] w-max pb-2"
          >
            {filtered.map((dest) => (
              <DestinationCard
                key={dest.id}
                id={dest.id}
                name={dest.name}
                faculty={dest.faculty}
                documentCount={dest.documentCount}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
