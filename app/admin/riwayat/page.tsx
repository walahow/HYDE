"use client";

import { useState } from "react";
import { Search, FileText, Eye } from "lucide-react";
import TopNavbar from "@/components/ui/TopNavbar";
import PageLayout from "@/components/ui/PageLayout";
import HoverCard from "@/components/ui/HoverCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { adminHistoryDocuments } from "@/lib/dummy-data";
import type { UserProfile } from "@/lib/types";

const adminUser: UserProfile = {
    name: "Admin Prodi",
    nim: "ADM-IK-001",
    role: "admin",
    institution: "Prodi Ilmu Komputer — Fakultas MIPA",
};

export default function AdminRiwayatPage() {
    const [query, setQuery] = useState("");

    const filtered = adminHistoryDocuments.filter(
        (doc) =>
            doc.studentName.toLowerCase().includes(query.toLowerCase()) ||
            doc.nim.toLowerCase().includes(query.toLowerCase()) ||
            doc.trackingId.toLowerCase().includes(query.toLowerCase()) ||
            doc.documentType.toLowerCase().includes(query.toLowerCase())
    );

    const selesaiCount = adminHistoryDocuments.filter((d) => d.status === "Selesai").length;
    const diprosesCount = adminHistoryDocuments.filter((d) => d.status === "Diproses").length;

    return (
        <>
            <TopNavbar user={adminUser} />
            <PageLayout>
                {/* Header */}
                <div className="mb-8 pt-4">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
                        Riwayat Dokumen Diproses
                    </h1>
                </div>

                {/* Stats row */}
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <p className="text-2xl font-bold text-zinc-900">
                            {adminHistoryDocuments.length}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">Total Arsip</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <p className="text-2xl font-bold text-zinc-900">{selesaiCount}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">Selesai</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <p className="text-2xl font-bold text-zinc-900">{diprosesCount}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">Sedang Diproses</p>
                    </div>
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
                        placeholder="Cari arsip dokumen..."
                        className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-11 pr-4 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all"
                    />
                </div>

                {/* Divider */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-zinc-200" />
                    <span className="text-xs font-medium text-zinc-400">
                        {filtered.length} arsip ditampilkan
                    </span>
                    <div className="h-px flex-1 bg-zinc-200" />
                </div>

                {/* History cards */}
                {filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <FileText size={40} className="mx-auto mb-3 text-zinc-300" />
                        <p className="text-sm text-zinc-500">Tidak ada arsip yang cocok.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filtered.map((doc) => (
                            <HoverCard key={doc.id}>
                                <div className="flex items-center justify-between px-5 py-4">
                                    {/* Left: icon + info */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                                            <FileText size={18} className="text-zinc-500" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-zinc-900">
                                                    {doc.studentName}
                                                </p>
                                                <StatusBadge status={doc.status} />
                                            </div>
                                            <p className="mt-0.5 text-xs text-zinc-500">
                                                {doc.documentType}
                                            </p>
                                            <p className="mt-0.5 text-xs text-zinc-400">
                                                {doc.nim} &middot; {doc.trackingId} &middot; {doc.submittedAt}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: detail button */}
                                    <button className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md">
                                        <Eye size={13} />
                                        Lihat Detail
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
