import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json({ error: "Filename is required" }, { status: 400 });
  }

  console.log("[UPLOAD_API] Start upload:", filename);

  if (!request.body) {
    return NextResponse.json({ error: "No file content provided" }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'private',
      addRandomSuffix: true,
    });

    console.log("[UPLOAD_API] Success:", blob.url);
    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("[UPLOAD_API] Failure:", error);
    return NextResponse.json({ error: error.message || "Failed to upload to blob storage" }, { status: 500 });
  }
}
