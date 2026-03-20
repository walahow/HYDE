import type { DocumentStatus } from "@/lib/types";

interface StatusBadgeProps {
    status: DocumentStatus;
}

const config: Record<
    string,
    { label: string; className: string; dotColor: string; animate?: boolean }
> = {
    DRAFT: {
        label: "DRAFT",
        className: "bg-white text-zinc-900 border border-zinc-900",
        dotColor: "bg-zinc-900",
    },
    REVIEWING: {
        label: "REVIEWING",
        className: "bg-zinc-900 text-white border border-zinc-900",
        dotColor: "bg-white",
        animate: true,
    },
    REVISION: {
        label: "REVISION",
        className: "bg-zinc-100 text-zinc-600 border border-zinc-300",
        dotColor: "bg-zinc-500",
        animate: true,
    },
    VALIDATED: {
        label: "VALIDATED",
        className: "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none",
        dotColor: "bg-emerald-400",
    },
    AWAITING_SCAN: {
        label: "MENUNGGU SCAN",
        className: "bg-amber-50 text-amber-700 border border-amber-300",
        dotColor: "bg-amber-500",
        animate: true,
    },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const { label, className, dotColor, animate } = config[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold font-mono shadow-sm ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-none ${dotColor} ${animate ? "animate-pulse" : ""}`} />
            {label}
        </span>
    );
}
