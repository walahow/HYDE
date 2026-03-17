import { get } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get('url');
  const filename = searchParams.get('filename');

  if (!blobUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Use the URL exactly as sent (searchParams.get already decodes it once)
  const targetUrl = blobUrl;

  console.log('[BLOB_PROXY] Streaming via get():', targetUrl);

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('Server configuration error: Missing blob token');
    }

    // Use get() to fetch the private blob as a stream
    const response = await get(targetUrl, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!response) {
      throw new Error('Blob not found or not accessible');
    }

    // Return the blob content as a stream
    return new NextResponse(response.stream, {
      headers: {
        'Content-Type': response.blob.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': filename ? `attachment; filename="${filename}"` : 'inline',
      },
    });
    
  } catch (error: any) {
    console.error('[BLOB_PROXY_CRITICAL]', error);
    return NextResponse.json({ 
      error: error.message,
      tip: "Ensure BLOB_READ_WRITE_TOKEN is correctly configured and the file exists."
    }, { status: 500 });
  }
}
