import type { DocumentStatus } from "@/lib/types";

interface StatusBadgeProps {
    status: DocumentStatus;
}

const config: Record<
    DocumentStatus,
    { label: string; className: string; dotColor: string }
> = {
    Baru: {
        label: "Baru",
        className: "bg-white text-zinc-900 border border-zinc-900",
        dotColor: "bg-zinc-900",
    },
    Diproses: {
        label: "Diproses",
        className: "bg-zinc-900 text-white border border-zinc-900",
        dotColor: "bg-white",
    },
    Selesai: {
        label: "Selesai",
        className: "bg-zinc-200 text-zinc-900 border border-zinc-300",
        dotColor: "bg-zinc-500",
    },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const { label, className, dotColor } = config[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-none px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold font-mono shadow-sm ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-none ${dotColor}`} />
            {label}
        </span>
    );
}
