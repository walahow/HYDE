import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/transactions/[id]
 * Fetch full details of a transaction.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id: userId, role } = session.user;
    const { id } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true, nim: true } },
        admin: { select: { id: true, name: true, destinationName: true } },
        files: { orderBy: { uploadedAt: "asc" } },
        messages: { orderBy: { createdAt: "asc" } },
        statusLogs: { 
          orderBy: { changedAt: "asc" },
          include: { changedBy: { select: { id: true, name: true, role: true } } }
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    // Role-based access control: only involved parties can view
    if (role === "STUDENT" && transaction.studentId !== userId) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    if (role === "ADMIN" && transaction.adminId !== userId) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    return NextResponse.json(transaction);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/transactions/[id]
 * Update status or metadata.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const { id: userId, role } = session.user;
    const { id } = await params;
    const { status, note } = await req.json();

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    // Role/Ownership checks
    if (role === "STUDENT" && transaction.studentId !== userId) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    if (role === "ADMIN" && transaction.adminId !== userId) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // Business Logic for Status Changes
    if (status) {
      // Students can only change status back to DRAFT or set to specific states if allowed (unlikely)
      // Admins handle REVIEWING, REVISION, VALIDATED
      if (role === "STUDENT" && status !== "DRAFT") {
         // Maybe student can only resubmit (set to DRAFT from REVISION)
         if (transaction.status !== "REVISION") {
            return NextResponse.json({ message: "Student can only update status to DRAFT from REVISION" }, { status: 400 });
         }
      }

      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: { 
          status,
          completedAt: status === "VALIDATED" ? new Date() : undefined,
        },
      });

      // Log the status change
      await prisma.statusLog.create({
        data: {
          transactionId: id,
          changedById: userId,
          fromStatus: transaction.status,
          toStatus: status,
          note: note || `Status updated to ${status}.`,
        },
      });

      return NextResponse.json(updatedTransaction);
    }

    return NextResponse.json({ message: "No status provided for update" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
