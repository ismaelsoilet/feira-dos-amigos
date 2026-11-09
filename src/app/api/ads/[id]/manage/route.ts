import { NextResponse } from 'next/server';
import { updateAdStatus, updateAd, deleteAd } from '@/lib/storage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.pin || String(body.pin).trim().length < 4) {
      return NextResponse.json({ error: 'Informe o PIN de 4 dígitos.' }, { status: 400 });
    }

    const result = await updateAd(id, {
      ...body,
      pin: String(body.pin).trim(),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Não autorizado.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      ad: result.ad,
      message: 'Anúncio atualizado com sucesso!',
    });
  } catch (error) {
    console.error('Error editing ad:', error);
    return NextResponse.json({ error: 'Erro ao editar anúncio.' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.pin) {
      return NextResponse.json({ error: 'Informe o PIN de 4 dígitos.' }, { status: 400 });
    }

    if (body.status !== 'active' && body.status !== 'sold') {
      return NextResponse.json({ error: 'Status inválido. Use "active" ou "sold".' }, { status: 400 });
    }

    const result = await updateAdStatus(id, String(body.pin).trim(), body.status);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Não autorizado.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      status: body.status,
      message: body.status === 'sold' ? 'Anúncio marcado como Vendido com sucesso!' : 'Anúncio reativado!',
    });
  } catch (error) {
    console.error('Error updating ad status:', error);
    return NextResponse.json({ error: 'Erro ao gerenciar anúncio.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let body: any = {};
    try {
      body = await request.json();
    } catch (err) {
      console.warn('DELETE request had no JSON body, falling back to query param:', err);
      body = {};
    }
    const pin = body.pin || new URL(request.url).searchParams.get('pin');

    if (!pin) {
      return NextResponse.json({ error: 'Informe o PIN de segurança.' }, { status: 400 });
    }

    const result = await deleteAd(id, String(pin).trim());

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Não autorizado.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Anúncio excluído com sucesso.',
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    return NextResponse.json({ error: 'Erro ao excluir anúncio.' }, { status: 500 });
  }
}
