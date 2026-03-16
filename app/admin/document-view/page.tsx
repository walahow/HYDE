"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  ChevronDown,
  Upload,
  ArrowUpRight,
  History,
  ShieldCheck,
  User,
  Fingerprint,
  MessageSquare,
  Info,
  Search,
  Shield,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import type { DocumentStatus } from "@/lib/types";

type DocType = "Digital" | "Hybrid";

// Admin ID — replace with session once auth is implemented
const ADMIN_ID = "69b6cd888d2d340d5984ce5c";

export default function AdminDocumentView() {
  const searchParams = useSearchParams();
  const txId = searchParams.get("txId");

  const [docType, setDocType] = useState<DocType>("Digital");
  const [status, setStatus] = useState<DocumentStatus>("DRAFT");
  const [selectedFile, setSelectedFile] = useState("PAYLOAD_01.PDF");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [txInfo, setTxInfo] = useState<{ studentName?: string; nim?: string; documentType?: string } | null>(null);
  const [statusLogs, setStatusLogs] = useState<Array<{
    id: string;
    changedAt: string;
    fromStatus: string | null;
    toStatus: string;
    note: string | null;
    changedBy?: { name: string; role: string };
  }>>([]);

  const pipelineLabels: Record<DocumentStatus, string> = {
    DRAFT: "DRAFT",
    REVIEWING: "REVIEWING",
    REVISION: "REVISION",
    VALIDATED: "VALIDATED",
  };

  async function refreshLogs() {
    if (!txId) return;
    const res = await fetch(`/api/transactions/${txId}`);
    if (!res.ok) return;
    const data = await res.json();
    setStatusLogs(data.statusLogs ?? []);
  }

  // On mount: fetch real status, then auto-transition DRAFT → REVIEWING
  useEffect(() => {
    if (!txId) return;
    async function initTransaction() {
      const res = await fetch(`/api/transactions/${txId}`);
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
      setStatusLogs(data.statusLogs ?? []);
      setTxInfo({
        studentName: data.student?.name,
        nim: data.student?.nim,
        documentType: data.documentType,
      });
      // Auto-set REVIEWING when admin opens a DRAFT transaction
      if (data.status === "DRAFT") {
        await fetch(`/api/transactions/${txId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toStatus: "REVIEWING", changedById: ADMIN_ID, note: "Admin opened the transaction" }),
        });
        setStatus("REVIEWING");
        await refreshLogs();
      }
    }
    initTransaction();
  }, [txId]);

  async function changeStatus(toStatus: DocumentStatus, note?: string) {
    if (!txId) return;
    setSaving(true);
    try {
      await fetch(`/api/transactions/${txId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toStatus, changedById: ADMIN_ID, note }),
      });
      setStatus(toStatus);
      setFeedback("");
      await refreshLogs();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f7] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white flex flex-col">
      {/* Header hidden for production */}

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden relative z-10 w-full shadow-2xl">
        {/* LEFT COLUMN: DOCUMENT VIEWPORT */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-200 bg-white min-w-0">
          <div className="h-14 border-b border-zinc-200 flex items-center px-4 md:px-6 justify-between bg-zinc-50/50">
            <div className="flex items-center gap-4 md:gap-6 font-mono text-[9px] md:text-[10px] font-medium tracking-tight overflow-hidden">
              <Link
                href="/admin/riwayat"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors py-1 group/back"
              >
                <ArrowLeft size={14} className="group-hover/back:-translate-x-0.5 transition-transform" />
                <span className="font-bold underline decoration-zinc-200 underline-offset-4">BACK</span>
              </Link>
              <span className="text-zinc-300 hidden md:inline ml-1">|</span>
              <button className="flex items-center gap-2 border border-zinc-200 px-2 md:px-3 py-1 bg-white hover:bg-zinc-50 active:bg-zinc-100 transition-all text-zinc-600 h-9 shrink-0">
                <span className="font-bold truncate">📂 FILE_ID: {selectedFile}</span>
                <ChevronDown size={12} className="text-zinc-400 shrink-0" />
              </button>
            </div>

            {/* STATUS PIPELINE */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-3 font-mono text-[9px] md:text-[10px] lg:text-[11px] font-bold h-full shrink-0 px-2">
              {(["DRAFT", "REVIEWING", "REVISION", "VALIDATED"] as const).map((s, i, arr) => (
                <React.Fragment key={s}>
                  <span className={`px-1.5 py-0.5 transition-all border ${status === s ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-transparent"}`}>
                    {pipelineLabels[s]}
                  </span>
                  {i < arr.length - 1 && <span className="text-zinc-200">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 md:p-8 overflow-auto bg-[#f0f0f2] relative group min-h-[400px] md:min-h-0">
            {/* Document Content Container */}
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
          {/* MOBILE STATUS PIPELINE */}
          <div className="block sm:hidden p-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center justify-between font-mono text-[8px] font-bold">
              {(["DRAFT", "REVIEWING", "REVISION", "VALIDATED"] as const).map((s) => (
                <span key={s} className={`px-2 py-1 border ${status === s ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-zinc-100"}`}>{s}</span>
              ))}
            </div>
          </div>

          {/* B. SENDER IDENTIFICATION */}
          <div className="p-6 md:p-8 border-b border-zinc-100">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-5">// TRANSMISSION_SOURCE</h2>
            <div className={`p-4 relative overflow-visible border border-zinc-50 ${status === "VALIDATED" ? "border-transparent" : ""}`}>
              {status !== "VALIDATED" && (
                <>
                  <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-zinc-900" />
                  <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-zinc-900" />
                </>
              )}

              <div className="space-y-3 md:space-y-2 font-mono text-[11px] md:text-xs">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-900 font-bold truncate">&gt; OFFICE: <span className="text-zinc-600 underline decoration-zinc-200 underline-offset-4">{txInfo?.studentName ?? "Awaiting Data..."}</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-900 font-bold break-all md:break-normal">&gt; ID: <span className="text-zinc-600">{txInfo?.nim ?? "--------"}</span> // TYPE: <span className={docType === "Digital" ? "text-blue-600" : "text-amber-600"}>{docType.toUpperCase()}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* C. COMMAND INPUT */}
          <div className="flex-1 p-6 md:p-8 flex flex-col overflow-hidden min-h-[200px] md:min-h-0">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4 uppercase flex items-center gap-2">
              <MessageSquare size={12} className="text-zinc-300" /> COMMAND_INPUT_TERMINAL
            </h2>
            <div className="flex-1 bg-zinc-50 border border-zinc-200 p-4 md:p-6 font-mono text-[11px] overflow-y-auto md:max-h-none flex flex-col gap-4 relative group/terminal">
              {/* Bayer Dithering Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.10] mask-bayer-fade" />

              <div className="relative z-10 space-y-4">
                <div className="text-zinc-400 flex gap-3">
                  <span className="shrink-0">[INIT]</span>
                  <span>SYSTEM: SESSION_ENCRYPTED_AND_INITIALIZED</span>
                </div>

                {/* Real status logs from DB */}
                {statusLogs.map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <span className="text-zinc-900 font-bold shrink-0 opacity-50">&gt; [{new Date(log.changedAt).toLocaleTimeString()}]</span>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-[9px] font-bold tracking-widest uppercase mb-1">
                        {log.changedBy?.name ?? "System"} // {log.changedBy?.role ?? "SYS"}
                      </span>
                      <span className="text-zinc-600 leading-relaxed">
                        {log.note ?? `${log.fromStatus ?? "NEW"} → ${log.toStatus}`}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Admin feedback textarea */}
                <div className="flex gap-2 text-zinc-900 group-focus-within/terminal:text-black transition-colors relative min-h-[4rem] items-start">
                  <span className="font-bold opacity-50 shrink-0 leading-relaxed">&gt;</span>
                  <div className="flex-1 font-mono text-[11px] text-zinc-700 leading-relaxed break-all relative">
                    {feedback}
                    <span className="inline-block w-2 h-0.5 bg-zinc-900 animate-terminal-blink ml-1 align-middle" />
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* D. SIGNATURE DROPZONE (Conditional) */}
          {status === "REVIEWING" && docType === "Digital" && (
            <div className="px-6 md:px-8 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="border-2 border-dashed border-zinc-300 p-6 bg-zinc-50/50 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-zinc-900 active:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-900 min-h-[100px]">
                <Upload size={20} className="transition-colors" />
                <p className="font-mono text-[8px] md:text-[9px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-center">
                  [ LOAD_OFFICIAL_SIGNATURE_HERE ]
                </p>
              </div>
            </div>
          )}

          {/* E. DYNAMIC ACTION BUTTON */}
          <div className="p-6 md:p-8 bg-zinc-50/50 border-t border-zinc-100 space-y-4 mb-20 md:mb-0">
            {/* ACTION_A: PRIMARY — dispatch revision */}
            <div className="relative group/btn-primary">
              {status !== "VALIDATED" && (
                <>
                  <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-200 transition-all group-hover/btn-primary:w-16 group-hover/btn-primary:bg-zinc-400 hidden md:block" />
                  <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-200 transition-all group-hover/btn-primary:h-16 group-hover/btn-primary:bg-zinc-400 hidden md:block" />
                </>
              )}

              {status !== "VALIDATED" && (
                <button
                  disabled={saving || !txId}
                  onClick={() => {
                    if (status === "DRAFT") changeStatus("REVIEWING");
                    else if (status === "REVIEWING") changeStatus("REVISION", feedback || undefined);
                  }}
                  className="w-full bg-white text-zinc-900 border border-zinc-200 h-14 md:h-auto py-4 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white active:bg-zinc-800 active:text-white transition-all relative z-10 group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "SAVING..." : status === "REVIEWING" ? (
                    <>DISPATCH_REVISION_COMMAND <ArrowUpRight size={14} /></>
                  ) : status === "REVISION" ? (
                    <>AWAITING_STUDENT_REVISION ↩</>
                  ) : (
                    <>MARK_AS_REVIEWING <ArrowUpRight size={14} /></>
                  )}
                </button>
              )}
            </div>

            {/* ACTION_B: SECONDARY — validate & accept */}
            {(status === "REVIEWING" || status === "REVISION") && (
              <div className="relative group/btn-secondary">
                <div className="absolute -bottom-2 -right-4 w-12 h-px bg-emerald-100 transition-all group-hover/btn-secondary:w-16 group-hover/btn-secondary:bg-emerald-300 hidden md:block" />
                <div className="absolute -bottom-4 -right-2 w-px h-12 bg-emerald-100 transition-all group-hover/btn-secondary:h-16 group-hover/btn-secondary:bg-emerald-300 hidden md:block" />

                <button
                  disabled={saving || !txId}
                  onClick={() => changeStatus("VALIDATED", feedback || undefined)}
                  className="w-full bg-emerald-50/30 text-emerald-900 border border-emerald-200/50 h-14 md:h-auto py-4 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white active:bg-emerald-700 active:text-white transition-all relative z-10 group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "SAVING..." : "VALIDATE_AND_ACCEPT_PAYLOAD ✓"}
                </button>
              </div>
            )}

            <div className="mt-5 p-3 border border-zinc-200 bg-white flex items-center gap-3 shadow-inner">
              <div className={`w-1.5 h-1.5 rounded-none ${status === "VALIDATED" ? "bg-emerald-500" : "bg-zinc-400"} animate-pulse`} />
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
