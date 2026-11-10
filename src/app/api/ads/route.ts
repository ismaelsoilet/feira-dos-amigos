import { NextResponse } from 'next/server';
import { saveAd, getAds } from '@/lib/storage';
import { checkRateLimit } from '@/lib/rate-limit';
import { AdCategory, AdPriceType, CreateAdInput } from '@/types/ad';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as AdCategory | 'all' | null;
    const bairro = searchParams.get('bairro');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const priceType = searchParams.get('priceType') as AdPriceType | 'all' | null;
    const includeSold = searchParams.get('includeSold') === 'true';
    const sortBy = searchParams.get('sortBy') as 'recent' | 'price_asc' | 'price_desc' | 'expiring' | null;
    const query = searchParams.get('query') || undefined;

    const ads = await getAds({
      category: category || undefined,
      bairro: bairro || undefined,
      minPrice,
      maxPrice,
      priceType: priceType || undefined,
      includeSold,
      sortBy: sortBy || 'recent',
      query,
    });

    return NextResponse.json(
      { ads, total: ads.length },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json({ error: 'Erro ao carregar anúncios.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 1. Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.error }, { status: 429 });
    }

    const body = await request.json();

    // 2. Honeypot check (anti-bot)
    if (body.website_hp && String(body.website_hp).trim().length > 0) {
      return NextResponse.json({ error: 'Envio rejeitado por segurança.' }, { status: 400 });
    }

    // 3. Validation
    if (!body.title || body.title.trim().length < 3) {
      return NextResponse.json({ error: 'Título muito curto (mínimo 3 caracteres).' }, { status: 400 });
    }
    if (!body.description || body.description.trim().length < 5) {
      return NextResponse.json({ error: 'Descrição muito curta (mínimo 5 caracteres).' }, { status: 400 });
    }
    if (!body.whatsapp || body.whatsapp.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'WhatsApp inválido (mínimo 10 dígitos com DDD).' }, { status: 400 });
    }
    const cleanPin = String(body.pin || '').trim();
    if (!cleanPin || !/^[a-zA-Z0-9]{6}$/.test(cleanPin)) {
      return NextResponse.json(
        { error: 'PIN de segurança deve ter exatamente 6 caracteres (letras e números).' },
        { status: 400 }
      );
    }
    if (!body.category) {
      return NextResponse.json({ error: 'Selecione uma categoria.' }, { status: 400 });
    }
    if (!body.bairro) {
      return NextResponse.json({ error: 'Selecione ou informe um bairro de Peruíbe.' }, { status: 400 });
    }

    const input: CreateAdInput = {
      title: body.title,
      description: body.description,
      price: Number(body.price) || 0,
      priceType: body.priceType || 'fixed',
      category: body.category,
      bairro: body.bairro,
      sellerName: body.sellerName || 'Anunciante de Peruíbe',
      whatsapp: body.whatsapp,
      phone: body.phone,
      photos: Array.isArray(body.photos) ? body.photos : [],
      pin: String(body.pin).trim(),
      durationDays: Number(body.durationDays) || 30,
    };

    const ad = await saveAd(input);

    // Don't leak pinHash to client
    const { pinHash, ...safeAd } = ad;

    return NextResponse.json(
      {
        ad: safeAd,
        message: 'Anúncio publicado com sucesso!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json({ error: 'Erro ao processar criação de anúncio.' }, { status: 500 });
  }
}
