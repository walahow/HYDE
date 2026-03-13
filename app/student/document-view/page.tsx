"use client";

import { useState } from "react";
import {
  FileText,
  ChevronDown,
  FolderOpen,
  Upload,
  ArrowUpRight,
  Download,
  Printer,
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

type DocType = "Digital" | "Hybrid";
type DocStatus = "Sending" | "Needs Revision" | "Approved";

export default function StudentDocumentView() {
  const [docType, setDocType] = useState<DocType>("Digital");
  const [docStatus, setDocStatus] = useState<DocStatus>("Needs Revision");
  const [selectedFile, setSelectedFile] = useState("PAYLOAD_01.PDF");

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f7] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white flex flex-col">
      {/* MOCK STATE TOGGLES (FOR PREVIEW) */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-zinc-900 text-zinc-100 p-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono tracking-widest border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 hidden sm:inline">TYPE:</span>
          <button
            onClick={() => setDocType("Digital")}
            className={`px-2 py-1 border transition-colors h-8 flex items-center ${docType === "Digital" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 active:bg-zinc-800"}`}
          >
            [ DIGITAL ]
          </button>
          <button
            onClick={() => setDocType("Hybrid")}
            className={`px-2 py-1 border transition-colors h-8 flex items-center ${docType === "Hybrid" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 active:bg-zinc-800"}`}
          >
            [ HYBRID ]
          </button>
        </div>
        <div className="hidden sm:block w-px h-3 bg-zinc-800" />
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <span className="text-zinc-500 hidden sm:inline">STATUS:</span>
          <button
            onClick={() => setDocStatus("Sending")}
            className={`px-2 py-1 border transition-colors h-8 flex items-center whitespace-nowrap ${docStatus === "Sending" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 active:bg-zinc-800"}`}
          >
            [ SENDING ]
          </button>
          <button
            onClick={() => setDocStatus("Needs Revision")}
            className={`px-2 py-1 border transition-colors h-8 flex items-center whitespace-nowrap ${docStatus === "Needs Revision" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 active:bg-zinc-800"}`}
          >
            [ REVISION ]
          </button>
          <button
            onClick={() => setDocStatus("Approved")}
            className={`px-2 py-1 border transition-colors h-8 flex items-center whitespace-nowrap ${docStatus === "Approved" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 active:bg-zinc-800"}`}
          >
            [ APPROVED ]
          </button>
        </div>
      </div>

      <div className="mt-20 sm:mt-10 flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden relative z-10 max-w-[1800px] w-full mx-auto border-x border-transparent xl:border-zinc-200/50 shadow-2xl">
        {/* LEFT COLUMN: DOCUMENT VIEWPORT */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-200 bg-white min-w-0">
          {/* Header: File Selector */}
          <div className="h-14 border-b border-zinc-200 flex items-center px-4 md:px-6 justify-between bg-zinc-50/50">
            <div className="flex items-center gap-4 md:gap-6 font-mono text-[9px] md:text-[10px] font-medium tracking-tight overflow-hidden">
              <Link
                href="/riwayat"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors py-1 group/back"
              >
                <ArrowLeft size={14} className="group-hover/back:-translate-x-0.5 transition-transform" />
                <span className="font-bold underline decoration-zinc-200 underline-offset-4">BACK_TO_RIWAYAT</span>
              </Link>
              <span className="text-zinc-300 hidden md:inline ml-1">|</span>
              <button className="flex items-center gap-2 border border-zinc-200 px-2 md:px-3 py-1 bg-white hover:bg-zinc-50 active:bg-zinc-100 transition-all text-zinc-600 h-9 shrink-0">
                <span className="font-bold truncate">📂 FILE_ID: {selectedFile}</span>
                <ChevronDown size={12} className="text-zinc-400 shrink-0" />
              </button>
            </div>

            {/* RELOCATED STATUS INDICATOR (REPLACES DECORATIVE BLOCKS) */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-3 font-mono text-[9px] md:text-[10px] lg:text-[11px] font-bold h-full shrink-0 px-2">
              <span className={`px-1.5 py-0.5 transition-all border ${docStatus === "Sending" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-transparent"}`}>
                SENDING
              </span>
              <span className="text-zinc-200">→</span>
              <span className={`px-1.5 py-0.5 transition-all border ${docStatus === "Needs Revision" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-transparent"}`}>
                REVISION
              </span>
              <span className="text-zinc-300">→</span>
              <span className={`px-1.5 py-0.5 transition-all border ${docStatus === "Approved" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-transparent"}`}>
                APPROVED
              </span>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-4 md:p-8 overflow-auto bg-[#f0f0f2] relative group min-h-[400px] md:min-h-0">
            {/* Decorative Crossing Lines (Overshooting) */}
            {/* Top Left */}
            <div className="absolute top-6 md:top-10 left-4 md:left-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute top-4 md:top-7 left-6 md:left-10 w-px h-12 bg-zinc-300 z-10" />

            {/* Top Right (Shorter) */}
            <div className="absolute top-7 md:top-11 right-6 md:right-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute top-5 md:top-9 right-8 md:right-11 w-px h-8 bg-zinc-300 z-10" />

            {/* Bottom Left (Shorter) */}
            <div className="absolute bottom-7 md:bottom-11 left-6 md:left-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-5 md:bottom-9 left-8 md:left-11 w-px h-8 bg-zinc-300 z-10" />

            {/* Bottom Right */}
            <div className="absolute bottom-6 md:bottom-10 right-4 md:right-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-4 md:bottom-7 right-6 md:right-10 w-px h-12 bg-zinc-300 z-10" />


            <div className="w-full h-full max-w-4xl mx-auto bg-white border border-zinc-200 flex flex-col items-center justify-center p-6 md:p-12 transition-all relative overflow-hidden shadow-sm">
              <FileText size={48} className="text-zinc-200 mb-6" />
              <div className="text-center font-mono relative z-10 px-4">
                <p className="text-xs font-bold tracking-[0.2em] text-zinc-800 mb-2">PREVIEW_STREAM_WAITING</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">Establishing secure connection to repository...</p>
              </div>

              {/* Visual Scanning Line */}
              <div className="absolute inset-x-0 h-px bg-zinc-900/5 animate-[scan_4s_linear_infinite]" />

              {/* Subtle Grid Pattern inside preview */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
          </div>
        </div>

        <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[480px] flex flex-col bg-white overflow-hidden shrink-0 transition-all duration-500 ease-in-out">
          {/* RELOCATED STATUS (Mobile only view / removed from sidebar) */}
          <div className="block sm:hidden p-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center justify-between font-mono text-[8px] font-bold">
              <span className={`px-2 py-1 border ${docStatus === "Sending" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-zinc-100"}`}>SENDING</span>
              <span className={`px-2 py-1 border ${docStatus === "Needs Revision" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-zinc-100"}`}>REVISION</span>
              <span className={`px-2 py-1 border ${docStatus === "Approved" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-zinc-100"}`}>APPROVED</span>
            </div>
          </div>

          {/* B. SENDER/DESTINATION IDENTIFICATION */}
          <div className="p-6 md:p-8 border-b border-zinc-100 space-y-6 md:space-y-8">
            {/* DESTINATION BLOCK */}
            <div>
              <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4">// TRANSMISSION_DESTINATION</h2>
              <div className="p-4 relative overflow-visible border border-zinc-50">
                <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-zinc-900" />
                <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-zinc-900" />
                <div className="space-y-2 md:space-y-1 font-mono text-[10px]">
                  <p className="text-zinc-900 font-bold">&gt; OFFICE: <span className="text-zinc-500">TU_ENGINEERING_01</span></p>
                  <p className="text-zinc-900 font-bold">&gt; AUTH: <span className="text-emerald-600/70">AUTHORIZED_DESTINATION</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Revision Terminal */}
          <div className="flex-1 p-6 md:p-8 flex flex-col overflow-hidden min-h-[250px] md:min-h-0">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4 uppercase inline-flex items-center gap-2">
              <History size={12} className="text-zinc-300" /> SYSTEM_FEEDBACK_MANIFEST
            </h2>
            <div className="flex-1 bg-zinc-50 border border-zinc-200 p-4 md:p-6 font-mono text-[11px] overflow-y-auto md:max-h-none flex flex-col gap-4 relative group/terminal">
              {/* Bayer Dithering Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.10] mask-bayer-fade" />

              <div className="relative z-10 space-y-4">
                <div className="text-zinc-400 flex gap-3">
                  <span className="shrink-0">[10:45:12]</span>
                  <span>SYSTEM: SESSION_ENCRYPTED_AND_INITIALIZED</span>
                </div>

                <div className="flex gap-3">
                  <span className="text-zinc-900 font-bold shrink-0 opacity-50">&gt; [11:20:05]</span>
                  <div className="flex flex-col">
                    <span className="text-zinc-400 text-[9px] font-bold tracking-widest uppercase mb-1">Admin_Authority_TU</span>
                    <span className="text-zinc-600 leading-relaxed">"Mohon periksa kembali margin kiri pada halaman 2. Terlihat terpotong saat preview."</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="text-zinc-900 font-bold shrink-0 opacity-50">&gt; [11:21:40]</span>
                  <div className="flex flex-col">
                    <span className="text-zinc-400 text-[9px] font-bold tracking-widest uppercase mb-1">Admin_Authority_TU</span>
                    <span className="text-zinc-600 leading-relaxed">"Lampiran bukti bayar kurang jelas, silakan re-scan dengan resolusi lebih tinggi."</span>
                  </div>
                </div>

                {docStatus === "Sending" && (
                  <div className="text-blue-600 font-bold flex gap-3 animate-pulse">
                    <span className="shrink-0">[14:28:45]</span>
                    <span>SYSTEM: UPLOAD_SEQUENCE_START. FRAGMENT_01_TRANSMITTED.</span>
                  </div>
                )}

                {docStatus === "Approved" && (
                  <div className="text-emerald-600 font-bold flex gap-3">
                    <span className="shrink-0">[14:30:00]</span>
                    <span>SYSTEM: VALIDATION_CLEARED. ALL_PARAMETERS_SYNCED.</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-zinc-900">
                  <span className="font-bold opacity-50">&gt;</span>
                  <span className="w-2 h-0.5 bg-zinc-900 animate-terminal-blink self-end mb-1" />
                </div>
              </div>
            </div>
          </div>

          {/* CONDITIONAL INTERACTIVE AREA */}
          <div className="p-6 md:p-8 bg-zinc-50/50 border-t border-zinc-100 mb-10 md:mb-0">
            {docStatus === "Sending" || docStatus === "Needs Revision" ? (
              <div className="space-y-6">
                <div className="border border-dashed border-zinc-300 p-8 md:p-10 bg-white flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-zinc-400 active:bg-zinc-50 transition-all min-h-[120px]">
                  <Upload size={24} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                  <p className="font-mono text-[8px] md:text-[9px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-zinc-400 group-hover:text-zinc-600 transition-colors uppercase text-center">
                    [ STAGE_NEW_PAYLOAD_HERE ]
                  </p>
                </div>

                <div className="relative group/btn">
                  {/* Overflowing outlines for the transmit button */}
                  <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-300 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-400 hidden md:block" />
                  <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-300 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-400 hidden md:block" />
                  <div className="absolute -bottom-2 -right-4 w-12 h-px bg-zinc-200 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-300 hidden md:block" />
                  <div className="absolute -bottom-4 -right-2 w-px h-12 bg-zinc-200 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-300 hidden md:block" />

                  <button className="w-full bg-white text-zinc-900 border border-zinc-200 h-14 md:h-auto py-4 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white active:bg-zinc-800 active:text-white transition-all relative z-10 group">
                    {docStatus === "Sending" ? "TRANSMIT_INITIAL_PACK" : "TRANSMIT_REVISED_PACK"}
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-50" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="relative group/btn">
                  <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-300 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-400 hidden md:block" />
                  <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-300 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-400 hidden md:block" />
                  <div className="absolute -bottom-2 -right-4 w-12 h-px bg-zinc-200 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-300 hidden md:block" />
                  <div className="absolute -bottom-4 -right-2 w-px h-12 bg-zinc-200 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-300 hidden md:block" />

                  {docType === "Digital" ? (
                    <button className="w-full bg-zinc-900 text-white border border-zinc-800 h-16 md:h-auto py-5 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-zinc-900 hover:border-zinc-200 active:bg-zinc-100 active:text-zinc-900 active:border-zinc-300 transition-all relative z-10">
                      <Download size={16} className="opacity-70" /> [ DOWNLOAD_SECURE_PAYLOAD ]
                    </button>
                  ) : (
                    <button className="w-full bg-zinc-900 text-white border border-zinc-800 h-16 md:h-auto py-5 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-zinc-900 hover:border-zinc-200 active:bg-zinc-100 active:text-zinc-900 active:border-zinc-300 transition-all relative z-10">
                      <Printer size={16} className="opacity-70" /> [ PRINT_DISPOSITION_REPORT ]
                    </button>
                  )}
                </div>

                <div className="mt-5 p-4 border border-zinc-200 bg-zinc-50/50 flex items-center gap-3 shadow-inner">
                  <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-mono font-medium tracking-tight text-zinc-500 leading-tight">
                    CRYPTOGRAPHIC_INTEGRITY_VERIFIED // SIGN_ID: 882-X0-HYDE-SEC
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes status-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        .animate-status-pulse {
          animation: status-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .mask-bayer-fade {
          background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h2v2H0zM2 2h2v2H2z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: repeat;
          mask-image: radial-gradient(circle at bottom right, black 20%, transparent 90%);
          -webkit-mask-image: radial-gradient(circle at bottom right, black 20%, transparent 90%);
        }
      `}</style>
    </div>
  );
}
