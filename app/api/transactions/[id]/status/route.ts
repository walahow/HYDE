import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

// PATCH /api/transactions/[id]/status
// Body: { toStatus: DocumentStatus, changedById: string, note?: string }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { toStatus, changedById, note, file } = body as {
    toStatus: DocumentStatus;
    changedById: string;
    note?: string;
    file?: { url: string; name: string };
  };

  if (!toStatus || !changedById) {
    return NextResponse.json(
      { error: "Missing toStatus or changedById" },
      { status: 400 }
    );
  }

  try {
    // Get current status for audit log
    const current = await prisma.transaction.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!current) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
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
        // Create file attachment if provided (regular student upload)
        ...(file && {
          files: {
            create: {
              fileUrl: file.url,
              originalFileName: file.name,
              uploadedById: changedById
            }
          }
        }),
        // ADDED: Create official signed file record if finalFileUrl is present
        ...(body.finalFileUrl && {
          files: {
            create: {
              fileUrl: body.finalFileUrl,
              originalFileName: "OFFICIAL_SIGNED_DOCUMENT.pdf",
              uploadedById: changedById // Admin ID
            }
          }
        })
      },
    });

    // Create an audit log entry
    await prisma.statusLog.create({
      data: {
        transactionId: id,
        changedById,
        fromStatus: current.status,
        toStatus,
        note: note ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[TRANSACTION_STATUS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
