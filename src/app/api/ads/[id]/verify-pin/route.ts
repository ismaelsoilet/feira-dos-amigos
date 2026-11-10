import { NextResponse } from 'next/server';
import { verifyAdPin } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pin = String(body.pin || '').trim();

    if (!pin) {
      return NextResponse.json(
        { error: 'Digite o PIN de segurança.' },
        { status: 400, headers: { 'Cache-Control': 'no-store, no-cache' } }
      );
    }

    const result = await verifyAdPin(id, pin);
    if (!result.valid || !result.ad) {
      return NextResponse.json(
        { error: result.error || 'PIN incorreto.' },
        { status: 401, headers: { 'Cache-Control': 'no-store, no-cache' } }
      );
    }

    const { pinHash, ...safeAd } = result.ad;
    return NextResponse.json(
      { success: true, ad: safeAd },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json({ error: 'Erro ao verificar PIN.' }, { status: 500 });
  }
}
