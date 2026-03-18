import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/transactions
 * List transactions filtered by the user's role.
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const { id, role } = session.user;

    const transactions = await prisma.transaction.findMany({
      where: role === "ADMIN" ? { adminId: id } : { studentId: id },
      include: {
        student: { select: { name: true, nim: true } },
        admin: { select: { name: true, destinationName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/transactions
 * Create a new transaction in DRAFT status.
 */
export async function POST(req: Request) {
  try {
    const session = await requireAuth("STUDENT");
    const { id: studentId } = session.user;
    const body = await req.json();

    const { documentType, adminId, file } = body;

    if (!documentType || !adminId) {
      return NextResponse.json({ message: "documentType and adminId are required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        documentType,
        studentId,
        adminId,
        status: "DRAFT",
      },
    });

    // Link the file if provided during initial submission
    if (file && file.url) {
      await prisma.file.create({
        data: {
          transactionId: transaction.id,
          fileUrl: file.url,
          originalFileName: file.name || "UNNAMED_FILE",
          uploadedById: studentId,
        },
      });
    }

    // Log the initial status
    await prisma.statusLog.create({
      data: {
        transactionId: transaction.id,
        changedById: studentId,
        toStatus: "DRAFT",
        note: "Initial submission created.",
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
