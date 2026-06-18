import { NextResponse } from 'next/server';

// Required for `output: 'export'` (static binary / GitHub Pages build).
// Next.js 15+ made GET handlers dynamic by default; export mode forbids
// dynamic routes. The data here is `process.env.NEXT_PUBLIC_*` which is
// already baked at build time, so static is semantically correct.
export const dynamic = 'force-static';

export async function GET() {
  // For standalone binary (same-origin), use empty string to use relative URLs
  // For separate frontend/backend, use the configured API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
  console.log('[Config API] Returning apiUrl:', apiUrl);
  console.log('[Config API] All NEXT_PUBLIC env vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));

  return NextResponse.json({
    apiUrl,
  });
}
