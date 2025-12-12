import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ message: 'Purchase coins endpoint' }, { status: 200 });
  } catch (error) {
    console.error('Purchase coins error:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
