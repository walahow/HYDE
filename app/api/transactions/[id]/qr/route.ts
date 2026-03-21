import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { generateVerificationQR } from "@/lib/qrcode";

/**
 * GET /api/transactions/[id]/qr
 * Returns a QR code Data URL for transaction verification.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only authenticated users can generate/view the QR for now
    await requireAuth();
    const { id } = await params;

    const qrDataUrl = await generateVerificationQR(id);

    return NextResponse.json({ qrCode: qrDataUrl });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
