import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role, DocumentStatus } from "@prisma/client";

// GET /api/transactions?role=STUDENT&userId=...
// GET /api/transactions?role=ADMIN&userId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") as Role | null;
  const userId = searchParams.get("userId");

  if (!role || !userId) {
    return NextResponse.json({ error: "Missing role or userId" }, { status: 400 });
  }

  try {
    const where =
      role === Role.STUDENT ? { studentId: userId } : { adminId: userId };

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: { id: true, name: true, nim: true },
        },
        admin: {
          select: {
            id: true,
            name: true,
            destinationName: true,
            categoryCode: true,
          },
        },
        files: true,
        statusLogs: { orderBy: { changedAt: "desc" } },
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[TRANSACTIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/transactions
// Body: { studentId, adminId, documentType }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId, adminId, documentType, file } = body as {
    studentId: string;
    adminId: string;
    documentType: string;
    file?: { url: string; name: string };
  };

  if (!studentId || !adminId || !documentType) {
    return NextResponse.json(
      { error: "Missing studentId, adminId, or documentType" },
      { status: 400 }
    );
  }

  try {
    const transaction = await prisma.transaction.create({
      data: { 
        studentId, 
        adminId, 
        documentType, 
        status: DocumentStatus.DRAFT,
        ...(file ? {
          files: {
            create: {
              fileUrl: file.url,
              originalFileName: file.name,
              uploadedById: studentId
            }
          }
        } : {})
      },
    });

    await prisma.statusLog.create({
      data: {
        transactionId: transaction.id,
        changedById: studentId,
        fromStatus: null,
        toStatus: DocumentStatus.DRAFT,
        note: "Transaction submitted by student",
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("[TRANSACTION_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
