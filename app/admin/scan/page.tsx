"use client";

import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { 
  QrCode, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowLeft, 
  Camera,
  Loader2,
  Calendar,
  User,
  FileText,
  MapPin
} from "lucide-react";
import { InteractiveBackground } from "@/components/ui/InteractiveBackground";
import TopNavbar from "@/components/ui/TopNavbar";
import Link from "next/link";

type ScanState = "SCANNING" | "SUCCESS" | "ERROR";

interface ScanResult {
  message: string;
  transaction: {
    id: string;
    documentType: string;
    scannedAt: string;
    completedAt: string;
    student: { name: string };
    admin: { destinationName: string };
  };
}

export default function AdminScanPage() {
  const [state, setState] = useState<ScanState>("SCANNING");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedId = useRef<string | null>(null);

  useEffect(() => {
    if (state === "SCANNING") {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [state]);

  async function startScanner() {
    try {
      // Check for secure context (HTTPS/localhost)
      if (typeof window !== "undefined" && !window.isSecureContext && window.location.hostname !== "localhost") {
        handleError("Kamera memerlukan koneksi aman (HTTPS). Gunakan fallback upload file di bawah.");
        return;
      }

      // Small delay to ensure the DOM element is ready
      await new Promise(r => setTimeout(r, 100));
      
      const scanner = new Html5Qrcode("qr-reader", { 
        verbose: false, 
        experimentalFeatures: { useBarCodeDetectorIfSupported: true } 
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 } 
        },
        onScanSuccess,
        undefined
      );
    } catch (err: any) {
      console.error("Scanner start error:", err);
      // Detailed error message if possible
      let msg = "Gagal memulai kamera.";
      if (err?.message?.includes("NotSupportedError")) msg = "Browser ini tidak mendukung streaming kamera.";
      if (err?.message?.includes("NotAllowedError")) msg = "Izin kamera ditolak. Berikan izin lalu coba lagi.";
      
      handleError(msg);
    }
  }

  async function stopScanner() {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Scanner stop error:", err);
      }
    }
  }

  async function onScanSuccess(decodedText: string) {
    // Only process if not already processing
    if (isProcessing) return;

    // Logic: extract ID from https://{BASE_URL}/v/{id}
    // We can use a regex or URL parser
    let txId = "";
    try {
      const url = new URL(decodedText);
      const parts = url.pathname.split("/");
      // Path usually /v/[id]
      if (parts[1] === "v" && parts[2]) {
        txId = parts[2];
      }
    } catch (e) {
      // Fallback for raw IDs if any
      txId = decodedText.trim();
    }

    if (!txId || txId.length < 10) {
      handleError("QR_INVALID: Kode tidak dikenali sebagai ID transaksi HYDE.");
      return;
    }

    // Debounce: don't scan the same thing twice in a row if we just erred
    if (lastScannedId.current === txId && state === "ERROR") return;
    lastScannedId.current = txId;

    setIsProcessing(true);
    await stopScanner(); // Stop camera while processing

    try {
      const res = await fetch(`/api/transactions/${txId}/scan`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setState("SUCCESS");
      } else {
        const msg = data.error || data.message || "Terjadi kesalahan.";
        handleError(msg, res.status);
      }
    } catch (err) {
      handleError("Gagal menghubungi server. Periksa koneksi internet.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleError(msg: string, status?: number) {
    let finalMsg = msg;
    if (status === 403) finalMsg = "Anda bukan admin yang ditugaskan untuk transaksi ini.";
    if (status === 404) finalMsg = "Transaksi tidak ditemukan.";
    if (status === 400 && msg.includes("not awaiting")) finalMsg = "Dokumen ini tidak menunggu scan fisik (Status tidak sesuai).";
    
    setErrorMsg(finalMsg);
    setState("ERROR");
  }

  function resetScanner() {
    setErrorMsg("");
    setResult(null);
    lastScannedId.current = null;
    setState("SCANNING");
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    await stopScanner(); // Stop camera before file processing
    
    // If scanner instance doesn't exist, create a temporary one for file scanning
    const scanner = scannerRef.current || new Html5Qrcode("qr-reader", { 
      verbose: false, 
      experimentalFeatures: { useBarCodeDetectorIfSupported: true } 
    });
    scannerRef.current = scanner; // Reuse or store the instance
    try {
      const decodedText = await scanner.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err: any) {
      console.error("File scan error:", err);
      // NotFoundException is standard when it can't find a QR
      if (err?.toString()?.includes("NotFoundException") || err?.toString()?.includes("No MultiFormat Readers")) {
        handleError("QR Code tidak terdeteksi. Pastikan foto jelas, tidak silau, dan QR Code berada di tengah.");
      } else if (err?.toString()?.includes("SecurityError")) {
        handleError("Kesalahan keamanan browser. Coba gunakan browser lain atau mode HTTPS.");
      } else {
        handleError("Gagal memproses gambar. Pastikan format file sesuai.");
      }
    } finally {
      setIsProcessing(false);
      // Clear input so same file can be selected again
      e.target.value = "";
    }
  };

  return (
    <div className="relative h-screen w-screen flex flex-col bg-white overflow-hidden font-mono">
      <InteractiveBackground />

      <div className="relative z-10 flex flex-col h-full w-full">
        <TopNavbar />

        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md bg-white border border-zinc-200 shadow-[12px_12px_0px_0px_rgba(228,228,231,1)] relative overflow-hidden group/container transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[14px_14px_0px_0px_rgba(212,212,216,1)]">
            {/* Brutalist Header Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900" />
            <div className="absolute top-1 left-4 w-px h-8 bg-zinc-900" />
            <div className="absolute top-1 right-4 w-px h-8 bg-zinc-900" />

            <div className="p-8 pb-12">
              <div className="flex items-center gap-2 mb-8 justify-center">
                <QrCode size={18} className="text-zinc-400" />
                <h1 className="text-xs font-bold tracking-[0.3em] text-zinc-400 uppercase">
                  DISPOSISI_SCANNER_PROXIMITY
                </h1>
              </div>

              <div className={state === "SCANNING" ? "block" : "hidden"}>
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Viewfinder Container */}
                  <div className="relative aspect-square w-full max-w-[280px] mx-auto border-4 border-zinc-900 bg-zinc-50 overflow-hidden flex items-center justify-center">
                    <div id="qr-reader" className="w-full h-full" />
                    
                    {/* Viewfinder Overlay Ornaments */}
                    <div className="absolute inset-x-8 inset-y-8 border border-zinc-900/10 pointer-events-none" />
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-zinc-900" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-zinc-900" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-zinc-900" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-zinc-900" />
                    
                    {/* Scanning Animation Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] animate-scan-line pointer-events-none" />
                    
                    {isProcessing && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <Loader2 className="animate-spin text-zinc-900 mb-2" size={32} />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-900">VERIFYING_GATEWAY...</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-[11px] text-zinc-600 leading-relaxed font-medium uppercase tracking-tighter">
                      &gt; Arahkan kamera ke QR Code pada lembar disposisi cetak.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="flex items-center justify-center gap-2 text-zinc-300">
                        <div className="h-px w-8 bg-zinc-200" />
                        <Camera size={14} />
                        <div className="h-px w-8 bg-zinc-200" />
                      </div>
                      
                      <div className="relative w-full">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                          className="hidden" 
                          id="qr-upload-scanning"
                        />
                        <label 
                          htmlFor="qr-upload-scanning"
                          className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 cursor-pointer transition-colors flex items-center justify-center gap-2"
                        >
                          Atau upload foto QR <QrCode size={12} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Keep a hidden copy of qr-reader for ERROR state file uploads if needed, 
                  but actually keeping the main one in "hidden" block above is better.
                  We just need to make sure the ID is always there. */}

              {state === "SUCCESS" && result && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mb-6">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight leading-none mb-1">
                      KONFIRMASI_BERHASIL
                    </h2>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                      Physical_Receipt_Logged
                    </p>
                  </div>

                  <div className="bg-zinc-50 border border-zinc-200 p-5 space-y-4 relative">
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-zinc-300" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-zinc-300" />

                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest mb-1 flex items-center gap-1.5">
                          <User size={10} /> MAHASISWA
                        </span>
                        <span className="text-sm font-bold text-zinc-900 underline decoration-zinc-200 underline-offset-4 decoration-2">
                          {result.transaction.student.name}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest mb-1 flex items-center gap-1.5">
                          <FileText size={10} /> DOKUMEN
                        </span>
                        <span className="text-sm font-bold text-zinc-900 truncate">
                          {result.transaction.documentType}
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest mb-1 flex items-center gap-1.5">
                          <MapPin size={10} /> DESTINASI
                        </span>
                        <span className="text-sm font-bold text-zinc-900 uppercase tracking-tighter">
                          {result.transaction.admin.destinationName}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-zinc-200/50 mt-2">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-zinc-400 flex items-center gap-1 uppercase">
                            <Calendar size={10} /> Timestamp
                          </span>
                          <span className="text-zinc-600 font-bold">
                            {new Date(result.transaction.scannedAt).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="w-full h-14 bg-zinc-900 text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-colors shadow-[4px_4px_0px_0px_rgba(228,228,231,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    SCAN_DOKUMEN_LAIN <RefreshCw size={14} />
                  </button>
                </div>
              )}

              {state === "ERROR" && (
                <div className="space-y-8 animate-in zoom-in-95 duration-300">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 border-2 border-red-500 flex items-center justify-center mb-6">
                      <XCircle size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight leading-none mb-1">
                      GAGAL_PROSES
                    </h2>
                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">
                      Internal_Verify_Reject
                    </p>
                  </div>

                  <div className="p-6 bg-red-50/50 border border-red-100 flex flex-col gap-2 items-start">
                    <span className="text-[10px] font-bold text-red-700/50 uppercase tracking-[0.2em]">ERROR_MESSAGE:</span>
                    <p className="text-xs font-bold text-red-800 leading-relaxed italic">
                      &gt; "{errorMsg}"
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={resetScanner}
                      className="w-full h-14 bg-zinc-900 text-white font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-colors shadow-[4px_4px_0px_0px_rgba(228,228,231,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                    >
                      COBA_LAGI_KONFIRMASI <RefreshCw size={14} />
                    </button>

                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        id="qr-upload"
                      />
                      <label 
                        htmlFor="qr-upload"
                        className="w-full h-14 bg-white text-zinc-900 border-2 border-zinc-900 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-50 cursor-pointer transition-colors shadow-[4px_4px_0px_0px_rgba(228,228,231,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                      >
                        UPLOAD_GAMBAR_QR <Camera size={14} />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Brutalist Footer Stats */}
            <div className="px-8 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full ${state === "SCANNING" ? "bg-amber-500 animate-pulse" : state === "SUCCESS" ? "bg-emerald-500" : "bg-red-500"}`} />
                Status: {state}
              </span>
              <span className="text-[8px] font-mono text-zinc-300">
                HYDE_SEC_GATEWAY_v1.0
              </span>
            </div>
          </div>

          <Link 
            href="/admin" 
            className="mt-12 text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 hover:text-zinc-900 transition-colors group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>KEMBALI_KE_DASHBOARD</span>
          </Link>
        </main>
      </div>

      <style jsx global>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          animation: scan-line 3s linear infinite;
        }
        #qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 0 !important;
        }
        #qr-reader img {
          display: none !important;
        }
        #qr-reader__dashboard_section_csr button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
