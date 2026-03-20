"use client";

import React from "react";
import type { DocumentStatus } from "@/lib/types";

interface AdminStatusBadgeProps {
    status: DocumentStatus;
}

const config: Record<
    string,
    { label: string; className: string; dotClass: string; animate?: boolean }
> = {
    DRAFT: {
        label: "SYS: NEW_ARRIVAL",
        className: "bg-white text-zinc-900 border border-zinc-900",
        dotClass: "bg-zinc-900",
        animate: true,
    },
    REVIEWING: {
        label: "REVIEWING",
        className: "bg-zinc-900 text-white border border-zinc-900",
        dotClass: "bg-white",
        animate: true,
    },
    REVISION: {
        label: "ACTION_REQUIRED",
        className: "bg-zinc-100 text-zinc-600 border border-zinc-200",
        dotClass: "bg-zinc-400",
        animate: true,
    },
    VALIDATED: {
        label: "VALIDATED",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none",
        dotClass: "bg-emerald-400",
    },
    AWAITING_SCAN: {
        label: "AWAIT_SCAN",
        className: "bg-amber-50 text-amber-700 border border-amber-300",
        dotClass: "bg-amber-500",
        animate: true,
    },
};

export default function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
    const { label, className, dotClass, animate } = config[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold font-mono shadow-sm ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-none ${dotClass} ${animate ? "animate-pulse" : ""}`} />
            [ {label} ]
        </span>
    );
}
