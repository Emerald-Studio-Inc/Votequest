import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pass = body?.passphrase || '';

    const secret = process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_ADMIN_SECRET;
    if (!secret) {
      return NextResponse.json({ ok: false, error: 'Admin validation not configured' }, { status: 500 });
    }

    if (pass === secret) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Invalid passphrase' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
