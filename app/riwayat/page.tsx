"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import TopNavbar from "@/components/ui/TopNavbar";
import HoverCard from "@/components/ui/HoverCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { studentDocuments } from "@/lib/dummy-data";
import type { UserProfile } from "@/lib/types";

const currentUser: UserProfile = {
    name: "Ahmad Fauzan",
    nim: "H1101221001",
    role: "mahasiswa",
    institution: "Universitas Lambung Mangkurat",
};

export default function RiwayatMahasiswaPage() {
    const [query, setQuery] = useState("");
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

    const filtered = studentDocuments.filter(
        (doc) =>
            doc.destinationName.toLowerCase().includes(query.toLowerCase()) ||
            doc.documentType.toLowerCase().includes(query.toLowerCase()) ||
            doc.trackingId.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="relative min-h-screen w-full flex flex-col bg-white">
            <InteractiveBackground />
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col w-full">
                <div className="pointer-events-auto shrink-0">
                    <TopNavbar user={currentUser} />
                </div>
                <div className="pointer-events-auto flex-1 w-full overflow-y-auto">
                    <div className="mx-auto max-w-5xl px-6 py-10 min-h-full flex flex-col">
                        {/* Search bar */}
                        <div className="relative mb-6 inline-block w-full">
                            {/* Custom borders for extended intersecting lines on the search bar */}
                            <div className="absolute top-0 -left-4 -right-2 h-px bg-zinc-300 z-10" />
                            <div className="absolute -top-4 -bottom-2 left-0 w-px bg-zinc-300 z-10" />
                            <div className="absolute -top-2 -bottom-4 right-0 w-px bg-zinc-300 z-10" />
                            <div className="absolute bottom-0 -left-2 -right-4 h-px bg-zinc-300 z-10" />

                            <input
                                ref={searchInputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full relative z-0 rounded-none bg-white py-3 pl-4 pr-4 text-base text-zinc-900 shadow-sm focus:outline-none focus:bg-zinc-50 transition-colors font-mono font-light"
                            />
                            {!query && (
                                <div
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10 font-mono font-light text-base flex items-center"
                                    aria-hidden="true"
                                >
                                    [ ⌘K ] | &gt; SEARCH HISTORY
                                    <span className="animate-terminal-blink ml-1">_</span>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="mb-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-200" />
                            <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">
                                {filtered.length} DOKUMEN DITEMUKAN
                            </span>
                            <div className="h-px flex-1 bg-zinc-200" />
                        </div>

                        {/* Document history cards container - Centered vertically in remaining space */}
                        <div className="flex-1 flex flex-col justify-center pt-12 pb-12">
                            {filtered.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText size={40} className="mx-auto mb-3 text-zinc-300" />
                                    <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Tidak ada dokumen yang ditemukan</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filtered.map((doc) => (
                                        <HoverCard key={doc.id}>
                                            <div className="flex items-center justify-between px-5 py-4">
                                                {/* Left: icon + info */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-zinc-50 border border-zinc-100 shadow-sm">
                                                        <FileText size={18} className="text-zinc-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-sm font-bold font-mono text-zinc-900 truncate">
                                                                {doc.destinationName}
                                                            </p>
                                                            <StatusBadge status={doc.status} />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <p className="text-[11px] font-mono text-zinc-500 uppercase">
                                                                {doc.documentType}
                                                            </p>
                                                            <p className="text-[10px] font-mono text-zinc-400 tracking-tight">
                                                                {doc.trackingId} // {doc.submittedAt}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: detail button */}
                                                <button className="flex items-center gap-1.5 rounded-none bg-transparent text-zinc-400 border border-zinc-200 px-3 py-1.5 font-mono font-bold text-[10px] uppercase tracking-tighter hover:bg-black hover:text-white hover:border-black transition-all shadow-sm">
                                                    DETAIL
                                                    <ExternalLink size={12} />
                                                </button>
                                            </div>
                                        </HoverCard>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
