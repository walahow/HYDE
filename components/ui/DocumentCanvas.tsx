"use client";

import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, useMotionValue } from "framer-motion";
import { FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, X } from "lucide-react";
import type { PlacedSignature } from "@/lib/pdf-utils";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ── PlacementOverlay ─────────────────────────────────────────────────────────
// Each anchored signature has its own drag/resize/rotate state.

interface PlacementOverlayProps {
  placement: PlacedSignature;
  pageRef: React.RefObject<HTMLDivElement | null>;
  isViewOnly: boolean;
  scale: number;
  /** Incremented each time the PDF page fully renders — triggers position re-init */
  renderToken: number;
  onUpdate: (id: string, data: Omit<PlacedSignature, "id" | "fileId" | "page" | "imageDataUrl">) => void;
  onDelete: (id: string) => void;
}

function PlacementOverlay({ placement, pageRef, isViewOnly, scale, renderToken, onUpdate, onDelete }: PlacementOverlayProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [size, setSize] = useState({ width: 128, height: 64 });
  const [rotation, setRotation] = useState(placement.rotation ?? 0);
  const [isInteracting, setIsInteracting] = useState(false);
  const selfRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef(size);
  const rotRef = useRef(rotation);
  const aspectRatioRef = useRef(2);

  useEffect(() => { sizeRef.current = size; }, [size]);
  useEffect(() => { rotRef.current = rotation; }, [rotation]);

  // Load natural aspect ratio once — also sets the correct initial size on first mount
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      aspectRatioRef.current = ratio;

      // Only auto-size if this is a fresh placement (sentinel -1 means "not yet sized")
      if (placement.sigWidthPct === -1 && placement.sigHeightPct === -1) {
        const el = pageRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const targetWidth = rect.width > 0 ? rect.width * 0.20 : 160;
        const targetHeight = targetWidth / ratio;
        setSize({ width: targetWidth, height: targetHeight });
        sizeRef.current = { width: targetWidth, height: targetHeight };
      }
    };
    img.src = placement.imageDataUrl;
  }, [placement.imageDataUrl]); // eslint-disable-line

  // Init pixel position/size from % values.
  // Depends on renderToken so it re-fires AFTER the PDF page has fully rendered
  // and pdfPageRef has its real dimensions (not the loading skeleton's).
  // Skip if sigWidthPct === -1 (fresh placement awaiting image load to auto-size).
  useEffect(() => {
    if (placement.sigWidthPct === -1) return; // not yet sized — let the image-load effect handle it
    const el = pageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const w = (placement.sigWidthPct / 100) * rect.width;
    const h = (placement.sigHeightPct / 100) * rect.height;
    setSize({ width: w, height: h });
    sizeRef.current = { width: w, height: h };
    x.set((placement.x / 100) * rect.width - w / 2);
    y.set((placement.y / 100) * rect.height - h / 2);
  }, [placement.x, placement.y, placement.sigWidthPct, placement.sigHeightPct, scale, renderToken]);

  useEffect(() => {
    setRotation(placement.rotation ?? 0);
    rotRef.current = placement.rotation ?? 0;
  }, [placement.rotation]);

  const reportUpdate = () => {
    if (!pageRef.current || !selfRef.current) return;
    const pdfRect = pageRef.current.getBoundingClientRect();
    const sigRect = selfRef.current.getBoundingClientRect();
    const cx = sigRect.left + sigRect.width / 2 - pdfRect.left;
    const cy = sigRect.top  + sigRect.height / 2 - pdfRect.top;
    onUpdate(placement.id, {
      x: (cx / pdfRect.width) * 100,
      y: (cy / pdfRect.height) * 100,
      scale,
      sigWidthPct:  (sizeRef.current.width  / pdfRect.width)  * 100,
      sigHeightPct: (sizeRef.current.height / pdfRect.height) * 100,
      rotation: rotRef.current,
    });
  };

  // ── Resize ────────────────────────────────────────────────────────────────
  const handleResizePointerDown = (e: React.PointerEvent, corner: string) => {
    if (isViewOnly) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsInteracting(true);
    const startX = e.clientX, startY = e.clientY;
    const startSize = { ...sizeRef.current };
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      const rad = (rotRef.current * Math.PI) / 180;
      const lx = dx * Math.cos(rad) + dy * Math.sin(rad);
      const ly = -dx * Math.sin(rad) + dy * Math.cos(rad);
      const fx = corner.includes("e") ? 1 : corner.includes("w") ? -1 : 0;
      const fy = corner.includes("s") ? 1 : corner.includes("n") ? -1 : 0;
      const ratio = aspectRatioRef.current;
      let w = startSize.width, h = startSize.height;
      if (fx !== 0 && fy !== 0) {
        const s = Math.max(
          (startSize.width  + lx * fx * 2) / startSize.width,
          (startSize.height + ly * fy * 2) / startSize.height
        );
        w = Math.max(48, startSize.width * s); h = w / ratio;
      } else if (fx !== 0) {
        w = Math.max(48, startSize.width + lx * 2 * fx); h = w / ratio;
      } else if (fy !== 0) {
        h = Math.max(24, startSize.height + ly * 2 * fy); w = h * ratio;
      }
      setSize({ width: w, height: h });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setIsInteracting(false);
      reportUpdate();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // ── Rotate ────────────────────────────────────────────────────────────────
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    if (isViewOnly) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsInteracting(true);
    const rect = selfRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const onMove = (ev: PointerEvent) =>
      setRotation(Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setIsInteracting(false);
      reportUpdate();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <motion.div
      ref={selfRef}
      drag={!isViewOnly && !isInteracting}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={reportUpdate}
      style={{
        x, y,
        position: "absolute", left: 0, top: 0,
        width: size.width, height: size.height,
        cursor: isViewOnly ? "default" : "move",
        zIndex: 30,
      }}
      className="pointer-events-auto"
    >
      <div style={{ width: "100%", height: "100%", transform: `rotate(${rotation}deg)`, position: "relative" }}>
        <img
          src={placement.imageDataUrl}
          alt="Signature"
          className="w-full h-full object-contain mix-blend-multiply"
          draggable={false}
        />

        {!isViewOnly && (
          <>
            <div className="absolute inset-0 border-2 border-dashed border-blue-400" />

            {/* ── Delete button — top-left ─────────────────────────────── */}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(placement.id); }}
              style={{ position: "absolute", top: -10, left: -10, zIndex: 50 }}
              className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md pointer-events-auto hover:bg-red-700 transition-colors"
            >
              <X size={10} />
            </button>

            {/* ── Resize handles ──────────────────────────────────────── */}
            {(["nw", "ne", "sw", "se"] as const).map((corner) => (
              <div
                key={corner}
                onPointerDown={(e) => handleResizePointerDown(e, corner)}
                style={{
                  position: "absolute", width: 12, height: 12,
                  background: "white", border: "2px solid #3b82f6", borderRadius: "50%",
                  cursor: `${corner}-resize`, boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  ...(corner.includes("n") ? { top: -6 } : { bottom: -6 }),
                  ...(corner.includes("w") ? { left: -6 } : { right: -6 }),
                  zIndex: 40,
                }}
              />
            ))}

            {/* ── Rotation handle ─────────────────────────────────────── */}
            <div
              onPointerDown={handleRotatePointerDown}
              style={{
                position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)",
                width: 20, height: 20, background: "white", border: "2px solid #3b82f6",
                borderRadius: "50%", cursor: "grab",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, boxShadow: "0 2px 4px rgba(0,0,0,0.1)", zIndex: 40,
              }}
            >↻</div>
            <div style={{
              position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)",
              width: 1, height: 12, background: "#3b82f6", pointerEvents: "none",
            }} />
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── DocumentCanvas ────────────────────────────────────────────────────────────

