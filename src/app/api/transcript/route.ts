import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
  console.log("Connected to Redis");
});
redis.on("error", (error) => {
  console.error("Error occur while connecting to Redis:", error);
});

const TRANSCRIPT_KEY = "last_transcript";

export async function GET() {
  try {
    const lastTranscript = await redis.get(TRANSCRIPT_KEY);
    return NextResponse.json({ transcript: lastTranscript });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return NextResponse.json(
      { error: "Failed to fetch transcript" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await redis.set(TRANSCRIPT_KEY, body.transcript);
    return NextResponse.json({ message: "Transcript stored successfully" });
  } catch (error) {
    console.error("Error storing transcript:", error);
    return NextResponse.json(
      { error: "Failed to store transcript" },
      { status: 500 }
    );
  }
}
