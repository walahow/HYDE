import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentStatus } from "@prisma/client";

// GET /api/transactions/[id] — get a single transaction with all relations
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, nim: true } },
        admin: {
          select: {
            id: true,
            name: true,
            destinationName: true,
            categoryCode: true,
          },
        },
        files: true,
        statusLogs: {
          orderBy: { changedAt: "asc" },
          include: {
            changedBy: { select: { name: true, role: true } },
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[TRANSACTION_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
