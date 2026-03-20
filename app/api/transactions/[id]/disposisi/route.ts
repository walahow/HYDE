import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateVerificationQR } from "@/lib/qrcode";

// GET /api/transactions/[id]/disposisi
// Auth: ADMIN only, must be the assigned admin
// Guard: transaction must be VALIDATED + HYBRID
// Action: generate QR, auto-transition → AWAITING_SCAN, return print data
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(); // Allow both STUDENT and ADMIN
    const { id: userId, role } = session.user as { id: string; role: string };
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, nim: true } },
        admin: { select: { id: true, destinationName: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Ownership check: must be the student who created it OR the assigned admin
    const isStudentOwner = transaction.studentId === userId;
    const isAdminAssigned = transaction.adminId === userId;

    if (!isStudentOwner && !isAdminAssigned) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mode guard
    if (transaction.mode !== "HYBRID") {
      return NextResponse.json(
        { error: "Disposisi is only available for HYBRID transactions" },
        { status: 400 }
      );
    }

    // Status guard: allow if VALIDATED or AWAITING_SCAN
    const allowedStatuses = ["VALIDATED", "AWAITING_SCAN"];
    if (!allowedStatuses.includes(transaction.status)) {
      return NextResponse.json(
        { error: `Transaction must be in VALIDATED or AWAITING_SCAN status to generate disposisi (current: ${transaction.status})` },
        { status: 400 }
      );
    }

    // Generate QR code pointing to public verification URL
    const qrDataUrl = await generateVerificationQR(id);

    // Transition status: VALIDATED → AWAITING_SCAN (ONLY IF ADMIN)
    if (role === "ADMIN" && transaction.status === "VALIDATED") {
      await prisma.transaction.update({
        where: { id },
        data: { status: "AWAITING_SCAN" },
      });

      // Write audit log
      await prisma.statusLog.create({
        data: {
          transactionId: id,
          changedById: userId,
          fromStatus: "VALIDATED",
          toStatus: "AWAITING_SCAN",
          note: "Admin generated disposisi sheet",
        },
      });
    }

    return NextResponse.json({
      qrDataUrl,
      transaction: {
        id: transaction.id,
        documentType: transaction.documentType,
        createdAt: transaction.createdAt,
        student: {
          name: transaction.student.name,
          nim: transaction.student.nim,
        },
        admin: {
          destinationName: transaction.admin.destinationName,
        },
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    console.error("[DISPOSISI_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
