import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ message: 'Verify coins endpoint' }, { status: 200 });
  } catch (error) {
    console.error('Verify coins error:', error);
    return NextResponse.json(
      { error: 'Failed to verify coins' },
      { status: 500 }
    );
  }
}
