"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import TopNavbar from "@/components/ui/TopNavbar";
import HoverCard from "@/components/ui/HoverCard";
import AdminStatusBadge, { AdminStatusType } from "@/components/ui/AdminStatusBadge";
import { adminHistoryDocuments } from "@/lib/dummy-data";
import type { UserProfile } from "@/lib/types";

const currentUser: UserProfile = {
    name: "Admin Terminal",
    nim: "SYS-ADMIN-01",
    role: "admin",
    institution: "HYDE_CENTRAL_REGISTRY",
};

export default function AdminHistoryPage() {
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

    const filtered = adminHistoryDocuments.filter(
        (doc) =>
            doc.studentName.toLowerCase().includes(query.toLowerCase()) ||
            doc.nim.toLowerCase().includes(query.toLowerCase()) ||
            doc.documentType.toLowerCase().includes(query.toLowerCase()) ||
            doc.trackingId.toLowerCase().includes(query.toLowerCase())
    );

    // Map DocumentStatus to specialized History AdminStatusTypes
    const mapStatus = (status: string, studentName: string): AdminStatusType => {
        if (status === "Selesai") return "COMPLETED";
        if (status === "Diproses") return "APPROVED"; // Or however we want to map history
        return "IN_REVISION";
    };

    return (
        <div className="relative h-screen w-screen flex flex-col bg-white overflow-hidden">
            <InteractiveBackground />

            {/* Main Layout Container */}
            <div className="relative z-10 flex flex-col h-full w-full">

                {/* Fixed Top Section: Navbar + Search Area */}
                <div className="shrink-0">
                    <TopNavbar user={currentUser} />
                    <div className="mx-auto max-w-5xl px-4 md:px-6 pt-6 md:pt-10 pb-4">
                        {/* Header Title */}
                        <div className="mb-6">
                            <h1 className="text-lg md:text-xl font-mono font-bold text-zinc-900 tracking-tighter">
                                {"> ARCHIVE_LOGS // PROCESSED_DATA"}
                            </h1>
                        </div>

                        {/* Search bar */}
                        <div className="relative inline-block w-full">
                            {/* Custom borders for extended intersecting lines on the search bar */}
                            <div className="absolute top-0 -left-2 -right-2 h-px bg-zinc-300 z-10" />
                            <div className="absolute -top-2 -bottom-2 left-0 w-px bg-zinc-300 z-10" />
                            <div className="absolute -top-2 -bottom-2 right-0 w-px bg-zinc-300 z-10" />
                            <div className="absolute bottom-0 -left-2 -right-2 h-px bg-zinc-300 z-10" />

                            <input
                                ref={searchInputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full relative z-0 rounded-none bg-white py-4 md:py-3 pl-4 pr-4 text-sm md:text-base text-zinc-900 shadow-sm focus:outline-none focus:bg-zinc-50 transition-colors font-mono font-light h-14 md:h-auto"
                            />
                            {!query && (
                                <div
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10 font-mono font-light text-[11px] md:text-base flex items-center"
                                    aria-hidden="true"
                                >
                                    <span className="hidden md:inline">[ ⌘K ] | </span>&gt; SEARCH ARCHIVED DOCUMENT
                                    <span className="animate-terminal-blink ml-1">_</span>
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="mt-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-200" />
                            <span className="text-[9px] md:text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">
                                {filtered.length} ARCHIVE_RECORDS_FOUND
                            </span>
                            <div className="h-px flex-1 bg-zinc-200" />
                        </div>
                    </div>
                </div>

                {/* Scrollable Document List Area with Fade Masks */}
                <div
                    className="flex-1 overflow-y-auto px-4 md:px-6"
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 60px), transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 60px), transparent 100%)'
                    }}
                >
                    <div className="mx-auto max-w-5xl py-8 min-h-full flex flex-col">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 flex-1 flex flex-col justify-center">
                                <FileText size={40} className="mx-auto mb-3 text-zinc-300" />
                                <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">No archived records found</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 pb-16">
                                {filtered.map((doc) => (
                                    <HoverCard key={doc.id}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:px-5 md:py-4 gap-4 md:gap-0">
                                            {/* Left: icon + info */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-zinc-50 border border-zinc-100 shadow-sm">
                                                    <FileText size={18} className="text-zinc-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <p className="text-sm font-bold font-mono text-zinc-900 truncate">
                                                            {doc.studentName}
                                                        </p>
                                                        <AdminStatusBadge
                                                            status={mapStatus(doc.status, doc.studentName)}
                                                        />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[10px] md:text-[11px] font-mono text-zinc-500 uppercase tracking-tight line-clamp-1">
                                                            NIM: {doc.nim} // TYPE: {doc.documentType.toUpperCase()}
                                                        </p>
                                                        <p className="text-[9px] md:text-[10px] font-mono text-zinc-400 tracking-tight">
                                                            ID: {doc.trackingId} // PROCESSED: {doc.submittedAt}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: action button */}
                                            <Link
                                                href="/admin/document-view"
                                                className="flex items-center justify-center gap-1.5 rounded-none bg-white text-zinc-400 border border-zinc-200 w-full md:w-auto px-4 py-3 md:py-1.5 font-mono font-bold text-[10px] uppercase tracking-tighter hover:bg-black hover:text-white hover:border-black active:bg-zinc-100 md:active:bg-black transition-all shadow-sm group h-12 md:h-auto"
                                            >
                                                <span>[</span>
                                                <span>VIEW_RECORD</span>
                                                <ExternalLink size={12} className="ml-0.5" />
                                                <span>]</span>
                                            </Link>
                                        </div>
                                    </HoverCard>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
