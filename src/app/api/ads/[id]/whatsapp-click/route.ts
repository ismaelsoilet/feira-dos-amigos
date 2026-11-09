import { NextRequest, NextResponse } from 'next/server';
import { incrementAdMetric } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await incrementAdMetric(id, 'whatsappClicks');
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Anúncio não encontrado.' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, whatsappClicks: result.whatsappClicks },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error incrementing whatsapp clicks:', error);
    return NextResponse.json(
      { success: false, error: 'Falha interna ao registrar clique de WhatsApp.' },
      { status: 500 }
    );
  }
}
