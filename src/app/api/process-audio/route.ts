import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Convert File to Buffer
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function performSpeechToText(audioBuffer: Buffer): Promise<string> {
  try {
    const uploadResponse = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      audioBuffer,
      {
        headers: {
          authorization: process.env.ASSEMBLYAI_API_KEY!,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: uploadResponse.data.upload_url,
      },
      {
        headers: { authorization: process.env.ASSEMBLYAI_API_KEY! },
      }
    );

    const transcriptId = transcriptResponse.data.id;

    while (true) {
      const pollingResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: { authorization: process.env.ASSEMBLYAI_API_KEY! },
        }
      );

      if (pollingResponse.data.status === "completed") {
        return pollingResponse.data.text;
      }

      if (pollingResponse.data.status === "error") {
        throw new Error("Transcription failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error("Error during speech-to-text conversion:", error);
    throw new Error("Speech-to-text conversion failed");
  }
}

async function performTextToSpeech(text: string): Promise<Buffer> {
  // console.log("Converting text to speech:", text);
  const response = await axios.get("http://api.voicerss.org/", {
    params: {
      key: process.env.VOICERSS_API_KEY!,
      hl: "en-us",
      v: "Linda",
      src: text,
      r: "0",
      c: "mp3",
      f: "44khz_16bit_stereo",
    },
    responseType: "arraybuffer",
  });
  // console.log("Text to Speech Response:", response);
  // console.log("Text to Speech Response Data:", response.data);
  return Buffer.from(response.data);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audio = formData.get("audio") as File | null;

  if (!audio) {
    return NextResponse.json(
      { error: "Audio file is required" },
      { status: 400 }
    );
  }

  try {

    const audioBuffer = await fileToBuffer(audio);

    // Perform speech-to-text conversion
    const transcription = await performSpeechToText(audioBuffer);
    console.log("Transcribed Text:", transcription);

    // Store the transcript
    const { data } = await axios.post(`${req.nextUrl.origin}/api/transcript`, {
      transcript: transcription,
    });

    console.log("Stored Transcript:", data.message);

    // Convert text to speech
    const audioContent = await performTextToSpeech(transcription);

    // Return audio content
    return new NextResponse(audioContent, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Error processing audio" },
      { status: 500 }
    );
  }
}
