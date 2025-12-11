import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * Serve uploaded files securely
 * GET /api/uploads/[filename]
 */
export async function GET(
    request: Request,
    { params }: { params: { filename: string } }
) {
    try {
        const { filename } = params;

        // Security: Prevent directory traversal
        const safeFilename = filename.replace(/(\.\.[\/\\])+/g, '');
        const filePath = join(process.cwd(), 'uploads', safeFilename);

        if (!existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = await readFile(filePath);

        // Determine content type (simple check)
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        if (ext === 'png') contentType = 'image/png';
        if (ext === 'pdf') contentType = 'application/pdf';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'private, max-age=3600'
            }
        });

    } catch (error: any) {
        console.error('[API] File serve error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
