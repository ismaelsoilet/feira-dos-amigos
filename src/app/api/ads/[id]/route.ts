import { NextResponse } from 'next/server';
import { getAdById } from '@/lib/storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ad = await getAdById(id);

    if (!ad) {
      return NextResponse.json({ error: 'Anúncio não encontrado.' }, { status: 404 });
    }

    const { pinHash, ...safeAd } = ad;
    return NextResponse.json({ ad: safeAd });
  } catch (error) {
    console.error('Error fetching ad by id:', error);
    return NextResponse.json({ error: 'Erro ao buscar anúncio.' }, { status: 500 });
  }
}
