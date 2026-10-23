import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AiGateway } from '@/lib/gateway/ai-gateway';

const MessageScanSchema = z.object({
  text: z.string().min(1, 'Message text cannot be empty').max(16000, 'Message text too large'),
  mode: z.enum(['local', 'hybrid', 'cloud']).default('local'),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = MessageScanSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const result = await AiGateway.processMessage(parsed.data.text, parsed.data.mode, clientIp);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal scanning error';
    const status = message.includes('Rate limit') ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
