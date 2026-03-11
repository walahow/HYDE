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
  History
} from "lucide-react";

type DocType = "Digital" | "Hybrid";
type DocStatus = "Sending" | "Needs Revision" | "Approved";

export default function StudentDocumentView() {
  const [docType, setDocType] = useState<DocType>("Digital");
  const [docStatus, setDocStatus] = useState<DocStatus>("Needs Revision");
  const [selectedFile, setSelectedFile] = useState("PAYLOAD_01.PDF");

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* MOCK STATE TOGGLES (FOR PREVIEW) */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-zinc-900 text-zinc-100 p-2 flex items-center justify-center gap-6 text-[10px] font-mono tracking-widest border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">TYPE:</span>
          <button
            onClick={() => setDocType("Digital")}
            className={`px-2 py-0.5 border transition-colors ${docType === "Digital" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ DIGITAL ]
          </button>
          <button
            onClick={() => setDocType("Hybrid")}
            className={`px-2 py-0.5 border transition-colors ${docType === "Hybrid" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ HYBRID ]
          </button>
        </div>
        <div className="w-px h-3 bg-zinc-800" />
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">STATUS:</span>
          <button
            onClick={() => setDocStatus("Sending")}
            className={`px-2 py-0.5 border transition-colors ${docStatus === "Sending" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ SENDING ]
          </button>
          <button
            onClick={() => setDocStatus("Needs Revision")}
            className={`px-2 py-0.5 border transition-colors ${docStatus === "Needs Revision" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ NEEDS_REVISION ]
          </button>
          <button
            onClick={() => setDocStatus("Approved")}
            className={`px-2 py-0.5 border transition-colors ${docStatus === "Approved" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ APPROVED ]
          </button>
        </div>
      </div>

      <div className="pt-10 flex h-screen overflow-hidden relative z-10">
        {/* LEFT COLUMN: DOCUMENT VIEWPORT */}
        <div className="w-[60%] flex flex-col border-r border-zinc-200 bg-white">
          {/* Header: File Selector */}
          <div className="h-14 border-b border-zinc-200 flex items-center px-6 justify-between bg-zinc-50/50">
            <div className="flex items-center gap-3 font-mono text-[10px] font-medium tracking-tight">
              <span className="text-zinc-400">[ <span className="text-yellow-500/80">📂</span> DIR: /payloads ] &gt;</span>
              <span className="text-zinc-300">|</span>
              <button className="flex items-center gap-2 border border-zinc-200 px-3 py-1 bg-white hover:bg-zinc-50 transition-all text-zinc-600">
                <span className="font-bold">FILE_ID: {selectedFile}</span>
                <ChevronDown size={12} className="text-zinc-400" />
              </button>
            </div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-zinc-900" />
              <div className="w-1.5 h-1.5 border border-zinc-300" />
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-8 overflow-auto bg-[#f0f0f2] relative group">
            {/* Decorative Crossing Lines (Overshooting) */}
            {/* Top Left */}
            <div className="absolute top-10 left-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute top-7 left-10 w-px h-12 bg-zinc-300 z-10" />

            {/* Top Right (Shorter) */}
            <div className="absolute top-11 right-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute top-9 right-11 w-px h-8 bg-zinc-300 z-10" />

            {/* Bottom Left (Shorter) */}
            <div className="absolute bottom-11 left-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-9 left-11 w-px h-8 bg-zinc-300 z-10" />

            {/* Bottom Right */}
            <div className="absolute bottom-10 right-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-7 right-10 w-px h-12 bg-zinc-300 z-10" />


            <div className="w-full h-full max-w-4xl mx-auto bg-white border border-zinc-200 flex flex-col items-center justify-center p-12 transition-all relative overflow-hidden">
              <FileText size={48} className="text-zinc-200 mb-6" />
              <div className="text-center font-mono relative z-10">
                <p className="text-xs font-bold tracking-[0.2em] text-zinc-800 mb-2">PREVIEW_STREAM_WAITING</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-[0.3em]">Establishing secure connection to repository...</p>
              </div>

              {/* Visual Scanning Line */}
              <div className="absolute inset-x-0 h-px bg-zinc-900/5 animate-[scan_4s_linear_infinite]" />

              {/* Subtle Grid Pattern inside preview */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
          </div>
        </div>

        <div className="w-[40%] flex flex-col bg-white overflow-hidden">
          <div className="p-8 border-b border-zinc-100">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-5">// TASK_EXECUTION_STATE</h2>
            <div className="inline-block bg-white p-5 relative overflow-visible">
              {/* Full overshooting borders defining the card shape */}
              <div className="absolute top-0 -left-4 -right-4 h-px bg-zinc-300 pointer-events-none" />
              <div className="absolute left-0 -top-4 -bottom-4 w-px bg-zinc-300 pointer-events-none" />
              <div className="absolute right-0 -top-4 -bottom-4 w-px bg-zinc-200 pointer-events-none" />
              <div className="absolute bottom-0 -left-4 -right-4 h-px bg-zinc-200 pointer-events-none" />

              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-none ${docStatus === "Approved" ? "bg-emerald-500" : docStatus === "Sending" ? "bg-blue-500" : "bg-zinc-900"} animate-status-pulse`} />
                  <div className={`absolute w-3 h-3 rounded-none ${docStatus === "Approved" ? "bg-emerald-500/30" : docStatus === "Sending" ? "bg-blue-500/30" : "bg-zinc-900/30"} animate-ping opacity-20`} />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-xs tracking-tight text-zinc-400 uppercase mb-0.5">Global Status Indicator</span>
                  <span className="font-mono font-bold text-base tracking-tighter text-zinc-900">
                    [ {docStatus === "Approved" ? "VERIFIED_SUCCESS" : docStatus === "Sending" ? "DATA_STREAM_ACTIVE" : "AWAITING_INPUT_REVISION"} ]
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revision Terminal */}
          <div className="flex-1 p-8 flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4 uppercase inline-flex items-center gap-2">
              <History size={12} className="text-zinc-300" /> SYSTEM_FEEDBACK_MANIFEST
            </h2>
            <div className="flex-1 bg-zinc-50 border border-zinc-200 p-6 font-mono text-[11px] overflow-y-auto min-h-[200px] flex flex-col gap-4 relative group/terminal">
              {/* Bayer Dithering Overlay with Bottom-Right Fade - Increased visibility */}
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

                {/* Pulsating cursor position fix */}
                <div className="flex items-center gap-2 text-zinc-900">
                  <span className="font-bold opacity-50">&gt;</span>
                  <span className="w-2 h-0.5 bg-zinc-900 animate-terminal-blink self-end mb-1" />
                </div>
              </div>
            </div>
          </div>

          {/* CONDITIONAL INTERACTIVE AREA */}
          <div className="p-8 bg-zinc-50/50 border-t border-zinc-100">
            {docStatus === "Sending" || docStatus === "Needs Revision" ? (
              <div className="space-y-6">
                <div className="border border-dashed border-zinc-300 p-10 bg-white flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-zinc-400 transition-all">
                  <Upload size={24} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                  <p className="font-mono text-[9px] font-bold tracking-[0.3em] text-zinc-400 group-hover:text-zinc-600 transition-colors uppercase">
                    [ STAGE_NEW_PAYLOAD_HERE ]
                  </p>
                </div>

                <div className="relative group/btn">
                  {/* Overflowing outlines for the transmit button */}
                  <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-300 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-400" />
                  <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-300 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-400" />
                  <div className="absolute -bottom-2 -right-4 w-12 h-px bg-zinc-200 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-300" />
                  <div className="absolute -bottom-4 -right-2 w-px h-12 bg-zinc-200 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-300" />

                  <button className="w-full bg-white text-zinc-900 border border-zinc-200 py-4 font-mono font-bold tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white transition-all relative z-10 group">
                    {docStatus === "Sending" ? "TRANSMIT_INITIAL_PACK" : "TRANSMIT_REVISED_PACK"}
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform opacity-50" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="relative group/btn">
                  {/* Overflowing outlines that grow on hover */}
                  <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-300 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-400" />
                  <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-300 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-400" />
                  <div className="absolute -bottom-2 -right-4 w-12 h-px bg-zinc-200 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-300" />
                  <div className="absolute -bottom-4 -right-2 w-px h-12 bg-zinc-200 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-300" />

                  {docType === "Digital" ? (
                    <button className="w-full bg-zinc-900 text-white border border-zinc-800 py-5 font-mono font-bold tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-zinc-900 hover:border-zinc-200 transition-all relative z-10">
                      <Download size={16} className="opacity-70" /> [ DOWNLOAD_SECURE_PAYLOAD ]
                    </button>
                  ) : (
                    <button className="w-full bg-zinc-900 text-white border border-zinc-800 py-5 font-mono font-bold tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-zinc-900 hover:border-zinc-200 transition-all relative z-10">
                      <Printer size={16} className="opacity-70" /> [ PRINT_DISPOSITION_REPORT ]
                    </button>
                  )}
                </div>

                <div className="mt-5 p-4 border border-zinc-200 bg-zinc-50/50 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-mono font-medium tracking-tight text-zinc-500">
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
