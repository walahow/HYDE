"use client";

import React from "react";

export type AdminStatusType = 
    | "NEW_ARRIVAL" 
    | "ACTION_REQUIRED" 
    | "APPROVED" 
    | "IN_REVISION" 
    | "COMPLETED";

interface AdminStatusBadgeProps {
    status: AdminStatusType;
}

const config: Record<
    AdminStatusType,
    { label: string; className: string; dotClass: string; animate?: boolean }
> = {
    NEW_ARRIVAL: {
        label: "SYS: NEW_ARRIVAL",
        className: "bg-white text-zinc-900 border border-zinc-900",
        dotClass: "bg-zinc-900",
        animate: true,
    },
    ACTION_REQUIRED: {
        label: "ACTION_REQUIRED",
        className: "bg-white text-zinc-900 border border-zinc-900",
        dotClass: "bg-zinc-900",
        animate: true,
    },
    APPROVED: {
        label: "SYS: APPROVED",
        className: "bg-zinc-900 text-white border border-zinc-900",
        dotClass: "bg-white",
    },
    IN_REVISION: {
        label: "IN_REVISION",
        className: "bg-zinc-100 text-zinc-600 border border-zinc-200",
        dotClass: "bg-zinc-400",
    },
    COMPLETED: {
        label: "COMPLETED",
        className: "bg-zinc-50 text-zinc-400 border border-zinc-200 shadow-none",
        dotClass: "bg-zinc-300",
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
