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
    <div className="min-h-screen bg-[#f5f5f7] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white pb-20">
      {/* MOCK STATE TOGGLES (FOR PREVIEW) */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-zinc-900 text-zinc-100 p-2 flex items-center justify-center gap-6 text-[10px] font-mono tracking-widest border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">DOC_TYPE:</span>
          <button
            onClick={() => setDocType("Digital")}
            className={`px-2 py-0.5 border transition-all ${docType === "Digital" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400"}`}
          >
            [ DIGITAL ]
          </button>
          <button
            onClick={() => setDocType("Hybrid")}
            className={`px-2 py-0.5 border transition-all ${docType === "Hybrid" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400"}`}
          >
            [ HYBRID ]
          </button>
        </div>
        <div className="w-px h-3 bg-zinc-800" />
        <div className="flex items-center gap-4">
          <span className="text-zinc-500">CURRENT_STATUS:</span>
          <button
            onClick={() => setAdminStatus("PENDING")}
            className={`px-2 py-0.5 border transition-all ${adminStatus === "PENDING" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400"}`}
          >
            [ PENDING ]
          </button>
          <button
            onClick={() => setAdminStatus("REVISION_REQUIRED")}
            className={`px-2 py-0.5 border transition-all ${adminStatus === "REVISION_REQUIRED" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400"}`}
          >
            [ REVISION_REQUIRED ]
          </button>
          <button
            onClick={() => setAdminStatus("APPROVED")}
            className={`px-2 py-0.5 border transition-all ${adminStatus === "APPROVED" ? "bg-white text-black border-white" : "border-zinc-700 hover:border-zinc-500 text-zinc-400"}`}
          >
            [ APPROVED ]
          </button>
        </div>
      </div>

      <div className="pt-10 flex h-screen overflow-hidden relative z-10">
        {/* LEFT COLUMN: DOCUMENT VIEWPORT */}
        <div className="w-[60%] flex flex-col border-r border-zinc-200 bg-white">
          <div className="h-14 border-b border-zinc-200 flex items-center px-6 justify-between bg-zinc-50/50">
            <div className="flex items-center gap-3 font-mono text-[10px] font-medium tracking-tight">
              <span className="text-zinc-400">[ <span className="text-yellow-500/80">📂</span> REPOSITORY: /incoming ] &gt;</span>
              <span className="text-zinc-300">|</span>
              <button className="flex items-center gap-2 border border-zinc-200 px-3 py-1 bg-white hover:bg-zinc-50 transition-all text-zinc-600">
                <span className="font-bold">ENTITY_ID: {selectedFile}</span>
                <ChevronDown size={12} className="text-zinc-400" />
              </button>
            </div>
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-zinc-900" />
              <div className="w-1.5 h-1.5 border border-zinc-300" />
            </div>
          </div>

          <div className="flex-1 p-8 overflow-auto bg-[#f0f0f2] relative group">
            {/* Decorative Crossing Lines */}
            <div className="absolute top-10 left-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute top-7 left-10 w-px h-12 bg-zinc-300 z-10" />
            <div className="absolute top-11 right-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute top-9 right-11 w-px h-8 bg-zinc-300 z-10" />
            <div className="absolute bottom-11 left-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-9 left-11 w-px h-8 bg-zinc-300 z-10" />
            <div className="absolute bottom-10 right-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-7 right-10 w-px h-12 bg-zinc-300 z-10" />

            <div className="w-full h-full max-w-4xl mx-auto bg-white border border-zinc-200 flex flex-col items-center justify-center p-12 transition-all relative overflow-hidden shadow-sm">
              <FileText size={48} className="text-zinc-100 mb-6" />
              <div className="text-center font-mono relative z-10">
                <p className="text-xs font-bold tracking-[0.2em] text-zinc-800 mb-2">SCANNING_INBOUND_TRANSMISSION</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-[0.3em]">Integrity check in progress... Source: Student_Node_77B</p>
              </div>
              <div className="absolute inset-x-0 h-px bg-zinc-900/5 animate-[scan_4s_linear_infinite]" />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ADMIN CONTROL PANEL */}
        <div className="w-[40%] flex flex-col bg-white overflow-hidden">
          {/* A. STATUS CARD (SLIMMER & NON-INTERACTIVE) */}
          <div className="p-8 border-b border-zinc-100">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4 uppercase flex items-center gap-2">
              <ShieldCheck size={12} className="text-zinc-300" /> STATUS_AUTHORITY_OVERRIDE
            </h2>
            <div className="relative overflow-visible">
              <div className="absolute -top-0 -left-6 -right-6 h-px bg-zinc-100 pointer-events-none" />
              <div className="absolute bottom-0 -left-6 -right-6 h-px bg-zinc-100 pointer-events-none" />

              <div className="flex flex-col w-full py-1">
                <span className="font-mono font-bold text-[8px] tracking-[0.3em] text-zinc-400 uppercase mb-2">CURRENT_EXECUTION_PHASE</span>
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold">
                  <span className={`px-2 py-0.5 transition-all ${adminStatus === "PENDING" ? "bg-zinc-900 text-white" : "text-zinc-900/60"}`}>
                    SENDING
                  </span>
                  <span className="text-zinc-200">→</span>
                  <span className={`px-2 py-0.5 transition-all ${adminStatus === "REVISION_REQUIRED" ? "bg-zinc-900 text-white" : "text-zinc-900/60"}`}>
                    REVISION
                  </span>
                  <span className="text-zinc-300">→</span>
                  <span className={`px-2 py-0.5 transition-all ${adminStatus === "APPROVED" ? "bg-zinc-900 text-white" : "text-zinc-900/60"}`}>
                    APPROVED
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* B. SENDER IDENTIFICATION */}
          <div className="p-8 border-b border-zinc-100">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-5">// TRANSMISSION_SOURCE</h2>
            <div className="p-4 relative overflow-visible">
              {/* Corner markers only (No background or border) */}
              <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-zinc-900" />
              <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-zinc-900" />
              
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-zinc-400" />
                  <span className="text-zinc-900 font-bold">&gt; NAME: <span className="text-zinc-600 underline decoration-zinc-200 underline-offset-4">Arch. Knyght</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint size={14} className="text-zinc-400" />
                  <span className="text-zinc-900 font-bold">&gt; ID: <span className="text-zinc-600">210605110078</span> // TYPE: <span className={docType === "Digital" ? "text-blue-600" : "text-amber-600"}>{docType.toUpperCase()}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* C. COMMAND INPUT */}
          <div className="flex-1 p-8 flex flex-col overflow-hidden">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4 uppercase flex items-center gap-2">
              <MessageSquare size={12} className="text-zinc-300" /> COMMAND_INPUT_TERMINAL
            </h2>
            <div className="flex-1 relative group">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="> INPUT_FEEDBACK_OR_REVISION_NOTES_HERE..._"
                className="w-full h-full bg-zinc-50 border border-zinc-200 p-6 font-mono text-[11px] text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-900 transition-colors resize-none relative z-10"
              />
              <div className="absolute inset-0 pointer-events-none opacity-[0.05] mask-bayer-fade z-20" />
            </div>
          </div>

          {/* D. SIGNATURE DROPZONE (Conditional) */}
          {adminStatus === "APPROVED" && docType === "Digital" && (
            <div className="px-8 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-2 border-dashed border-zinc-300 p-6 bg-zinc-50/50 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-zinc-900 transition-all hover:bg-white text-zinc-400 hover:text-zinc-900">
                <Upload size={20} className="transition-colors" />
                <p className="font-mono text-[9px] font-bold tracking-[0.3em] uppercase">
                  [ LOAD_SIGNATURE_ASSET_HERE ]
                </p>
              </div>
            </div>
          )}

          {/* E. DYNAMIC ACTION BUTTON */}
          {/* DYNAMIC ACTION BUTTONS: CONSOLIDATED COMMAND BLOCK */}
          <div className="p-8 bg-zinc-50/50 border-t border-zinc-100 space-y-4">
            {/* ACTION_A: REVISION_COMMAND */}
            <div className="relative group/btn-primary">
              {/* SHARED TOP-LEFT CORNER ( Zinc Reaction ) */}
              <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-200 transition-all group-hover/btn-primary:w-16 group-hover/btn-primary:bg-zinc-400" />
              <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-200 transition-all group-hover/btn-primary:h-16 group-hover/btn-primary:bg-zinc-400" />

              <button 
                onClick={() => {
                  if (adminStatus === "PENDING") setAdminStatus("REVISION_REQUIRED");
                  else if (adminStatus === "REVISION_REQUIRED") setAdminStatus("APPROVED");
                }}
                className="w-full bg-white text-zinc-900 border border-zinc-200 py-4 font-mono font-bold tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white transition-all relative z-10 group shadow-sm"
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
            
            {/* ACTION_B: ACCEPT_COMMAND */}
            {adminStatus !== "APPROVED" && (
              <div className="relative group/btn-secondary">
                {/* SHARED BOTTOM-RIGHT CORNER ( Emerald Reaction ) */}
                <div className="absolute -bottom-2 -right-4 w-12 h-px bg-emerald-100 transition-all group-hover/btn-secondary:w-16 group-hover/btn-secondary:bg-emerald-300" />
                <div className="absolute -bottom-4 -right-2 w-px h-12 bg-emerald-100 transition-all group-hover/btn-secondary:h-16 group-hover/btn-secondary:bg-emerald-300" />

                <button 
                  onClick={() => setAdminStatus("APPROVED")}
                  className="w-full bg-emerald-50/30 text-emerald-900 border border-emerald-200/50 py-4 font-mono font-bold tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all relative z-10 group shadow-sm"
                >
                  VALIDATE_AND_ACCEPT_PAYLOAD ✓
                </button>
              </div>
            )}

            <div className="mt-5 p-3 border border-zinc-200 bg-white flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-none ${adminStatus === "APPROVED" ? "bg-emerald-500" : "bg-zinc-400"} animate-pulse`} />
              <p className="text-[9px] font-mono font-medium tracking-tight text-zinc-500">
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
