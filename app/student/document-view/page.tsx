"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  ChevronDown,
  Upload,
  ArrowUpRight,
  Download,
  Printer,
  History,
  ArrowLeft,
  AlertCircle,
  User,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import type { DocumentStatus } from "@/lib/types";

const STUDENT_ID = "69b6cd888d2d340d5984ce5f";

interface StatusLog {
  id: string;
  changedAt: string;
  fromStatus: DocumentStatus | null;
  toStatus: DocumentStatus;
  note: string | null;
  changedBy?: { name: string; role: string };
}

interface TransactionDetail {
  id: string;
  documentType: string;
  status: DocumentStatus;
  createdAt: string;
  admin?: { id: string; name: string; destinationName?: string | null; categoryCode?: string | null };
  files?: { id: string; fileUrl: string; originalFileName: string }[];
  statusLogs?: StatusLog[];
}

type DocType = "Digital" | "Hybrid";

export default function StudentDocumentView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const txId = searchParams.get("txId");
  const destId = searchParams.get("destId"); // for new submissions

  const [docType, setDocType] = useState<DocType>("Digital");
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentReply, setStudentReply] = useState("");

  // New submission state (when no txId, comes from dashboard)
  const [documentType, setDocumentType] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [adminInfo, setAdminInfo] = useState<{ id: string; name: string } | null>(null);
  const [transmitting, setTransmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setAttachedFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
  };
  useEffect(() => {
    if (txId || !destId) return;
    async function fetchAdmin() {
      const res = await fetch("/api/destinations");
      if (!res.ok) return;
      const data = await res.json();
      const admin = data.find((d: any) => d.id === destId);
      if (admin) setAdminInfo({ id: admin.id, name: admin.name });
    }
    fetchAdmin();
  }, [txId, destId]);



  useEffect(() => {
    if (!txId) {
      setLoading(false);
      return;
    }
    async function fetchTransaction() {
      const res = await fetch(`/api/transactions/${txId}`);
      if (!res.ok) { setLoading(false); return; }
      const data: TransactionDetail = await res.json();
      setTransaction(data);
      setLoading(false);
    }
    fetchTransaction();
  }, [txId]);

  const status = transaction?.status ?? null;

  const pipelineLabels: Record<DocumentStatus, string> = {
    DRAFT: "DRAFT",
    REVIEWING: "REVIEWING",
    REVISION: "REVISION",
    VALIDATED: "VALIDATED",
  };

  async function uploadFile(file: File) {
    const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      body: file,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("[UPLOAD_API_FAILURE]", data);
      throw new Error(data.error || "Upload failed");
    }
    return { url: data.url, name: file.name };
  }

  async function handleSubmit() {
    if (!documentType.trim() || !attachedFile || !destId) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      // 1. Upload to Vercel Blob
      const fileData = await uploadFile(attachedFile);
      
      // 2. Create Transaction in MongoDB
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentId: STUDENT_ID, 
          adminId: destId, 
          documentType: documentType.trim(),
          file: fileData
        }),
      });
      if (!res.ok) { setSubmitError("Gagal mengirim transaksi. Coba lagi."); return; }
      const data = await res.json();
      router.push(`/student/document-view?txId=${data.id}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      setSubmitError(err.message || "Gagal mengirim transaksi. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function transmitRevision() {
    if (!txId || !attachedFile) return;
    setTransmitting(true);
    try {
      // 1. Upload to Vercel Blob
      const fileData = await uploadFile(attachedFile);

      // 2. Update Status and link file
      await fetch(`/api/transactions/${txId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: "REVIEWING",
          changedById: STUDENT_ID,
          note: studentReply.trim() || "Student re-submitted revised documents",
          file: fileData
        }),
      });
      // Refresh transaction to get updated logs
      const res = await fetch(`/api/transactions/${txId}`);
      if (res.ok) {
        const data: TransactionDetail = await res.json();
        setTransaction(data);
      }
      setStudentReply("");
      setAttachedFile(null); // Clear after successful transmission
    } catch (err) {
      console.error("Failed to transmit revision:", err);
    } finally {
      setTransmitting(false);
    }
  }

  // --- NEW SUBMISSION MODE (no txId, destId provided) ---
  if (!txId) {
    return (
      <div className="h-screen overflow-hidden bg-[#f5f5f7] text-zinc-900 font-sans flex flex-col">
        {/* Header hidden for production */}
        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden relative z-10 w-full shadow-2xl">
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-200 bg-white min-w-0 items-center justify-center p-12">
            <div className="w-full max-w-sm text-center font-mono">
              <FileText size={48} className="text-zinc-200 mb-6 mx-auto" />
              <p className="text-xs font-bold tracking-[0.2em] text-zinc-800 mb-2">AWAITING_PAYLOAD_DESCRIPTION</p>
              <p className="text-[9px] text-zinc-400 uppercase tracking-[0.2em] leading-relaxed">Fill in document type on the right panel to begin transmission sequence.</p>
            </div>
          </div>

          <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[480px] flex flex-col bg-white overflow-hidden shrink-0">
            <div className="p-6 md:p-8 border-b border-zinc-100">
              <Link href="/" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors mb-6 font-mono text-[10px] group/back">
                <ArrowLeft size={14} className="group-hover/back:-translate-x-0.5 transition-transform" />
                <span className="font-bold underline decoration-zinc-200 underline-offset-4">BACK_TO_DASHBOARD</span>
              </Link>
              <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4">// NEW_TRANSMISSION_INIT</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-2 block">DOCUMENT_TYPE *</label>
                  <input
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    placeholder="e.g. Surat Pengantar KRS"
                    className="w-full rounded-none border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
                  />
                </div>

                {/* Drag and Drop Zone */}
                <div>
                  <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-2 block">ATTACH_PAYLOAD *</label>
                  <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group min-h-[120px] ${
                      isDragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-400"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileSelect}
                      className="hidden"
                    />
                    {attachedFile ? (
                      <>
                        <FileText size={24} className="text-zinc-900" />
                        <div className="text-center">
                          <p className="font-mono text-[9px] font-bold text-zinc-900 uppercase truncate max-w-[200px]">{attachedFile.name}</p>
                          <p className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB // READY</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }}
                          className="text-[8px] font-mono font-bold text-red-500 hover:text-red-700 underline underline-offset-2 mt-1"
                        >
                          [ REMOVE_PAYLOAD ]
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload size={24} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                        <p className="font-mono text-[8px] md:text-[9px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-zinc-400 group-hover:text-zinc-600 transition-colors uppercase text-center">
                          {isDragging ? "[ RELEASE_TO_ATTACH ]" : "[ DRAG_OR_CLICK_TO_ATTACH ]"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 text-red-600 font-mono text-[10px]">
                    <AlertCircle size={12} />
                    {submitError}
                  </div>
                )}
                <button
                  disabled={!documentType.trim() || !attachedFile || submitting || !destId}
                  onClick={handleSubmit}
                  className="w-full bg-white text-zinc-900 border border-zinc-200 py-4 font-mono font-bold tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white active:bg-zinc-800 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "TRANSMITTING..." : <>TRANSMIT_INITIAL_PACK <ArrowUpRight size={14} /></>}
                </button>
              </div>
            </div>

            {/* Destination info (Harmonized) */}
            <div className="p-6 md:p-8 border-b border-zinc-100">
              <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-5">// TRANSMISSION_DESTINATION</h2>
              <div className="p-4 relative overflow-visible border border-zinc-50">
                <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-zinc-900" />
                <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-zinc-900" />
                
                <div className="space-y-3 md:space-y-2 font-mono text-[11px] md:text-xs">
                  <div className="flex items-center gap-3">
                    <User size={14} className="text-zinc-400 shrink-0" />
                    <span className="text-zinc-900 font-bold truncate">&gt; NAME: <span className="text-zinc-600 underline decoration-zinc-200 underline-offset-4">{adminInfo?.name ?? "Loading..."}</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Fingerprint size={14} className="text-zinc-400 shrink-0" />
                    <span className="text-zinc-900 font-bold break-all md:break-normal">&gt; ID: <span className="text-zinc-600">{adminInfo?.id?.slice(-8).toUpperCase() ?? "--------"}</span> // TYPE: <span className="text-blue-600">DIGITAL</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
        `}</style>
      </div>
    );
  }

  // --- EXISTING TRANSACTION VIEW MODE ---
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f7] font-mono text-zinc-400 text-sm animate-pulse">
        LOADING_TRANSMISSION...
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f7] font-mono text-zinc-500 text-sm">
        TRANSACTION_NOT_FOUND
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f5f5f7] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white flex flex-col">
      {/* Header hidden for production */}

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden relative z-10 w-full shadow-2xl">
        {/* LEFT: DOCUMENT VIEWPORT */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-zinc-200 bg-white min-w-0">
          <div className="h-14 border-b border-zinc-200 flex items-center px-4 md:px-6 justify-between bg-zinc-50/50">
            <div className="flex items-center gap-4 md:gap-6 font-mono text-[9px] md:text-[10px] font-medium tracking-tight overflow-hidden">
              <Link href="/riwayat" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors py-1 group/back">
                <ArrowLeft size={14} className="group-hover/back:-translate-x-0.5 transition-transform" />
                <span className="font-bold underline decoration-zinc-200 underline-offset-4">BACK_TO_RIWAYAT</span>
              </Link>
              <span className="text-zinc-300 hidden md:inline ml-1">|</span>
              <button className="flex items-center gap-2 border border-zinc-200 px-2 md:px-3 py-1 bg-white hover:bg-zinc-50 active:bg-zinc-100 transition-all text-zinc-600 h-9 shrink-0">
                <span className="font-bold truncate">📂 {transaction.documentType.toUpperCase()}</span>
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

          {/* Preview Area */}
          <div className="flex-1 p-4 md:p-8 overflow-auto bg-[#f0f0f2] relative group min-h-[400px] md:min-h-0">
            <div className="absolute top-6 md:top-10 left-4 md:left-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute top-4 md:top-7 left-6 md:left-10 w-px h-12 bg-zinc-300 z-10" />
            <div className="absolute top-7 md:top-11 right-6 md:right-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute top-5 md:top-9 right-8 md:right-11 w-px h-8 bg-zinc-300 z-10" />
            <div className="absolute bottom-7 md:bottom-11 left-6 md:left-9 w-8 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-5 md:bottom-9 left-8 md:left-11 w-px h-8 bg-zinc-300 z-10" />
            <div className="absolute bottom-6 md:bottom-10 right-4 md:right-7 w-12 h-px bg-zinc-300 z-10" />
            <div className="absolute bottom-4 md:bottom-7 right-6 md:right-10 w-px h-12 bg-zinc-300 z-10" />

            <div className="w-full h-full max-w-4xl mx-auto bg-white border border-zinc-200 flex flex-col items-center justify-center p-6 md:p-12 transition-all relative overflow-hidden shadow-sm">
              <FileText size={48} className="text-zinc-200 mb-6" />
              <div className="text-center font-mono relative z-10 px-4">
                <p className="text-xs font-bold tracking-[0.2em] text-zinc-800 mb-2">PREVIEW_STREAM_WAITING</p>
                <p className="text-[9px] text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed">Establishing secure connection to repository...</p>
              </div>
              <div className="absolute inset-x-0 h-px bg-zinc-900/5 animate-[scan_4s_linear_infinite]" />
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
          </div>
        </div>

        {/* RIGHT: PANEL */}
        <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[480px] flex flex-col bg-white overflow-hidden shrink-0">
          {/* Mobile status pipeline */}
          <div className="block sm:hidden p-4 border-b border-zinc-100 bg-zinc-50/50">
            <div className="flex items-center justify-between font-mono text-[8px] font-bold">
              {(["DRAFT", "REVIEWING", "REVISION", "VALIDATED"] as const).map((s) => (
                <span key={s} className={`px-2 py-1 border ${status === s ? "bg-zinc-900 text-white border-zinc-900" : "text-zinc-900/40 border-zinc-100"}`}>{s}</span>
              ))}
            </div>
          </div>

          {/* Destination info */}
          <div className="p-6 md:p-8 border-b border-zinc-100">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-5">// TRANSMISSION_DESTINATION</h2>
            <div className="p-4 relative overflow-visible border border-zinc-50">
              <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-zinc-900" />
              <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-zinc-900" />
              
              <div className="space-y-3 md:space-y-2 font-mono text-[11px] md:text-xs">
                <div className="flex items-center gap-3">
                  <User size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-900 font-bold truncate">&gt; NAME: <span className="text-zinc-600 underline decoration-zinc-200 underline-offset-4">{transaction.admin?.name ?? "Unknown Admin"}</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <Fingerprint size={14} className="text-zinc-400 shrink-0" />
                  <span className="text-zinc-900 font-bold break-all md:break-normal">&gt; ID: <span className="text-zinc-600">{transaction.admin?.id?.slice(-8).toUpperCase() ?? "--------"}</span> // TYPE: <span className={docType === "Digital" ? "text-blue-600" : "text-amber-600"}>{docType.toUpperCase()}</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Log / Feedback Terminal */}
          <div className="flex-1 p-6 md:p-8 flex flex-col overflow-hidden min-h-[250px] md:min-h-0">
            <h2 className="text-[10px] font-mono font-bold text-zinc-400 tracking-[0.3em] mb-4 uppercase inline-flex items-center gap-2">
              <History size={12} className="text-zinc-300" /> SYSTEM_FEEDBACK_MANIFEST
            </h2>
            <div className="flex-1 bg-zinc-50 border border-zinc-200 p-4 md:p-6 font-mono text-[11px] overflow-y-auto flex flex-col gap-4 relative group/terminal">
              <div className="absolute inset-0 pointer-events-none opacity-[0.10] mask-bayer-fade" />
              <div className="relative z-10 space-y-4">
                <div className="text-zinc-400 flex gap-3">
                  <span className="shrink-0">[INIT]</span>
                  <span>SYSTEM: SESSION_ENCRYPTED_AND_INITIALIZED</span>
                </div>

                {/* Real status logs */}
                {(transaction.statusLogs ?? []).map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <span className="text-zinc-900 font-bold shrink-0 opacity-50">&gt; [{new Date(log.changedAt).toLocaleTimeString()}]</span>
                    <div className="flex flex-col">
                      <span className="text-zinc-400 text-[9px] font-bold tracking-widest uppercase mb-1">
                        {log.changedBy?.name ?? "System"} // {log.changedBy?.role ?? "SYS"}
                      </span>
                      <span className="text-zinc-600 leading-relaxed">
                        {log.note ?? `Status changed: ${log.fromStatus ?? "NEW"} → ${log.toStatus}`}
                      </span>
                    </div>
                  </div>
                ))}

                {status === "VALIDATED" && (
                  <div className="text-emerald-600 font-bold flex gap-3">
                    <span className="shrink-0">[SYS]</span>
                    <span>SYSTEM: VALIDATION_CLEARED. ALL_PARAMETERS_SYNCED.</span>
                  </div>
                )}

                {/* Student reply input (only when REVISION) */}
                {status === "REVISION" && (
                  <div className="flex gap-2 text-zinc-900 group-focus-within/terminal:text-black transition-colors relative min-h-[4rem] items-start">
                    <span className="font-bold opacity-50 shrink-0 leading-relaxed">&gt;</span>
                    <div className="flex-1 font-mono text-[11px] text-zinc-700 leading-relaxed break-all relative">
                      {studentReply}
                      <span className="inline-block w-2 h-0.5 bg-zinc-900 animate-terminal-blink ml-1 align-middle" />
                      <textarea
                        value={studentReply}
                        onChange={(e) => setStudentReply(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text resize-none focus:outline-none"
                        placeholder="Type your reply..."
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACTION AREA */}
          <div className="p-6 md:p-8 bg-zinc-50/50 border-t border-zinc-100 mb-10 md:mb-0">
            {status === "DRAFT" || status === "REVIEWING" ? (
              <div className="text-center font-mono text-[10px] text-zinc-400 py-4">
                <div className="w-1.5 h-1.5 rounded-none bg-zinc-400 animate-pulse mx-auto mb-2" />
                AWAITING_ADMIN_REVIEW
              </div>
            ) : status === "REVISION" ? (
              <div className="space-y-6">
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed p-8 md:p-10 bg-white flex flex-col items-center justify-center gap-4 group cursor-pointer transition-all min-h-[120px] ${
                    isDragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-300 hover:border-zinc-400 active:bg-zinc-50"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileSelect}
                    className="hidden"
                  />
                  {attachedFile ? (
                    <>
                      <FileText size={24} className="text-zinc-900" />
                      <div className="text-center">
                        <p className="font-mono text-[9px] font-bold text-zinc-900 uppercase truncate max-w-[200px]">{attachedFile.name}</p>
                        <p className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest">{(attachedFile.size / 1024 / 1024).toFixed(2)} MB // READY_FOR_REVISION</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }}
                        className="text-[8px] font-mono font-bold text-red-500 hover:text-red-700 underline underline-offset-2 mt-1"
                      >
                        [ REMOVE_PAYLOAD ]
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-zinc-200 group-hover:text-zinc-400 transition-colors" />
                      <p className="font-mono text-[8px] md:text-[9px] font-bold tracking-[0.2em] md:tracking-[0.3em] text-zinc-400 group-hover:text-zinc-600 transition-colors uppercase text-center">
                        {isDragging ? "[ RELEASE_TO_ATTACH ]" : "[ STAGE_REVISED_PAYLOAD_HERE ]"}
                      </p>
                    </>
                  )}
                </div>
                <div className="relative group/btn">
                  <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-300 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-400 hidden md:block" />
                  <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-300 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-400 hidden md:block" />
                  <button
                    disabled={transmitting}
                    onClick={transmitRevision}
                    className="w-full bg-white text-zinc-900 border border-zinc-200 h-14 md:h-auto py-4 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-zinc-900 hover:text-white active:bg-zinc-800 transition-all relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {transmitting ? "TRANSMITTING..." : <>TRANSMIT_REVISED_PACK <ArrowUpRight size={14} /></>}
                  </button>
                </div>
              </div>
            ) : status === "VALIDATED" ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="relative group/btn">
                  <div className="absolute -top-2 -left-4 w-12 h-px bg-zinc-300 transition-all group-hover/btn:w-16 group-hover/btn:bg-zinc-400 hidden md:block" />
                  <div className="absolute -top-4 -left-2 w-px h-12 bg-zinc-300 transition-all group-hover/btn:h-16 group-hover/btn:bg-zinc-400 hidden md:block" />
                  {docType === "Digital" ? (
                    <button className="w-full bg-zinc-900 text-white border border-zinc-800 h-16 md:h-auto py-5 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-zinc-900 hover:border-zinc-200 transition-all relative z-10">
                      <Download size={16} className="opacity-70" /> [ DOWNLOAD_SECURE_PAYLOAD ]
                    </button>
                  ) : (
                    <button className="w-full bg-zinc-900 text-white border border-zinc-800 h-16 md:h-auto py-5 font-mono font-bold tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-white hover:text-zinc-900 hover:border-zinc-200 transition-all relative z-10">
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
            ) : null}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
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
