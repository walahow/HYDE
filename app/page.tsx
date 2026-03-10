"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, ChevronRight, FileText } from "lucide-react";
import TopNavbar from "@/components/ui/TopNavbar";
import DestinationCard from "@/components/ui/DestinationCard";
import { destinations } from "@/lib/dummy-data";
import type { UserProfile } from "@/lib/types";
import Lenis from "lenis";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import { cn } from "@/lib/utils";

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
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD + K or CTRL + K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      eventsTarget: window,
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
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-white">
      {/* Background Interactive Grid */}
      <InteractiveBackground />


      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <div className="pointer-events-auto shrink-0">
          <TopNavbar user={currentUser} />
        </div>

        {/* Search Header Container - Constrained Width */}
        <div className="pointer-events-auto mx-auto w-full max-w-5xl px-6 pt-10 pb-2 shrink-0">
          {/* Search bar Area */}
          <div className="relative mb-6 inline-block w-full">
            {/* Custom borders for extended intersecting lines on the search bar */}
            {/* Top border: more overshoot left (top-left), less right (top-right) */}
            <div className="absolute top-0 -left-4 -right-2 h-px bg-zinc-300 z-10" />
            {/* Left border: more overshoot top (top-left), less bottom (bottom-left) */}
            <div className="absolute -top-4 -bottom-2 left-0 w-px bg-zinc-300 z-10" />

            {/* Right border: less overshoot top (top-right), more bottom (bottom-right) */}
            <div className="absolute -top-2 -bottom-4 right-0 w-px bg-zinc-300 z-10" />
            {/* Bottom border: less overshoot left (bottom-left), more right (bottom-right) */}
            <div className="absolute bottom-0 -left-2 -right-4 h-px bg-zinc-300 z-10" />

            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full relative z-0 rounded-none bg-white py-3 pl-4 pr-4 text-base text-zinc-900 shadow-sm focus:outline-none focus:bg-zinc-50 transition-colors font-mono font-light"
            />
            {/* Custom placeholder overlay with animation */}
            {!query && (
              <div
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10 font-mono font-light text-base flex items-center"
                aria-hidden="true"
              >
                [ ⌘K ] | &gt; SEARCH DESTINATION
                <span className="animate-terminal-blink ml-1">_</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">
              {filtered.length} TUJUAN TERSEDIA
            </span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
        </div >

        {/* Full-width Cards Container Area - Drives Horizontal Scrolling */}
        {
          filtered.length === 0 ? (
            <div className="pointer-events-none flex-1 flex flex-col items-center pt-16">
              <div className="pointer-events-auto flex flex-col items-center">
                <FileText size={40} className="mb-3 text-zinc-300" />
                <p className="text-sm text-zinc-500">
                  Tidak ada tujuan yang cocok dengan pencarian Anda.
                </p>
              </div>
            </div>
          ) : (
            <div
              ref={wrapperRef}
              className="pointer-events-none flex-1 w-full overflow-hidden self-stretch pb-4 pt-16"
            >
              {/* This content ref holds the wide array of cards and physically scrolls left/right. Aligned to bottom to use more space. */}
              <div
                ref={contentRef}
                className="flex flex-nowrap h-full items-center gap-16 px-[10vw] sm:px-24 xl:px-32 pr-[30vw] w-max pb-2"
              >
                {filtered.map((dest) => (
                  <div key={dest.id} className="pointer-events-auto shrink-0 group">
                    <DestinationCard
                      id={dest.id}
                      categoryCode={dest.categoryCode}
                      name={dest.name}
                      faculty={dest.faculty}
                      documentCount={dest.documentCount}
                      status={dest.status}
                      acceptedDocuments={dest.acceptedDocuments}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}
