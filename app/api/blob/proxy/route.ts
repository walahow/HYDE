import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await requireAuth();

    const { searchParams } = new URL(request.url);
    const blobUrl = searchParams.get('url');

    if (!blobUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Look up the file record by URL and verify ownership
    const file = await prisma.file.findFirst({
      where: { fileUrl: blobUrl },
      include: { transaction: { select: { studentId: true, adminId: true } } },
    });

    if (!file) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isOwner    = file.transaction.studentId === session.user.id;
    const isAssigned = file.transaction.adminId   === session.user.id;

    if (!isOwner && !isAssigned) {
      console.warn(`[BLOB_PROXY] Forbidden: user ${session.user.id} tried to access file ${file.id}`);
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log(`[BLOB_PROXY] Streaming file ${file.id} for user ${session.user.id}`);

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('Server configuration error: Missing blob token');
    }

    // Stream the private blob via authenticated fetch
    const upstream = await fetch(blobUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!upstream.ok) {
      throw new Error(`Blob fetch failed: ${upstream.status}`);
    }

    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'application/octet-stream',
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `inline; filename="${file.id}.pdf"`,
      },
    });

  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (error.message === 'FORBIDDEN')    return NextResponse.json({ message: 'Forbidden' },    { status: 403 });

    console.error('[BLOB_PROXY_CRITICAL]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
