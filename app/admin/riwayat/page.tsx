"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import TopNavbar from "@/components/ui/TopNavbar";
import HoverCard from "@/components/ui/HoverCard";
import AdminStatusBadge from "@/components/ui/AdminStatusBadge";
import type { UserProfile, Transaction } from "@/lib/types";
import type { DocumentStatus } from "@/lib/types";

const ADMIN_ID = "69b6cd888d2d340d5984ce5c";

const currentUser: UserProfile = {
    id: ADMIN_ID,
    autoId: 101,
    name: "Admin LPPM",
    nim: "ADM-001",
    role: "ADMIN",
};

// Admin history shows REVISION and VALIDATED transactions
const HISTORY_STATUSES: DocumentStatus[] = ["REVISION", "VALIDATED"];

export default function AdminHistoryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const res = await fetch(`/api/transactions?role=ADMIN&userId=${ADMIN_ID}`);
                const data: Transaction[] = await res.json();
                // History: only REVISION and VALIDATED
                setTransactions(data.filter(t => HISTORY_STATUSES.includes(t.status)));
            } catch (err) {
                console.error("Failed to fetch transactions:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(
        (t) =>
            t.student?.name.toLowerCase().includes(query.toLowerCase()) ||
            t.student?.nim.toLowerCase().includes(query.toLowerCase()) ||
            t.documentType.toLowerCase().includes(query.toLowerCase()) ||
            t.id.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="relative h-screen w-screen flex flex-col bg-white overflow-hidden">
            <InteractiveBackground />

            <div className="relative z-10 flex flex-col h-full w-full">
                <div className="shrink-0">
                    <TopNavbar user={currentUser} />
                    <div className="mx-auto max-w-5xl px-4 md:px-6 pt-6 md:pt-10 pb-4">
                        <div className="mb-6">
                            <h1 className="text-lg md:text-xl font-mono font-bold text-zinc-900 tracking-tighter">
                                {"> ARCHIVE_LOGS // PROCESSED_DATA"}
                            </h1>
                        </div>

                        <div className="relative inline-block w-full">
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

                        <div className="mt-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-200" />
                            <span className="text-[9px] md:text-xs font-mono font-medium text-zinc-400 uppercase tracking-widest">
                                {loading ? "LOADING..." : `${filtered.length} ARCHIVE_RECORDS_FOUND`}
                            </span>
                            <div className="h-px flex-1 bg-zinc-200" />
                        </div>
                    </div>
                </div>

                <div
                    className="flex-1 overflow-y-auto px-4 md:px-6"
                    style={{
                        maskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 60px), transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 60px), transparent 100%)'
                    }}
                >
                    <div className="mx-auto max-w-5xl py-8 min-h-full flex flex-col">
                        {loading ? (
                            <div className="text-center py-12 flex-1 flex flex-col justify-center">
                                <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest animate-pulse">LOADING_ARCHIVE...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-12 flex-1 flex flex-col justify-center">
                                <FileText size={40} className="mx-auto mb-3 text-zinc-300" />
                                <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">No archived records found</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 pb-16">
                                {filtered.map((t) => (
                                    <HoverCard key={t.id}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:px-5 md:py-4 gap-4 md:gap-0">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-zinc-50 border border-zinc-100 shadow-sm">
                                                    <FileText size={18} className="text-zinc-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <p className="text-sm font-bold font-mono text-zinc-900 truncate">
                                                            {t.student?.name ?? "Unknown Student"}
                                                        </p>
                                                        <AdminStatusBadge status={t.status} />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-[10px] md:text-[11px] font-mono text-zinc-500 uppercase tracking-tight line-clamp-1">
                                                            NIM: {t.student?.nim} // TYPE: {t.documentType.toUpperCase()}
                                                        </p>
                                                        <p className="text-[9px] md:text-[10px] font-mono text-zinc-400 tracking-tight">
                                                            ID: {t.id.slice(-8).toUpperCase()} // PROCESSED: {new Date(t.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/admin/document-view?txId=${t.id}`}
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
