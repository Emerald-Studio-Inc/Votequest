import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { passphrase } = await request.json();

    // Use server-side ONLY variable
    const correctPassphrase = process.env.ADMIN_PASSPHRASE;

    if (!correctPassphrase) {
      console.error('ADMIN_PASSPHRASE not set in environment variables');
      return NextResponse.json({ ok: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    if (passphrase === correctPassphrase) {
      return NextResponse.json({ ok: true });
    } else {
      return NextResponse.json({ ok: false, error: 'Invalid passphrase' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
}
