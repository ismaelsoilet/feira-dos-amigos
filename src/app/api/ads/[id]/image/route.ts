import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdById } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ad = await getAdById(id);

    if (ad && ad.photos && ad.photos.length > 0) {
      const firstPhoto = ad.photos[0];

      // Case 1: Base64 Data URL (compressed WebP / JPEG / PNG)
      if (firstPhoto.startsWith('data:image/')) {
        const match = firstPhoto.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const buffer = Buffer.from(match[2], 'base64');
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': buffer.length.toString(),
              'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
            },
          });
        }
      }

      // Case 2: Hosted HTTP/HTTPS URL (e.g. Vercel Blob)
      if (firstPhoto.startsWith('http://') || firstPhoto.startsWith('https://')) {
        return NextResponse.redirect(firstPhoto, 307);
      }
    }

    // Fallback: Default Feira dos Amigos Logo
    const logoPath = path.join(process.cwd(), 'public', 'logo.jpg');
    if (fs.existsSync(logoPath)) {
      const buffer = fs.readFileSync(logoPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'public, max-age=300, s-maxage=600',
        },
      });
    }

    return new NextResponse('Imagem não encontrada', { status: 404 });
  } catch (error) {
    console.error('Error serving ad image:', error);
    return new NextResponse('Erro interno ao buscar imagem', { status: 500 });
  }
}
