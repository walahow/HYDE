import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentStatus, Role } from "@prisma/client";
import { requireAuth } from "@/lib/auth";

// PATCH /api/transactions/[id]/status
// Body: { toStatus: DocumentStatus, note?: string, file?: { url: string, name: string } }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: userId, role } = session.user as { id: string, role: string };
    const { id } = await params;
    const body = await req.json();
    const { toStatus, note, file } = body as {
      toStatus: DocumentStatus;
      note?: string;
      file?: { url: string; name: string };
    };

    if (!toStatus) {
      return NextResponse.json(
        { error: "Missing toStatus" },
        { status: 400 }
      );
    }

    // Get current transaction for audit log and ownership check
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: { status: true, studentId: true, adminId: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Ownership check for non-admins
    if (role === Role.STUDENT && transaction.studentId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update the transaction status
    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        status: toStatus,
        // Mark completedAt when validated
        ...(toStatus === "VALIDATED" && { completedAt: new Date() }),
        // Link to the processed, signed PDF
        finalFileUrl: body.finalFileUrl || undefined,
      },
    });

    // Create an audit log entry
    await prisma.statusLog.create({
      data: {
        transactionId: id,
        changedById: userId,
        fromStatus: transaction.status,
        toStatus,
        note: note ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    console.error("[TRANSACTION_STATUS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

