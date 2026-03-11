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
    <div className="min-h-screen bg-[#f5f5f7] text-black font-sans selection:bg-black selection:text-white">
      {/* MOCK STATE TOGGLES (FOR PREVIEW) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white p-2 flex items-center justify-center gap-6 text-[10px] font-mono tracking-widest border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">TYPE:</span>
          <button
            onClick={() => setDocType("Digital")}
            className={`px-2 py-0.5 border ${docType === "Digital" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ DIGITAL ]
          </button>
          <button
            onClick={() => setDocType("Hybrid")}
            className={`px-2 py-0.5 border ${docType === "Hybrid" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ HYBRID ]
          </button>
        </div>
        <div className="w-px h-3 bg-zinc-800" />
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">STATUS:</span>
          <button
            onClick={() => setDocStatus("Sending")}
            className={`px-2 py-0.5 border ${docStatus === "Sending" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ SENDING ]
          </button>
          <button
            onClick={() => setDocStatus("Needs Revision")}
            className={`px-2 py-0.5 border ${docStatus === "Needs Revision" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ NEEDS_REVISION ]
          </button>
          <button
            onClick={() => setDocStatus("Approved")}
            className={`px-2 py-0.5 border ${docStatus === "Approved" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500"}`}
          >
            [ APPROVED ]
          </button>
        </div>
      </div>

      <div className="pt-10 flex h-screen overflow-hidden">
        {/* LEFT COLUMN: DOCUMENT VIEWPORT */}
        <div className="w-[60%] flex flex-col border-r-2 border-black bg-white">
          {/* Header: File Selector */}
          <div className="h-14 border-b border-black flex items-center px-6 justify-between bg-zinc-50">
            <div className="flex items-center gap-3 font-mono text-xs font-bold tracking-tighter">
              <span className="text-zinc-400">[ 📂 DIR: /payloads ]</span>
              <span className="text-zinc-400">&gt;</span>
              <button className="flex items-center gap-2 border border-black px-3 py-1 bg-white hover:bg-black hover:text-white transition-all">
                <span>SELECT_FILE: {selectedFile}</span>
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-none bg-black" />
              <div className="w-2 h-2 rounded-none border border-black" />
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-8 overflow-auto bg-[#e5e5e5] relative group">
            {/* Decorative Corner Brackets */}
            <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-black z-10" />
            <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-black z-10" />
            <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-black z-10" />
            <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-black z-10" />

            {/* Center Crosshair (Subtle) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 z-10 opacity-20 pointer-events-none">
              <div className="absolute top-1/2 left-0 w-full h-px bg-black" />
              <div className="absolute top-0 left-1/2 w-px h-full bg-black" />
            </div>

            <div className="w-full h-full max-w-4xl mx-auto bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-12 transition-transform group-hover:scale-[1.005]">
              <FileText size={64} className="text-zinc-200 mb-4" />
              <div className="text-center font-mono">
                <p className="text-sm font-bold tracking-widest text-zinc-900 mb-1">PREVIEW_NOT_AVAILABLE</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em]">System is awaiting data stream...</p>
              </div>

              {/* Visual Scanning Line (CSS Animation would be nice here) */}
              <div className="absolute inset-x-12 top-0 h-px bg-black/10 animate-[scan_4s_linear_infinite] shadow-[0_0_15px_rgba(0,0,0,0.1)]" />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROL PANEL */}
        <div className="w-[40%] flex flex-col bg-zinc-50 overflow-y-auto">
          {/* Status Block */}
          <div className="p-8 border-b border-black">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4">// CURRENT_OPERATION_STATUS</h2>
            <div className="inline-block border-2 border-black p-4 bg-white">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-none ${docStatus === "Approved" ? "bg-green-500" : docStatus === "Sending" ? "bg-blue-500 animate-pulse" : "bg-black animate-terminal-blink"}`} />
                <span className="font-mono font-bold text-lg tracking-tighter">
                  STATUS // [ {docStatus === "Approved" ? "OPERATION_COMPLETED" : docStatus === "Sending" ? "TRANSMITTING_DATA" : "AWAITING_REVISION"} ]
                </span>
              </div>
            </div>
          </div>

          {/* Revision Terminal */}
          <div className="flex-1 p-8 flex flex-col">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4 uppercase inline-flex items-center gap-2">
              <History size={12} /> ADMIN_FEEDBACK_LOGS
            </h2>
            <div className="flex-1 bg-white border border-black p-4 font-mono text-xs overflow-y-auto min-h-[200px] flex flex-col gap-3">
              <div className="text-zinc-400">[10:45:12] SYSTEM: SESSION_INITIALIZED</div>
              <div className="flex gap-2">
                <span className="text-black font-bold shrink-0">&gt; [11:20:05] ADMIN_TU:</span>
                <span className="text-zinc-600">"Mohon periksa kembali margin kiri pada halaman 2. Terlihat terpotong saat preview."</span>
              </div>
              <div className="flex gap-2">
                <span className="text-black font-bold shrink-0">&gt; [11:21:40] ADMIN_TU:</span>
                <span className="text-zinc-600">"Lampiran bukti bayar kurang jelas, silakan re-scan dengan resolusi lebih tinggi."</span>
              </div>
              {docStatus === "Sending" && (
                <div className="text-blue-600 font-bold mt-2 animate-pulse">[14:28:45] SYSTEM: UPLOAD_SEQUENCE_STARTED. PACKET_01_SENT...</div>
              )}
              {docStatus === "Approved" && (
                <div className="text-green-600 font-bold mt-2 animate-pulse">[14:30:00] SYSTEM: VERIFICATION_SUCCESS. ALL_PARAMETERS_VALID.</div>
              )}
              <div className="mt-auto animate-terminal-blink text-black">_</div>
            </div>
          </div>

          {/* CONDITIONAL INTERACTIVE AREA */}
          <div className="p-8 bg-zinc-100 border-t border-black">
            {docStatus === "Sending" ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-2 border-dashed border-black p-12 bg-white flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-zinc-50 transition-colors">
                  <Upload size={32} className="text-zinc-300 group-hover:text-black transition-colors" />
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-400 group-hover:text-black">
                    [ DROP_PAYLOAD_HERE ]
                  </p>
                </div>
                <button className="w-full bg-white border-2 border-black py-4 font-mono font-bold tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all group">
                  TRANSMIT_INITIAL_DATA <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            ) : docStatus === "Needs Revision" ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-zinc-400 p-10 bg-white flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-black transition-colors">
                  <Upload size={32} className="text-zinc-300 group-hover:text-black transition-colors" />
                  <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-400 group-hover:text-black">
                    [ DROP_REVISED_PAYLOAD_HERE ]
                  </p>
                </div>
                <button className="w-full bg-white border-2 border-black py-4 font-mono font-bold tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all group">
                  TRANSMIT_REVISION <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {docType === "Digital" ? (
                  <button className="w-full bg-black text-white border-2 border-black py-6 font-mono font-bold tracking-[0.3em] text-sm flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all group">
                    <Download size={20} /> [ DOWNLOAD_VERIFIED_DATA ↓ ]
                  </button>
                ) : (
                  <button className="w-full bg-black text-white border-2 border-black py-6 font-mono font-bold tracking-[0.3em] text-sm flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all group">
                    <Printer size={20} /> [ PRINT_DISPOSITION_TICKET 🖨️ ]
                  </button>
                )}

                <div className="mt-4 p-4 border border-black bg-white flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500" />
                  <p className="text-[10px] font-mono font-medium tracking-tight">
                    DATA_INTEGRITY_VERIFIED // SIGNATURE_ID: 882-X0-HYDE
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
      `}</style>
    </div>
  );
}
