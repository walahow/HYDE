import { PDFDocument, degrees } from "pdf-lib";

// ── Types ────────────────────────────────────────────────────────────────────

export interface PlacedSignature {
  /** Client-side UUID for list management / deletion */
  id: string;
  /** ID of the file this signature belongs to */
  fileId: string;
  /** 1-indexed page number this signature is anchored to */
  page: number;
  /** Base64 data URL of the signature image */
  imageDataUrl: string;
  x: number;          // center-X as % of page width
  y: number;          // center-Y as % of page height
  scale: number;
  sigWidthPct: number;
  sigHeightPct: number;
  rotation: number;
}

// ── Shared helper ─────────────────────────────────────────────────────────────

function drawSigOnPage(
  page: ReturnType<PDFDocument["getPages"]>[number],
  sigImg: Awaited<ReturnType<PDFDocument["embedPng"]>>,
  placement: Pick<PlacedSignature, "x" | "y" | "sigWidthPct" | "sigHeightPct" | "rotation">
) {
  const { width, height } = page.getSize();

  const sigWidth  = width  * (placement.sigWidthPct  / 100);
  const sigHeight = height * (placement.sigHeightPct / 100);

  const cx = (placement.x / 100) * width;
  const cy = height - (placement.y / 100) * height;

  const angleRad = (-placement.rotation * Math.PI) / 180;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  // Bottom-left corner position so that center of the image lands on (cx, cy)
  const drawX = cx - (sigWidth / 2) * cosA + (sigHeight / 2) * sinA;
  const drawY = cy - (sigWidth / 2) * sinA - (sigHeight / 2) * cosA;

  page.drawImage(sigImg, {
    x: drawX,
    y: drawY,
    width: sigWidth,
    height: sigHeight,
    rotate: degrees(-placement.rotation),
  });
}

// ── Single-signature (backward compat) ───────────────────────────────────────

/**
 * Bakes ONE signature image into a PDF at the specified position.
 */
export async function bakeSignatureIntoPdf(
  pdfUrl: string,
  signatureBase64: string,
  position: { 
    x: number; 
    y: number; 
    scale: number; 
    sigWidthPct?: number; 
    sigHeightPct?: number; 
    rotation?: number 
  },
  pageIndex: number = 0
): Promise<Blob> {
  const fetchUrl = pdfUrl.includes("vercel-storage.com") 
    ? `/api/blob/proxy?url=${encodeURIComponent(pdfUrl)}` 
    : pdfUrl;
    
  const existingPdfBytes = await fetch(fetchUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const signatureImageBytes = await fetch(signatureBase64).then((res) => res.arrayBuffer());
  let signatureImage;
  try {
    signatureImage = await pdfDoc.embedPng(signatureImageBytes);
  } catch (_) {
    signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
  }

  const pages = pdfDoc.getPages();
  const targetPage = pages[pageIndex] ?? pages[0];

  drawSigOnPage(targetPage, signatureImage, {
    x: position.x,
    y: position.y,
    sigWidthPct: position.sigWidthPct ?? 20,
    sigHeightPct: position.sigHeightPct ?? 10,
    rotation: position.rotation ?? 0,
  });

  console.log(`[PDF_BAKE] page=${pageIndex + 1} x=${position.x.toFixed(1)}% y=${position.y.toFixed(1)}% rot=${position.rotation ?? 0}deg`);

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as any], { type: "application/pdf" });
}

// ── Multi-signature (new) ─────────────────────────────────────────────────────

/**
 * Bakes multiple signatures (potentially on different pages) into a PDF in a
 * single load/save pass. Deduplicates image embedding via a cache keyed by dataUrl.
 */
export async function bakeMultipleSignatures(
  pdfUrl: string,
  placements: PlacedSignature[]
): Promise<Blob> {
  if (placements.length === 0) throw new Error("No placements provided");

  const fetchUrl = pdfUrl.includes("vercel-storage.com")
    ? `/api/blob/proxy?url=${encodeURIComponent(pdfUrl)}`
    : pdfUrl;

  const existingPdfBytes = await fetch(fetchUrl).then((r) => r.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  // Cache: dataUrl → embedded image (avoid re-embedding the same signature)
  const embedCache = new Map<string, Awaited<ReturnType<typeof pdfDoc.embedPng>>>();

  for (const placement of placements) {
    let sigImg = embedCache.get(placement.imageDataUrl);
    if (!sigImg) {
      const imgBytes = await fetch(placement.imageDataUrl).then((r) => r.arrayBuffer());
      try {
        sigImg = await pdfDoc.embedPng(imgBytes);
      } catch {
        sigImg = await pdfDoc.embedJpg(imgBytes);
      }
      embedCache.set(placement.imageDataUrl, sigImg);
    }

    const pageIdx = Math.min(placement.page - 1, pages.length - 1);
    console.log(`[PDF_BAKE_MULTI] page=${placement.page} x=${placement.x.toFixed(1)}% y=${placement.y.toFixed(1)}% rot=${placement.rotation}deg`);
    drawSigOnPage(pages[pageIdx], sigImg, placement);
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as any], { type: "application/pdf" });
}
