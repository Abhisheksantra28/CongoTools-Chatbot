import { NextRequest, NextResponse } from 'next/server';

let lastTranscript: string | null = null;

export async function GET() {
  return NextResponse.json({ transcript: lastTranscript });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  lastTranscript = body.transcript;
  return NextResponse.json({ message: 'Transcript stored successfully' });
}