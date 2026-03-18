import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

/**
 * POST /api/upload
 * Securely upload a file to Vercel Blob and link it to a Transaction.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await requireAuth();
    const { id: userId } = session.user;

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const transactionId = searchParams.get('transactionId');

    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    if (!request.body) {
      return NextResponse.json({ error: "No file content provided" }, { status: 400 });
    }

    // Generate a UUID-based storage key so the original filename never leaks into the URL
    const extension = filename.split('.').pop()?.toLowerCase() ?? 'pdf';
    const safeKey   = `${randomUUID()}.${extension}`;

    const blob = await put(safeKey, request.body, {
      access: 'private',
    });

    // If transactionId is provided, verify and link immediately
    if (transactionId) {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }

      // Only the student who owns the transaction OR the assigned admin can upload files.
      if (transaction.studentId !== userId && transaction.adminId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Save metadata to Prisma
      await prisma.file.create({
        data: {
          transactionId,
          fileUrl: blob.url,
          originalFileName: filename,
          uploadedById: userId,
        },
      });
    }

    return NextResponse.json(blob);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (error.message === "FORBIDDEN") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    
    console.error("[UPLOAD_API] Failure:", error);
    return NextResponse.json({ error: error.message || "Failed to upload to blob storage" }, { status: 500 });
  }
}
