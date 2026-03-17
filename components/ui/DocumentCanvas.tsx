"use client";

import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion } from "framer-motion";
import { Upload, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

// Set worker URL for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentCanvasProps {
  fileUrl: string | null;
  isViewOnly?: boolean;
  onSignatureMove?: (pos: { x: number; y: number; scale: number; sigWidthPct: number }) => void;
  onPageChange?: (page: number) => void;
  appliedSignature?: string | null;
  signaturePosition?: { x: number; y: number; scale: number } | null;
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
  const [scale, setScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

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
              {Math.round(scale * 100)}%
            </span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-white transition-colors">
              <ZoomIn size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 w-full flex justify-center p-4 md:p-8 overflow-auto bg-[#f0f0f2] relative cursor-grab active:cursor-grabbing scrollbar-hide">
        {!fileUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center font-mono opacity-20">
            <FileText size={64} className="mb-4" />
            <p className="text-xs uppercase tracking-[0.3em]">No Document Loaded</p>
          </div>
        ) : (
          <div className="relative shadow-2xl bg-white">
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
              <Page
                inputRef={canvasWrapperRef}
                pageNumber={pageNumber}
                scale={scale}
                width={containerWidth > 0 ? containerWidth : undefined}
                className="max-w-full"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              >
                {/* SIGNATURE OVERLAY (Moved inside Page for absolute alignment) */}
                {(appliedSignature || (!isViewOnly && appliedSignature)) && (
                  <motion.div
                    drag={!isViewOnly}
                    dragMomentum={false}
                    onDragEnd={(event, info) => {
                       if (!isViewOnly && onSignatureMove && canvasWrapperRef.current) {
                          const canvasRect = canvasWrapperRef.current.getBoundingClientRect();
                          // Find the actual signature element to get its real center
                          // @ts-ignore
                          const sigElement = event.target as HTMLElement;
                          const sigRect = sigElement.getBoundingClientRect();
                          
                          // Calculate center of signature relative to canvas
                          const centerX = (sigRect.left + sigRect.width / 2) - canvasRect.left;
                          const centerY = (sigRect.top + sigRect.height / 2) - canvasRect.top;
                          
                          const x = (centerX / canvasRect.width) * 100;
                          const y = (centerY / canvasRect.height) * 100;
                          const sigWidthPct = (sigRect.width / canvasRect.width) * 100;
                          
                          onSignatureMove({ x, y, scale, sigWidthPct });
                       }
                    }}
                    animate={signaturePosition ? {
                        left: `${signaturePosition.x}%`,
                        top: `${signaturePosition.y}%`,
                        x: "-50%", // Centering + Reset drag transform
                        y: "-50%",
                    } : { 
                        left: "50%", 
                        top: "80%",
                        x: "-50%",
                        y: "-50%",
                    }}
                    style={{
                      position: "absolute",
                      transformOrigin: "center center",
                      cursor: isViewOnly ? "default" : "move",
                      zIndex: 30,
                    }}
                    className="w-32 h-16 pointer-events-auto"
                  >
                    <div className="w-full h-full relative group">
                      <img 
                        src={appliedSignature || "/api/placeholder/signature"} 
                        alt="Signature" 
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                      {!isViewOnly && (
                        <div className="absolute inset-0 border-2 border-dashed border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </motion.div>
                )}
              </Page>
            </Document>
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
