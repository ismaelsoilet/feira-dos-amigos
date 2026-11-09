import { NextResponse } from 'next/server';
import { getCommunityStats, purgeExpiredAds } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Opportunistically mark expired ads
    await purgeExpiredAds();
    const stats = await getCommunityStats();
    return NextResponse.json({ success: true, stats }, { status: 200 });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao obter estatísticas da comunidade.' },
      { status: 500 }
    );
  }
}
