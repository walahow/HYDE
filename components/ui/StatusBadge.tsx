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
        className: "bg-blue-50 text-blue-700 border border-blue-200",
        dotColor: "bg-blue-500",
    },
    Diproses: {
        label: "Diproses",
        className: "bg-amber-50 text-amber-700 border border-amber-200",
        dotColor: "bg-amber-500",
    },
    Selesai: {
        label: "Selesai",
        className: "bg-green-50 text-green-700 border border-green-200",
        dotColor: "bg-green-500",
    },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const { label, className, dotColor } = config[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {label}
        </span>
    );
}
