import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const TRANSCRIPT_KEY = 'last_transcript';

export async function GET() {
  const lastTranscript = await kv.get(TRANSCRIPT_KEY);
  return NextResponse.json({ transcript: lastTranscript });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  await kv.set(TRANSCRIPT_KEY, body.transcript);
  return NextResponse.json({ message: 'Transcript stored successfully' });
}