import { NextResponse } from 'next/server';
import { verifyAdPin } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const pin = String(body.pin || '').trim();

    if (!pin) {
      return NextResponse.json({ error: 'Digite o PIN de segurança.' }, { status: 400 });
    }

    const result = await verifyAdPin(id, pin);
    if (!result.valid || !result.ad) {
      return NextResponse.json({ error: result.error || 'PIN incorreto.' }, { status: 401 });
    }

    const { pinHash, ...safeAd } = result.ad;
    return NextResponse.json({ success: true, ad: safeAd });
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json({ error: 'Erro ao verificar PIN.' }, { status: 500 });
  }
}