interface DocumentCanvasProps {
  fileUrl: string | null;
  isViewOnly?: boolean;
  /** The ID of the currently-viewed file — used to scope placements to this document */
  currentFileId?: string;
  placements?: PlacedSignature[];
  onUpdatePlacement?: (id: string, data: Omit<PlacedSignature, "id" | "fileId" | "page" | "imageDataUrl">) => void;
  onDeletePlacement?: (id: string) => void;
  onPageChange?: (page: number) => void;
}

export default function DocumentCanvas({
  fileUrl,
  isViewOnly = true,
  currentFileId,
  placements = [],
  onUpdatePlacement,
  onDeletePlacement,
  onPageChange,
}: DocumentCanvasProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0.5);
  const [containerWidth, setContainerWidth] = useState(0);
  /** Incremented each time a PDF page finishes rendering — drives PlacementOverlay re-init */
  const [renderToken, setRenderToken] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfPageRef = useRef<HTMLDivElement>(null);

  useEffect(() => { onPageChange?.(pageNumber); }, []); // eslint-disable-line

  // Reset to page 1 when the document changes — prevents "Invalid page request"
  // when the new doc has fewer pages than the previous pageNumber
  useEffect(() => {
    setPageNumber(1);
    setNumPages(null);
    onPageChange?.(1);
  }, [fileUrl]); // eslint-disable-line

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerWidth(containerRef.current.clientWidth - 64);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goToPage = (n: number) => { setPageNumber(n); onPageChange?.(n); };
  const handleZoomIn  = () => setScale((p) => Math.min(p + 0.2, 3.0));
  const handleZoomOut = () => setScale((p) => Math.max(p - 0.2, 0.5));

  // Only show placements that belong to this document AND this page
  const pagePlacements = placements.filter(
    (p) => p.fileId === currentFileId && p.page === pageNumber
  );

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col">
      {/* ── TOOLBAR ───────────────────────────────────────────────────────── */}
      <div className="w-full h-12 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20 sticky top-0 gap-2">
        <div className="flex items-center gap-2">
          {/* Page navigation */}
          <div className="flex items-center gap-1 border border-zinc-200 p-1 bg-zinc-50">
            <button onClick={() => goToPage(Math.max(pageNumber - 1, 1))} disabled={pageNumber <= 1}
              className="p-1 hover:bg-white disabled:opacity-30 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-[10px] px-2 min-w-[60px] text-center border-x border-zinc-200">
              {pageNumber} / {numPages || "--"}
            </span>
            <button onClick={() => goToPage(Math.min(pageNumber + 1, numPages || 1))} disabled={pageNumber >= (numPages || 1)}
              className="p-1 hover:bg-white disabled:opacity-30 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Placement count */}
          {!isViewOnly && placements.length > 0 && (
            <span className="font-mono text-[9px] text-zinc-400 border border-zinc-200 px-2 py-1 bg-zinc-50">
              {placements.length} SIG{placements.length !== 1 ? "S" : ""} TOTAL
            </span>
          )}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 border border-zinc-200 p-1 bg-zinc-50">
          <button onClick={handleZoomOut} className="p-1 hover:bg-white transition-colors"><ZoomOut size={16} /></button>
          <span className="font-mono text-[10px] px-2 min-w-[40px] text-center border-x border-zinc-200">
            {Math.round(scale * 200)}%
          </span>
          <button onClick={handleZoomIn} className="p-1 hover:bg-white transition-colors"><ZoomIn size={16} /></button>
        </div>
      </div>

      {/* ── CANVAS AREA ───────────────────────────────────────────────────── */}
      <div className="flex-1 w-full flex justify-center p-4 md:p-8 overflow-auto bg-[#f0f0f2] scrollbar-hide">
        {!fileUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center font-mono opacity-20">
            <FileText size={64} className="mb-4" />
            <p className="text-xs uppercase tracking-[0.3em]">No Document Loaded</p>
          </div>
        ) : (
          <div className="relative shadow-2xl bg-white">
            <div ref={pdfPageRef} className="relative">
              <Document
                file={fileUrl.includes("vercel-storage.com") ? `/api/blob/proxy?url=${encodeURIComponent(fileUrl)}` : fileUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="w-[600px] h-[800px] flex items-center justify-center bg-white border border-zinc-200 font-mono text-[10px] text-zinc-400 gap-3">
                    <Loader2 className="animate-spin" size={16} /> LOAD_SEQUENCE_INITIATED...
                  </div>
                }
                error={
                  <div className="w-[600px] h-[800px] flex items-center justify-center bg-white border border-red-200 font-mono text-[10px] text-red-400">
                    ERROR_LOAD_FAILED: UNABLE_TO_FETCH_BLOB
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  width={containerWidth > 0 ? containerWidth : undefined}
                  className="max-w-full"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onRenderSuccess={() => setRenderToken((t) => t + 1)}
                />
              </Document>

              {/* ── Placements for the current page ─────────────────────── */}
              {pagePlacements.map((p) => (
                <PlacementOverlay
                  key={p.id}
                  placement={p}
                  pageRef={pdfPageRef}
                  isViewOnly={isViewOnly}
                  scale={scale}
                  renderToken={renderToken}
                  onUpdate={onUpdatePlacement ?? (() => {})}
                  onDelete={onDeletePlacement ?? (() => {})}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── STATUS BAR ────────────────────────────────────────────────────── */}
      <div className="w-full bg-zinc-900 text-zinc-500 font-mono text-[8px] px-4 py-1 flex justify-between tracking-widest shrink-0">
        <span>RENDER_ENGINE: REACT-PDF_V9.0.0</span>
        <span>ENCRYPTION: AES-256-GCM_ACTIVE</span>
      </div>
    </div>
  );
}
