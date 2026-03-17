"use client";

import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, useMotionValue } from "framer-motion";
import { Upload, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

// Set worker URL for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentCanvasProps {
  fileUrl: string | null;
  isViewOnly?: boolean;
  onSignatureMove?: (pos: { 
    x: number; 
    y: number; 
    scale: number; 
    sigWidthPct: number; 
    sigHeightPct: number; 
    rotation: number 
  }) => void;
  onPageChange?: (page: number) => void;
  appliedSignature?: string | null;
  signaturePosition?: { 
    x: number; 
    y: number; 
    scale: number; 
    sigWidthPct?: number; 
    sigHeightPct?: number; 
    rotation?: number 
  } | null;
}

export default function DocumentCanvas({
  fileUrl,
  isViewOnly = true,
  onSignatureMove,
  onPageChange,
  appliedSignature,
  signaturePosition,
}: DocumentCanvasProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0.5); // Default to 0.5 (which we'll display as 100%)
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfPageRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Motion values for absolute pixel positioning (Absolute Pixel Sync)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Resize & Rotation State
  const [sigSize, setSigSize] = useState({ width: 128, height: 64 });
  const [sigRotation, setSigRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(2); // Default 2:1
  const [isInteracting, setIsInteracting] = useState(false);

  // Refs for stale-free pointer handling
  const sigSizeRef = useRef(sigSize);
  const sigRotationRef = useRef(sigRotation);
  const aspectRatioRef = useRef(aspectRatio);

  useEffect(() => { sigSizeRef.current = sigSize; }, [sigSize]);
  useEffect(() => { sigRotationRef.current = sigRotation; }, [sigRotation]);
  useEffect(() => { aspectRatioRef.current = aspectRatio; }, [aspectRatio]);

  // Detect natural aspect ratio of the signature
  useEffect(() => {
    if (!appliedSignature) return;
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      setAspectRatio(ratio);
      
      // If we don't have a restored size, adjust default to match ratio
      if (!signaturePosition?.sigWidthPct) {
        setSigSize((prev) => ({ ...prev, height: prev.width / ratio }));
      }
    };
    img.src = appliedSignature;
  }, [appliedSignature]);

  // Constants (Initial defaults)
  const SIG_W_DEFAULT = 128;
  const SIG_H_DEFAULT = 64;

  // Two-Way Sync: Update pixel motion values/size/rotation when props change
  useEffect(() => {
    if (!pdfPageRef.current) return;
    const pdfRect = pdfPageRef.current.getBoundingClientRect();
    
    // Restore size from percentages if available
    const restoredWidth = signaturePosition?.sigWidthPct 
      ? (signaturePosition.sigWidthPct / 100) * pdfRect.width 
      : SIG_W_DEFAULT;
    const restoredHeight = signaturePosition?.sigHeightPct 
      ? (signaturePosition.sigHeightPct / 100) * pdfRect.height 
      : SIG_H_DEFAULT;
      
    if (signaturePosition?.sigWidthPct) {
      setSigSize({ width: restoredWidth, height: restoredHeight });
    }
    
    if (typeof signaturePosition?.rotation === "number") {
      setSigRotation(signaturePosition.rotation);
    }

    // Centering Math: align center point
    const targetCenterX = ((signaturePosition?.x ?? 50) / 100) * pdfRect.width;
    const targetCenterY = ((signaturePosition?.y ?? 10) / 100) * pdfRect.height;
    
    x.set(targetCenterX - restoredWidth / 2);
    y.set(targetCenterY - restoredHeight / 2);
  }, [signaturePosition?.x, signaturePosition?.y, signaturePosition?.sigWidthPct, signaturePosition?.sigHeightPct, signaturePosition?.rotation, containerWidth, numPages, scale]);

  // Sync initial page
  useEffect(() => {
    onPageChange?.(pageNumber);
  }, []);

  // Resize handler to make PDF responsive
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 64); // Padding adjustment
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  // Resize Handler
  const handleResizePointerDown = (e: React.PointerEvent, corner: string) => {
    if (isViewOnly) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsInteracting(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { ...sigSizeRef.current };

    const onMove = (moveE: PointerEvent) => {
      const dx = moveE.clientX - startX;
      const dy = moveE.clientY - startY;

      const rotRad = (sigRotationRef.current * Math.PI) / 180;
      const localDx = dx * Math.cos(rotRad) + dy * Math.sin(rotRad);
      const localDy = -dx * Math.sin(rotRad) + dy * Math.cos(rotRad);

      let newWidth = startSize.width;
      let newHeight = startSize.height;
      const ratio = aspectRatioRef.current;

      // Symmetric resizing from center
      const factorX = corner.includes("e") ? 1 : (corner.includes("w") ? -1 : 0);
      const factorY = corner.includes("s") ? 1 : (corner.includes("n") ? -1 : 0);

      // If dragging a corner (diagonal), use the larger delta to drive scale
      if (factorX !== 0 && factorY !== 0) {
        const deltaX = localDx * factorX * 2;
        const deltaY = localDy * factorY * 2;
        
        // Match the aspect ratio by choosing the larger scale change
        const scaleX = (startSize.width + deltaX) / startSize.width;
        const scaleY = (startSize.height + deltaY) / startSize.height;
        const scale = Math.max(scaleX, scaleY);
        
        newWidth = Math.max(48, startSize.width * scale);
        newHeight = newWidth / ratio;
      } 
      // Side-only resize (if applicable, though we only have corners)
      else if (factorX !== 0) {
        newWidth = Math.max(48, startSize.width + localDx * 2 * factorX);
        newHeight = newWidth / ratio;
      } else if (factorY !== 0) {
        newHeight = Math.max(24, startSize.height + localDy * 2 * factorY);
        newWidth = newHeight * ratio;
      }

      setSigSize({ width: newWidth, height: newHeight });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setIsInteracting(false);
      handleDragEnd();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Rotation Handler
  const handleRotatePointerDown = (e: React.PointerEvent) => {
    if (isViewOnly) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsInteracting(true);

    const rect = signatureRef.current!.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const onMove = (moveE: PointerEvent) => {
      const angle = Math.atan2(moveE.clientY - centerY, moveE.clientX - centerX) * (180 / Math.PI) + 90;
      setSigRotation(angle);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setIsInteracting(false);
      handleDragEnd();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleDragEnd = () => {
    if (!isViewOnly && onSignatureMove && pdfPageRef.current && signatureRef.current) {
      const pdfEl = pdfPageRef.current;
      const pdfRect = pdfEl.getBoundingClientRect();
      const sigRect = signatureRef.current.getBoundingClientRect();

      const centerX = (sigRect.left + sigRect.width / 2) - pdfRect.left;
      const centerY = (sigRect.top + sigRect.height / 2) - pdfRect.top;

      onSignatureMove({
        x: (centerX / pdfRect.width) * 100,
        y: (centerY / pdfRect.height) * 100,
        scale,
        sigWidthPct: (sigRect.width / pdfRect.width) * 100,
        sigHeightPct: (sigRect.height / pdfRect.height) * 100,
        rotation: sigRotationRef.current,
      });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center gap-4">
      {/* TOOLBAR */}
      <div className="w-full h-12 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border border-zinc-200 p-1 bg-zinc-50">
            <button
              onClick={() => {
                const next = Math.max(pageNumber - 1, 1);
                setPageNumber(next);
                onPageChange?.(next);
              }}
              disabled={pageNumber <= 1}
              className="p-1 hover:bg-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-[10px] px-2 min-w-[60px] text-center border-x border-zinc-200">
              {pageNumber} / {numPages || "--"}
            </span>
            <button
              onClick={() => {
                const next = Math.min(pageNumber + 1, numPages || 1);
                setPageNumber(next);
                onPageChange?.(next);
              }}
              disabled={pageNumber >= (numPages || 1)}
              className="p-1 hover:bg-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 border border-zinc-200 p-1 bg-zinc-50">
            <button onClick={handleZoomOut} className="p-1 hover:bg-white transition-colors">
              <ZoomOut size={16} />
            </button>
            <span className="font-mono text-[10px] px-2 min-w-[40px] text-center border-x border-zinc-200">
              {Math.round(scale * 200)}%
            </span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-white transition-colors">
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CANVAS AREA (Expanded Viewer Ref for Drag Constraints) */}
      <div ref={viewerRef} className="flex-1 w-full flex justify-center p-4 md:p-8 overflow-auto bg-[#f0f0f2] relative cursor-grab active:cursor-grabbing scrollbar-hide">
        {!fileUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center font-mono opacity-20">
            <FileText size={64} className="mb-4" />
            <p className="text-xs uppercase tracking-[0.3em]">No Document Loaded</p>
          </div>
        ) : (
          <div className="relative shadow-2xl bg-white">
            <div ref={pdfPageRef} className="relative flex flex-col gap-4 bg-zinc-100 p-0 m-0">
              <Document
                file={fileUrl.includes("vercel-storage.com") ? `/api/blob/proxy?url=${encodeURIComponent(fileUrl)}` : fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
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
                {/* Render all pages for continuous scroll and unrestricted movement */}
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <div key={`page_${i + 1}`} className="shadow-lg bg-white">
                    <Page
                      pageNumber={i + 1}
                      scale={scale}
                      width={containerWidth > 0 ? containerWidth : undefined}
                      className="max-w-full"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
              </Document>

              {/* SIGNATURE OVERLAY (Resize + Rotate + Pixel Sync) */}
              {appliedSignature && (
                <motion.div
                  ref={signatureRef}
                  drag={!isViewOnly && !isInteracting}
                  dragMomentum={false}
                  dragElastic={0}
                  onDragEnd={handleDragEnd}
                  style={{
                    x,
                    y,
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: sigSize.width,
                    height: sigSize.height,
                    cursor: isViewOnly ? "default" : "move",
                    zIndex: 30,
                  }}
                  className="pointer-events-auto"
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      transform: `rotate(${sigRotation}deg)`,
                      position: "relative",
                    }}
                  >
                    <img
                      src={appliedSignature}
                      alt="Signature"
                      className="w-full h-full object-contain mix-blend-multiply"
                      draggable={false}
                    />

                    {!isViewOnly && (
                      <>
                        <div className="absolute inset-0 border-2 border-dashed border-blue-400 group-hover:border-solid transition-colors" />
                        
                        {/* Resize Handles */}
                        {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                          <div
                            key={corner}
                            onPointerDown={(e) => handleResizePointerDown(e, corner)}
                            style={{
                              position: "absolute",
                              width: 12,
                              height: 12,
                              background: "white",
                              border: "2px solid #3b82f6",
                              borderRadius: "50%",
                              cursor: `${corner}-resize`,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              ...(corner.includes("n") ? { top: -6 } : { bottom: -6 }),
                              ...(corner.includes("w") ? { left: -6 } : { right: -6 }),
                              zIndex: 40,
                            }}
                          />
                        ))}

                        {/* Rotation Handle */}
                        <div
                          onPointerDown={handleRotatePointerDown}
                          style={{
                            position: "absolute",
                            top: -30,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 20,
                            height: 20,
                            background: "white",
                            border: "2px solid #3b82f6",
                            borderRadius: "50%",
                            cursor: "grab",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            zIndex: 40,
                          }}
                        >
                          ↻
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            top: -18,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 1,
                            height: 12,
                            background: "#3b82f6",
                            pointerEvents: "none",
                          }}
                        />
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="w-full bg-zinc-900 text-zinc-500 font-mono text-[8px] px-4 py-1 flex justify-between tracking-widest shrink-0">
        <span>RENDER_ENGINE: REACT-PDF_V9.0.0</span>
        <span>ENCRYPTION: AES-256-GCM_ACTIVE</span>
      </div>
    </div>
  );
}
