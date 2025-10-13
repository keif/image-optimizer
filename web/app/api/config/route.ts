import { NextResponse } from 'next/server';

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  console.log('[Config API] Returning apiUrl:', apiUrl);
  console.log('[Config API] All NEXT_PUBLIC env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));

  return NextResponse.json({
    apiUrl,
  });
}
