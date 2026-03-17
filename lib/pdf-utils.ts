import { PDFDocument } from "pdf-lib";

/**
 * Bakes a signature image into a PDF at the specified position.
 * @param pdfUrl The URL of the original PDF
 * @param signatureBase64 The base64 string of the signature image
 * @param position { x: %, y: %, scale: number }
 * @returns A Blob of the new signed PDF
 */
export async function bakeSignatureIntoPdf(
  pdfUrl: string,
  signatureBase64: string,
  position: { x: number; y: number; scale: number; sigWidthPct?: number },
  pageIndex: number = 0
): Promise<Blob> {
  // ... rest of loading logic ...
  const fetchUrl = pdfUrl.includes("vercel-storage.com") 
    ? `/api/blob/proxy?url=${encodeURIComponent(pdfUrl)}` 
    : pdfUrl;
    
  const existingPdfBytes = await fetch(fetchUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const signatureImageBytes = await fetch(signatureBase64).then((res) => res.arrayBuffer());
  let signatureImage;
  try {
    signatureImage = await pdfDoc.embedPng(signatureImageBytes);
  } catch (e) {
    signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
  }

  const pages = pdfDoc.getPages();
  const targetPage = pages[pageIndex] || pages[0];
  const { width, height } = targetPage.getSize();

  // 4. Calculate size using the percentage from the UI
  // If no percentage is provided, fallback to 20% of page width
  const sigWidth = width * ((position.sigWidthPct || 20) / 100);
  const sigHeight = (sigWidth / signatureImage.width) * signatureImage.height;

  // 5. Calculate coordinates (x, y are % from top-left of page)
  const x = (position.x / 100) * width - sigWidth / 2;
  const y = height - (position.y / 100) * height - sigHeight / 2;

  console.log(`[PDF_BAKE] Drawing sig at: x=${x.toFixed(2)}, y=${y.toFixed(2)} on page ${pageIndex + 1}`);

  // 6. Draw the image
  targetPage.drawImage(signatureImage, {
    x,
    y,
    width: sigWidth,
    height: sigHeight,
  });

  // 7. Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as any], { type: "application/pdf" });
}
