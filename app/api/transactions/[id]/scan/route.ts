import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH /api/transactions/[id]/scan
// Auth: ADMIN only, must be the assigned admin
// Guard: mode === HYBRID, status === AWAITING_SCAN
// Action: set status → COMPLETED, scannedAt + completedAt = now()
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth("ADMIN");
    const { id: adminUserId } = session.user as { id: string };
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: { status: true, mode: true, adminId: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Ownership check
    if (transaction.adminId !== adminUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mode guard
    if (transaction.mode !== "HYBRID") {
      return NextResponse.json(
        { error: "QR scan is only applicable for HYBRID transactions" },
        { status: 400 }
      );
    }

    // Status guard
    if (transaction.status !== "AWAITING_SCAN") {
      return NextResponse.json(
        { error: "Transaction is not awaiting a physical scan" },
        { status: 400 }
      );
    }

    const now = new Date();

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: "VALIDATED",
        scannedAt: now,
        completedAt: now,
      },
      include: {
        student: { select: { name: true } },
        admin: { select: { destinationName: true } },
      },
    });

    // Audit log
    await prisma.statusLog.create({
      data: {
        transactionId: id,
        changedById: adminUserId,
        fromStatus: "AWAITING_SCAN",
        toStatus: "VALIDATED",
        note: "Physical QR scan confirmed",
      },
    });

    return NextResponse.json({
      message: "Scan confirmed",
      transaction: {
        id: updated.id,
        documentType: updated.documentType,
        scannedAt: updated.scannedAt,
        completedAt: updated.completedAt,
        student: {
          name: updated.student.name,
        },
        admin: {
          destinationName: updated.admin.destinationName,
        },
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    console.error("[SCAN_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
