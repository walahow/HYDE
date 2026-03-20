import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentStatus, TransactionMode } from "@prisma/client";
import { requireAuth } from "@/lib/auth";

// Valid status transitions per mode
const ALLOWED_TRANSITIONS: Record<
  TransactionMode,
  Partial<Record<DocumentStatus, DocumentStatus[]>>
> = {
  DIGITAL: {
    DRAFT:     ["REVIEWING"],
    REVIEWING: ["REVISION", "VALIDATED"],
    REVISION:  ["REVIEWING"],
  },
  HYBRID: {
    DRAFT:         ["REVIEWING"],
    REVIEWING:     ["REVISION", "AWAITING_SCAN"],
    AWAITING_SCAN: ["VALIDATED"],
    REVISION:      ["REVIEWING"],
  },
};

// PATCH /api/transactions/[id]/status
// Body: { toStatus: DocumentStatus, note?: string, finalFileUrl?: string }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id: userId, role } = session.user as { id: string; role: string };
    const { id } = await params;
    const body = await req.json();
    const { toStatus, note, finalFileUrl, file } = body as {
      toStatus: DocumentStatus;
      note?: string;
      finalFileUrl?: string;
      file?: { url: string; name: string };
    };

    if (!toStatus) {
      return NextResponse.json({ error: "Missing toStatus" }, { status: 400 });
    }

    // Fetch transaction for ownership check and current state
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: { status: true, mode: true, studentId: true, adminId: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Ownership checks
    if (role === "STUDENT" && transaction.studentId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (role === "ADMIN" && transaction.adminId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate transition
    const allowed = ALLOWED_TRANSITIONS[transaction.mode]?.[transaction.status] ?? [];
    if (!allowed.includes(toStatus)) {
      return NextResponse.json(
        {
          error: `Invalid transition: ${transaction.status} → ${toStatus} is not allowed for mode ${transaction.mode}`,
        },
        { status: 400 }
      );
    }

    // Build update payload
    const now = new Date();
    const updateData: Record<string, unknown> = {
      status: toStatus,
      ...(finalFileUrl && { finalFileUrl }),
    };

    // completedAt & scannedAt: set when status → VALIDATED
    if (toStatus === "VALIDATED") {
      updateData.completedAt = now;
      if (transaction.mode === "HYBRID") {
        updateData.scannedAt = now;
      }
    }

    // Handle file replacement/creation (Revision upload)
    if (file) {
      const existingFile = await prisma.file.findFirst({
        where: {
          transactionId: id,
          originalFileName: file.name,
        },
      });

      if (existingFile) {
        // Replace existing file record URL
        await prisma.file.update({
          where: { id: existingFile.id },
          data: {
            fileUrl: file.url,
            uploadedAt: now,
            uploadedById: userId,
          },
        });
      } else {
        // Create new file record
        await prisma.file.create({
          data: {
            transactionId: id,
            fileUrl: file.url,
            originalFileName: file.name,
            uploadedById: userId,
            uploadedAt: now,
          },
        });
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData,
    });

    // Audit log
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
    if (error.message === "UNAUTHORIZED")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    console.error("[TRANSACTION_STATUS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
