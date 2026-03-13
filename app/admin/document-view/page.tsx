"use client";

import { useState } from "react";
import {
  FileText,
  ChevronDown,
  Upload,
  ArrowUpRight,
  History,
  ShieldCheck,
  User,
  Fingerprint,
  MessageSquare
} from "lucide-react";

type DocType = "Digital" | "Hybrid";
type AdminStatus = "PENDING" | "REVISION_REQUIRED" | "APPROVED";

export default function AdminDocumentView() {
  const [docType, setDocType] = useState<DocType>("Digital");
  const [adminStatus, setAdminStatus] = useState<AdminStatus>("PENDING");
  const [selectedFile, setSelectedFile] = useState("PAYLOAD_01.PDF");
  const [feedback, setFeedback] = useState("");

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f7] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white flex flex-col">
      {/* MOCK STATE TOGGLES (FOR PREVIEW) */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-zinc-900 text-zinc-100 p-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono tracking-widest border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 hidden sm:inline">DOC_TYPE:</span>
          <button
            onClick={() => setDocType("Digital")}
            className={`px-2 py-1 border transition-all h-8 flex items-center ${docType === "Digital" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400 active:bg-zinc-800"}`}
          >
            [ DIGITAL ]
          </button>
          <button
            onClick={() => setDocType("Hybrid")}
            className={`px-2 py-1 border transition-all h-8 flex items-center ${docType === "Hybrid" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400 active:bg-zinc-800"}`}
          >
            [ HYBRID ]
          </button>
        </div>
        <div className="hidden sm:block w-px h-3 bg-zinc-800" />
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <span className="text-zinc-500 hidden sm:inline">CURRENT_STATUS:</span>
          <button
            onClick={() => setAdminStatus("PENDING")}
            className={`px-2 py-1 border transition-all h-8 flex items-center whitespace-nowrap ${adminStatus === "PENDING" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400 active:bg-zinc-800"}`}
          >
            [ PENDING ]
          </button>
          <button
            onClick={() => setAdminStatus("REVISION_REQUIRED")}
            className={`px-2 py-1 border transition-all h-8 flex items-center whitespace-nowrap ${adminStatus === "REVISION_REQUIRED" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400 active:bg-zinc-800"}`}
          >
            [ REVISION ]
          </button>
          <button
            onClick={() => setAdminStatus("APPROVED")}
            className={`px-2 py-1 border transition-all h-8 flex items-center whitespace-nowrap ${adminStatus === "APPROVED" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400 active:bg-zinc-800"}`}
          >
            [ APPROVED ]
          </button>
        </div>
      </div>

      <div className="mt-20 sm:mt-10 flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden relative z-10 max-w-[1800px] w-full mx-auto border-x border-transparent xl:border-zinc-200/50 shadow-2xl">
        {/* LEFT COLUMN: DOCUMENT VIEWPORT */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-200 bg-white min-w-0">
          <div className="h-14 border-b border-zinc-200 flex items-center px-4 md:px-6 justify-between bg-zinc-50/50">
            <div className="flex items-center gap-3 font-mono text-[9px] md:text-[10px] font-medium tracking-tight overflow-hidden">
              <span className="text-zinc-400 truncate hidden md:inline">[ <span className="text-yellow-500/80">📂</span> REPOSITORY: /incoming ] &gt;</span>
              <span className="text-zinc-300 hidden md:inline">|</span>
              <button className="flex items-center gap-2 border border-zinc-200 px-2 md:px-3 py-1 bg-white hover:bg-zinc-50 active:bg-zinc-100 transition-all text-zinc-600 h-9 shrink-0">
                <span className="font-bold truncate">ENTITY_ID: {selectedFile}</span>
                <ChevronDown size={12} className="text-zinc-400 shrink-0" />
              </button>
            </div>

            {/* RELOCATED STATUS INDICATOR (REPLACES DECORATIVE BLOCKS) */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-3 font-mono text-[9px] md:text-[10px] lg:text-[11px] font-bold h-full shrink-0 px-2">
              <span className={`px-1.5 py-0.5 transition-all border ${adminStatus === "PENDING" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-transparent"}`}>
                PENDING
              </span>
              <span className="text-zinc-200">→</span>
              <span className={`px-1.5 py-0.5 transition-all border ${adminStatus === "REVISION_REQUIRED" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-transparent"}`}>
                REVISION
              </span>
              <span className="text-zinc-300">→</span>
              <span className={`px-1.5 py-0.5 transition-all border ${adminStatus === "APPROVED" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-transparent"}`}>
                APPROVED
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-8 overflow-auto bg-[#f0f0f2] relative group min-h-[400px] md:min-h-0">
            {/* Decorative Crossing Lines */}
            <div className="absolute top-6 md:top-10 left-4 md:left-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute top-4 md:top-7 left-6 md:left-10 w-px h-12 bg-zinc-300 z-10" />
            <div className="absolute top-7 md:top-11 right-6 md:right-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute top-5 md:top-9 right-8 md:right-11 w-px h-8 bg-zinc-300 z-10" />
            <div className="absolute bottom-7 md:bottom-11 left-6 md:left-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-5 md:bottom-9 left-8 md:left-11 w-px h-8 bg-zinc-300 z-10" />
            <div className="absolute bottom-6 md:bottom-10 right-4 md:right-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-4 md:bottom-7 right-6 md:right-10 w-px h-12 bg-zinc-300 z-10" />

            <div className="w-full h-full max-w-4xl mx-auto bg-white border border-zinc-200 flex flex-col items-center justify-center p-6 md:p-12 transition-all relative overflow-hidden shadow-sm">
              <FileText size={48} className="text-zinc-100 mb-6" />
              <div className="text-center font-mono relative z-10 px-4">
                <p className="text-xs font-bold tracking-[0.2em] text-zinc-800 mb-2">SCANNING_INBOUND_TRANSMISSION</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">Integrity check in progress... Source: Student_Node_77B</p>
              </div>
              <div className="absolute inset-x-0 h-px bg-zinc-900/5 animate-[scan_4s_linear_infinite]" />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ADMIN CONTROL PANEL */}
        <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[480px] flex flex-col bg-white overflow-hidden shrink-0 transition-all duration-500 ease-in-out">
          {/* RELOCATED STATUS (Mobile only view / removed from sidebar) */}
          <div className="block sm:hidden p-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center justify-between font-mono text-[8px] font-bold">
              <span className={`px-2 py-1 border ${adminStatus === "PENDING" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-zinc-100"}`}>PENDING</span>
              <span className={`px-2 py-1 border ${adminStatus === "REVISION_REQUIRED" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-zinc-100"}`}>REVISION</span>
              <span className={`px-2 py-1 border ${adminStatus === "APPROVED" ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-zinc-100"}`}>APPROVED</span>
            </div>
          </div>

          {/* B. SENDER IDENTIFICATION */}
          <div className="p-6 md:p-8 border-b border-zinc-100">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-5">// TRANSMISSION_SOURCE</h2>
            <div className="p-4 relative overflow-visible border border-zinc-50">
              <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-zinc-900" />
              <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-zinc-900" />

              <div className="space-y-3 md:space-y-2 font-mono text-[11px] md:text-xs">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-900 font-bold truncate">&gt; NAME: <span className="text-zinc-600 underline decoration-zinc-200 underline-offset-4">Arch. Knyght</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-900 font-bold break-all md:break-normal">&gt; ID: <span className="text-zinc-600">210605110078</span> // TYPE: <span className={docType === "Digital" ? "text-blue-600" : "text-amber-600"}>{docType.toUpperCase()}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* C. COMMAND INPUT */}
          <div className="flex-1 p-6 md:p-8 flex flex-col overflow-hidden min-h-[200px] md:min-h-0">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4 uppercase flex items-center gap-2">
              <MessageSquare size={12} className="text-zinc-300" /> COMMAND_INPUT_TERMINAL
            </h2>
            <div className="flex-1 relative group md:h-0">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="> INPUT_FEEDBACK_OR_REVISION_NOTES_HERE..._"
                className="w-full h-full bg-zinc-50 border border-zinc-200 p-4 md:p-6 font-mono text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-colors resize-none relative z-10 min-h-[120px] md:min-h-0"
              />
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] mask-bayer-fade z-20" />
            </div>
          </div>

          {/* D. SIGNATURE DROPZONE (Conditional) */}
          {adminStatus === "APPROVED" && docType === "Digital" && (
            <div className="px-6 md:px-8 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-2 border-dashed border-zinc-300 p-6 bg-zinc-50/50 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-zinc-900 active:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-900 min-h-[100px]">
                <Upload size={20} className="transition-colors" />
                <p className="font-mono text-[8px] md:text-[9px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-center">
                  [ LOAD_SIGNATURE_ASSET_HERE ]
                </p>
              </div>
            </div>
          )}

          {/* E. DYNAMIC ACTION BUTTON */}
          <div className="p-6 md:p-8 bg-zinc-50/50 border-t border-zinc-100 space-y-4 mb-20 md:mb-0">
            {/* ACTION_A: PRIMARY COMMAND */}
            <div className="relative group/btn-primary">
              <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-200 transition-all group-hover/btn-primary:w-16 group-hover/btn-primary:bg-zinc-400 hidden md:block" />
              <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-200 transition-all group-hover/btn-primary:h-16 group-hover/btn-primary:bg-zinc-400 hidden md:block" />

              <button
                onClick={() => {
                  if (adminStatus === "PENDING") setAdminStatus("REVISION_REQUIRED");
                  else if (adminStatus === "REVISION_REQUIRED") setAdminStatus("APPROVED");
                }}
                className="w-full bg-white text-zinc-900 border border-zinc-200 h-14 md:h-auto py-4 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white active:bg-zinc-800 active:text-white transition-all relative z-10 group shadow-sm"
              >
                {adminStatus === "REVISION_REQUIRED" ? (
                  <>DISPATCH_REVISION_COMMAND <ArrowUpRight size={14} /></>
                ) : adminStatus === "APPROVED" && docType === "Hybrid" ? (
                  <>APPROVE_AND_CLOSE_TICKET ✓</>
                ) : adminStatus === "APPROVED" && docType === "Digital" ? (
                  <>SEAL_DOCUMENT_AND_TRANSMIT <ArrowUpRight size={14} /></>
                ) : (
                  <>INITIALIZE_COMMAND_SEQUENCE <ArrowUpRight size={14} /></>
                )}
              </button>
            </div>

            {/* ACTION_B: SECONDARY COMMAND */}
            {adminStatus !== "APPROVED" && (
              <div className="relative group/btn-secondary">
                <div className="absolute -bottom-2 -right-4 w-12 h-px bg-emerald-100 transition-all group-hover/btn-secondary:w-16 group-hover/btn-secondary:bg-emerald-300 hidden md:block" />
                <div className="absolute -bottom-4 -right-2 w-px h-12 bg-emerald-100 transition-all group-hover/btn-secondary:h-16 group-hover/btn-secondary:bg-emerald-300 hidden md:block" />

                <button
                  onClick={() => setAdminStatus("APPROVED")}
                  className="w-full bg-emerald-50/30 text-emerald-900 border border-emerald-200/50 h-14 md:h-auto py-4 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white active:bg-emerald-700 active:text-white transition-all relative z-10 group shadow-sm"
                >
                  VALIDATE_AND_ACCEPT_PAYLOAD ✓
                </button>
              </div>
            )}

            <div className="mt-5 p-3 border border-zinc-200 bg-white flex items-center gap-3 shadow-inner">
              <div className={`w-1.5 h-1.5 rounded-none ${adminStatus === "APPROVED" ? "bg-emerald-500" : "bg-zinc-400"} animate-pulse`} />
              <p className="text-[9px] font-mono font-medium tracking-tight text-zinc-500 leading-tight">
                AUTH_LVL: DESTINATION_ADMIN // SESSION_TOKEN: "SESSION_SYNC_ACTIVE"
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .mask-bayer-fade {
          background-image: url("data:image/svg+xml,%3Csvg width='4' height='4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h2v2H0zM2 2h2v2H2z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
          background-repeat: repeat;
          mask-image: radial-gradient(circle at center, black 10%, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black 10%, transparent 80%);
        }
      `}</style>
    </div>
  );
}
