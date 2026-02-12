import { NextResponse } from 'next/server';

export async function GET(request: Request, context: { params: { index: string } }) {
  const style = new URL(request.url).searchParams.get('style') ?? 'MGA_Preset';
  const index = Number.parseInt(context.params.index, 10);
  const safeIndex = Number.isNaN(index) ? 1 : Math.min(4, Math.max(1, index));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
  </defs>
  <rect width="1200" height="800" fill="url(#bg)" />
  <rect x="80" y="80" width="1040" height="640" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="12 8" />
  <text x="100" y="160" fill="#e2e8f0" font-family="Arial, sans-serif" font-size="44" font-weight="700">MGA Rendering Engine (Mock Output)</text>
  <text x="100" y="220" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="30">Style: ${style.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
  <text x="100" y="270" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="30">Variant: ${safeIndex}</text>
  <text x="100" y="690" fill="#94a3b8" font-family="Arial, sans-serif" font-size="24">Replace this endpoint when real AI provider integration is ready.</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
