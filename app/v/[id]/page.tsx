import { prisma } from "@/lib/prisma";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import { CheckCircle2, XCircle, Clock, Fingerprint } from "lucide-react";
import { notFound } from "next/navigation";

export default async function VerificationPage({ params }: { params: { id: string } }) {
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

  const isVerified = transaction.status === "VALIDATED";

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-white p-6 overflow-hidden">
      <InteractiveBackground />

      <div className="relative z-10 w-full max-w-lg bg-white/80 backdrop-blur-md border border-zinc-300 p-8 shadow-[10px_10px_0px_0px_rgba(228,228,231,1)] text-center">
        {/* Header */}
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center p-4 border mb-6 ${isVerified ? 'border-green-200 bg-green-50' : 'border-zinc-200 bg-zinc-50'}`}>
            {isVerified ? (
              <CheckCircle2 className="text-green-600" size={48} />
            ) : (
              <Clock className="text-zinc-400" size={48} />
            )}
          </div>
          <h1 className="text-2xl font-mono font-bold tracking-widest text-zinc-900 uppercase">
            {isVerified ? "PROTOCOL_VERIFIED" : "VERIFICATION_PENDING"}
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
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Status</span>
            <span className={`col-span-2 text-sm font-mono font-bold uppercase ${isVerified ? 'text-green-600' : 'text-zinc-600'}`}>
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-4">
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
