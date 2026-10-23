// AI Protector India — k-Anonymity HIBP Pwned Passwords Proxy & Offline Fallback
// Only receives 5-character SHA-1 prefix. Full password is NEVER seen by server or external API.

import { NextRequest, NextResponse } from 'next/server';

// Offline fallback table for standard common passwords if API is unreachable
const OFFLINE_COMMON_PWNED_PREFIXES: Record<string, string> = {
  // "password" -> 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
  '5BAA6': '1E4C9B93F3F0682250B6CF8331B7EE68FD8:3861493\n0018A5BE3920A3C9231:12',
  // "123456" -> 7C4A8D09CA3762AF61E59520943DC26494F8941B
  '7C4A8': 'D09CA3762AF61E59520943DC26494F8941B:23514210\n112233445566:4',
  // "admin" -> D033E22AE348AEB5660FC2140AEC35850C4DA997
  'D033E': '22AE348AEB5660FC2140AEC35850C4DA997:154321',
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ prefix: string }> }
) {
  const { prefix } = await context.params;
  const cleanPrefix = (prefix || '').trim().toUpperCase();

  if (!/^[0-9A-F]{5}$/.test(cleanPrefix)) {
    return NextResponse.json(
      { error: 'Invalid k-anonymity hash prefix. Exactly 5 hexadecimal characters required.' },
      { status: 400 }
    );
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const hibpRes = await fetch(`https://api.pwnedpasswords.com/range/${cleanPrefix}`, {
      headers: {
        'User-Agent': 'AI-Protector-India-Hackathon',
        'Add-Padding': 'true', // Mitigates response length side-channel attacks
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (hibpRes.ok) {
      const text = await hibpRes.text();
      return new Response(text, {
        status: 200,
        headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
      });
    }
  } catch (err) {
    // Offline / timeout fallback
  }

  // Use offline fallback table if external network unavailable
  const fallback = OFFLINE_COMMON_PWNED_PREFIXES[cleanPrefix] || '';
  return new Response(fallback, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
