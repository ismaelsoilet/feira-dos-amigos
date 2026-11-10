import { NextResponse } from 'next/server';
import { getAdById } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ad = await getAdById(id);

    if (!ad) {
      return NextResponse.json(
        { error: 'Anúncio não encontrado.' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            Pragma: 'no-cache',
          },
        }
      );
    }

    const { pinHash, ...safeAd } = ad;
    return NextResponse.json(
      { ad: safeAd },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching ad by id:', error);
    return NextResponse.json({ error: 'Erro ao buscar anúncio.' }, { status: 500 });
  }
}
