import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AiGateway } from '@/lib/gateway/ai-gateway';

const LinkScanSchema = z.object({
  url: z.string().min(1, 'URL cannot be empty').max(2048, 'URL too long'),
  mode: z.enum(['local', 'hybrid', 'cloud']).default('local'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = LinkScanSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid URL payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const result = await AiGateway.processLink(parsed.data.url, parsed.data.mode, clientIp);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal link inspection error';
    const status = message.includes('Rate limit') ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
