import { PDFDocument, degrees } from "pdf-lib";

/**
 * Bakes a signature image into a PDF at the specified position.
 * @param pdfUrl The URL of the original PDF
 * @param signatureBase64 The base64 string of the signature image
 * @param position { x: %, y: %, scale: number, sigWidthPct?: number, sigHeightPct?: number, rotation?: number }
 * @returns A Blob of the new signed PDF
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
  } catch (e) {
    signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
  }

  const pages = pdfDoc.getPages();
  const targetPage = pages[pageIndex] || pages[0];
  const { width, height } = targetPage.getSize();

  // 4. Calculate size using the percentage from the UI
  const sigWidth = width * ((position.sigWidthPct || 20) / 100);
  const sigHeight = position.sigHeightPct 
    ? height * (position.sigHeightPct / 100)
    : (sigWidth / signatureImage.width) * signatureImage.height;

  // 5. Calculate center coordinates (UI center % -> PDF points)
  const cx = (position.x / 100) * width;
  const cy = height - (position.y / 100) * height; // PDF origin is bottom-left

  // 6. Calculate bottom-left corner (x, y) for drawImage
  // pdf-lib rotates around the (x, y) provided. 
  // To rotate around center, we need to offset the corner based on rotation.
  const rotation = position.rotation || 0;
  const rad = (rotation * Math.PI) / 180;
  
  // Since CSS rotation is clockwise and pdf-lib degrees() is counter-clockwise,
  // we use -rotation for the drawImage call.
  // The math below finds the bottom-left corner relative to the center after rotation.
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  // Pivot logic: x_corner = cx - (w/2 * cos + h/2 * sin) [if rotating clockwise]
  // Wait, standard rotation matrix for clockwise:
  // x' = x cos + y sin
  // y' = -x sin + y cos
  // Bottom-left (-w/2, -h/2) rotated clockwise:
  // rx = -w/2 * cos - h/2 * sin
  // ry = -(-w/2 * sin) - h/2 * cos = w/2 * sin - h/2 * cos
  const rx = (-sigWidth / 2) * cos + (-sigHeight / 2) * -sin; // clockwise sin is -
  const ry = -(-sigWidth / 2) * -sin + (-sigHeight / 2) * cos;
  
  // Actually, let's keep it simple: 
  // PDF origin is bottom-left. Rotation is around (x, y).
  // If we draw at (x, y) with rotation R, the image's bottom-left is at (x, y).
  // To have center at (cx, cy):
  // x = cx - (sigWidth/2 * cos(rad) - sigHeight/2 * sin(rad))
  // y = cy - (sigWidth/2 * sin(rad) + sigHeight/2 * cos(rad))
  // (using standard CCW radians where R = -rotation_ui)
  
  const angleRad = (-rotation * Math.PI) / 180; // convert to CCW radians
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  
  const drawX = cx - ( (sigWidth / 2) * cosA - (sigHeight / 2) * sinA );
  const drawY = cy - ( (sigWidth / 2) * sinA + (sigHeight / 2) * cosA );

  console.log(`[PDF_BAKE] Drawing sig at: center=(${cx.toFixed(2)}, ${cy.toFixed(2)}), draw=(${drawX.toFixed(2)}, ${drawY.toFixed(2)}), rot=${rotation}deg`);

  // 7. Draw the image
  targetPage.drawImage(signatureImage, {
    x: drawX,
    y: drawY,
    width: sigWidth,
    height: sigHeight,
    rotate: degrees(-rotation), // Pass negative to match CSS clockwise rotation
  });

  // 8. Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as any], { type: "application/pdf" });
}
