import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ message: 'Verify subscription endpoint' }, { status: 200 });
  } catch (error) {
    console.error('Verify subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to verify subscription' },
      { status: 500 }
    );
  }
}
