"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Fingerprint } from "lucide-react";
import TopNavbar from "@/components/ui/TopNavbar";
import DestinationCard from "@/components/ui/DestinationCard";
import { useSession } from "next-auth/react";
import Lenis from "lenis";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";

interface Destination {
  id: string;
  name: string;
  destinationName: string | null;
  categoryCode: string | null;
  acceptedDocuments: string[];
  isOpen: boolean | null;
}

// Session-based user data will be used

export default function DashboardMahasiswaPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [fetchError, setFetchError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchDestinations() {
      try {
        setFetchError(false);
        setErrorMessage("");
        const res = await fetch("/api/destinations");
        const data = await res.json();
        if (!res.ok) {
          setFetchError(true);
          setErrorMessage(data.message || "Unknown error");
          return;
        }
        if (Array.isArray(data)) {
          setDestinations(data);
        }
      } catch (err: any) {
        console.error("Failed to fetch destinations:", err);
        setFetchError(true);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      eventsTarget: window,
      orientation: "horizontal",
      gestureOrientation: "vertical",
      smoothWheel: true,
      lerp: 0.1,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => { lenis.destroy(); };
  }, []);

  const filtered = Array.isArray(destinations)
    ? destinations.filter(
        (d) =>
          (d.destinationName ?? d.name).toLowerCase().includes(query.toLowerCase()) ||
          (d.categoryCode ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden bg-white">
      <InteractiveBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="shrink-0">
          <TopNavbar />
        </div>

        <div className="mx-auto w-full max-w-5xl xl:max-w-7xl px-4 md:px-6 pt-6 md:pt-10 pb-2 shrink-0 transition-all duration-500">
          <div className="relative mb-6 inline-block w-full">
            <div className="absolute top-0 -left-4 -right-2 h-px bg-zinc-300 z-10" />
            <div className="absolute -top-4 -bottom-2 left-0 w-px bg-zinc-300 z-10" />
            <div className="absolute -top-2 -bottom-4 right-0 w-px bg-zinc-300 z-10" />
            <div className="absolute bottom-0 -left-2 -right-4 h-px bg-zinc-300 z-10" />

            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full relative z-0 rounded-none bg-white py-3 pl-4 pr-4 h-12 text-base text-zinc-900 shadow-sm focus:outline-none focus:bg-zinc-50 transition-colors font-mono font-light border border-zinc-100 md:border-none"
            />
            {!query && (
              <div
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10 font-mono font-light text-sm md:text-base flex items-center"
                aria-hidden="true"
              >
                [ ⌘K ] | &gt; SEARCH DESTINATION
                <span className="animate-terminal-blink ml-1">_</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-[10px] md:text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest text-center px-2">
              {loading ? "LOADING..." : `${filtered.length} TUJUAN TERSEDIA`}
            </span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
        </div>

        {fetchError ? (
          <div className="flex-1 flex flex-col items-center pt-16 px-6">
            <div className="p-6 border border-red-200 bg-red-50/30 max-w-md text-center font-mono">
              <Fingerprint size={32} className="mx-auto mb-4 text-red-500/50" />
              <p className="text-xs font-bold text-red-600 mb-2 uppercase tracking-widest">DATABASE_CONNECTION_ERROR</p>
              <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-tighter">
                Failed to establish secure link to the transmission repository. 
                <br />[ ERR_CODE: ATLAS_CONNECTION_TIMEOUT ]
                <br />{errorMessage && <span className="text-red-400">DETAIL: {errorMessage}</span>}
                {!errorMessage && <span>Possible cause: IP whitelisting or invalid credentials.</span>}
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex flex-col items-center pt-16 px-6">
            <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest animate-pulse">LOADING_DESTINATIONS...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center pt-16 px-6">
            <div className="flex flex-col items-center text-center">
              <FileText size={40} className="mb-3 text-zinc-300" />
              <p className="text-sm text-zinc-500 font-mono text-zinc-400 uppercase tracking-widest">
                TIDAK ADA HASIL DITEMUKAN.
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={wrapperRef}
            className="flex-1 w-full overflow-y-auto md:overflow-x-hidden md:overflow-y-hidden self-stretch pb-10 md:pb-4 md:pt-16"
          >
            <div
              ref={contentRef}
              className="flex flex-col md:flex-row md:flex-nowrap h-full items-center md:items-center gap-12 md:gap-16 px-6 md:px-[10vw] lg:px-24 xl:px-32 w-full md:w-max pb-2"
            >
              {filtered.map((dest) => (
                <div key={dest.id} className="shrink-0 group w-full max-w-sm md:w-96">
                  <DestinationCard
                    id={dest.id}
                    categoryCode={dest.categoryCode ?? ""}
                    name={dest.destinationName ?? dest.name}
                    faculty={dest.name}
                    documentCount={0}
                    status={dest.isOpen === false ? "closed" : "open"}
                    acceptedDocuments={dest.acceptedDocuments}
                  />
                </div>
              ))}

              <div className="hidden md:block w-[20vw] shrink-0 h-full" aria-hidden="true" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
