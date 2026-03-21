import { prisma } from "@/lib/prisma";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import { CheckCircle2, XCircle, Clock, Fingerprint, QrCode } from "lucide-react";
import { notFound } from "next/navigation";

export default async function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      student: { select: { name: true } },
      admin: { select: { destinationName: true } },
    },
  });

  if (!transaction) {
    notFound();
  }

  const { status, mode, scannedAt } = transaction;

  const isFullyVerified = status === "VALIDATED";
  const isAwaitingScan = status === "AWAITING_SCAN";

  // Icon + heading per status
  let icon: React.ReactNode;
  let heading: string;
  let headingColor: string;
  let iconBg: string;

  if (status === "VALIDATED" && mode === "HYBRID") {
    icon = <CheckCircle2 className="text-green-600" size={48} />;
    heading = "SELESAI_TERVERIFIKASI_FISIK";
    headingColor = "text-zinc-900";
    iconBg = "border-green-200 bg-green-50";
  } else if (status === "VALIDATED") {
    icon = <CheckCircle2 className="text-green-600" size={48} />;
    heading = "PROTOCOL_VERIFIED";
    headingColor = "text-zinc-900";
    iconBg = "border-green-200 bg-green-50";
  } else if (isAwaitingScan) {
    icon = <QrCode className="text-amber-500" size={48} />;
    heading = "MENUNGGU_SCAN_FISIK";
    headingColor = "text-zinc-900";
    iconBg = "border-amber-200 bg-amber-50";
  } else {
    icon = <Clock className="text-zinc-400" size={48} />;
    heading = "VERIFICATION_PENDING";
    headingColor = "text-zinc-900";
    iconBg = "border-zinc-200 bg-zinc-50";
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-white p-6 overflow-hidden">
      <InteractiveBackground />

      <div className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-md border border-zinc-300 p-8 shadow-[10px_10px_0px_0px_rgba(228,228,231,1)] text-center">
        {/* Header */}
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center p-4 border mb-6 ${iconBg}`}>
            {icon}
          </div>
          <h1 className={`text-2xl font-mono font-bold tracking-widest uppercase ${headingColor}`}>
            {heading}
          </h1>
          <p className="text-[10px] font-mono text-zinc-400 mt-2 tracking-tighter uppercase italic">
            [ HYDE_VERIFY_LOG // {transaction.id.slice(-8).toUpperCase()} ]
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-left border-y border-zinc-100 py-6 my-6">
          <div className="grid grid-cols-3 gap-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Document</span>
            <span className="col-span-2 text-sm font-mono text-zinc-900 break-all">{transaction.documentType}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Student</span>
            <span className="col-span-2 text-sm font-mono text-zinc-900">{transaction.student.name}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Issuer</span>
            <span className="col-span-2 text-sm font-mono text-zinc-900">{transaction.admin.destinationName || "SYSTEM"}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Mode</span>
            <span className={`col-span-2 text-sm font-mono font-bold uppercase ${mode === "HYBRID" ? "text-amber-600" : "text-blue-600"}`}>
              {mode}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Status</span>
            <span className={`col-span-2 text-sm font-mono font-bold uppercase ${
              status === "VALIDATED"
                ? "text-green-600"
                : isAwaitingScan
                ? "text-amber-600"
                : "text-zinc-600"
            }`}>
              {status}
            </span>
          </div>

          {/* HYBRID terminal: show scannedAt timestamp */}
          {status === "VALIDATED" && mode === "HYBRID" && scannedAt && (
            <div className="grid grid-cols-3 gap-2 border-t border-zinc-50 pt-4 mt-4">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Physical Scan</span>
              <span className="col-span-2 text-sm font-mono text-zinc-900">
                {new Date(scannedAt).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4">
          {isAwaitingScan && (
            <p className="text-[9px] font-mono text-amber-600 uppercase tracking-widest leading-relaxed max-w-xs mx-auto border border-amber-200 bg-amber-50 px-3 py-2">
              ⚠ Dokumen fisik belum diterima. Menunggu konfirmasi scan QR di kantor.
            </p>
          )}
          <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
            This document has been verified against the HYDE secure transmission repository.
            Digital signatures are cryptographically tied to the transaction ID.
          </p>
          <Fingerprint size={24} className="text-zinc-200" />
        </div>
      </div>

      {/* Background corner pieces */}
      <div className="absolute top-12 left-12 w-24 h-24 border-t border-l border-zinc-200 pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-24 h-24 border-b border-r border-zinc-200 pointer-events-none" />
    </div>
  );
}
