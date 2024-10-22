"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, StopCircle, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from "axios";

const VoiceChatbot: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setError(null);
    setTranscript(null);
    audioChunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = sendAudioToServer;

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("Unable to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };


  const sendAudioToServer = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    console.log("Sending audio to server...", audioBlob);

    try {
      const { data } = await axios.post("/api/process-audio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      if (!data) {
        throw new Error("Server responded with an error");
      }

      // const url = URL.createObjectURL(new Blob([data], { type: "audio/mpeg" }));

      const transcriptResponse = await axios.get("/api/transcript");
      console.log("Transcript response:", transcriptResponse.data.transcript);
      setTranscript(transcriptResponse.data.transcript);


      const url = URL.createObjectURL(data);
      setAudioUrl(url);
      setIsProcessing(false);

      // Fetch the transcript
      // const transcriptResponse = await axios.get("/api/transcript");
      // console.log("Transcript response:", transcriptResponse.data.transcript);
      // setTranscript(transcriptResponse.data.transcript);
    } catch (error) {
      console.error("Error sending audio to server:", error);
      setError(
        "An error occurred while processing your audio. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
          Voice Chatbot
        </h1>
        <div className="mb-6 flex justify-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-4 rounded-full transition-all duration-300 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={isProcessing}
          >
            {isRecording ? (
              <StopCircle className="h-8 w-8" />
            ) : isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {transcript && (
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <h2 className="font-semibold mb-2">Transcript:</h2>
            <p>{transcript}</p>
          </div>
        )}
        {audioUrl && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <h2 className="font-semibold mb-2 flex items-center">
              <Volume2 className="h-4 w-4 mr-2" />
              Response:
            </h2>
            <audio src={audioUrl} autoPlay controls className="w-full" />
          </div>
        )}
        <p className="mt-6 text-sm text-center text-gray-600">
          {isRecording
            ? "Recording... Click stop when finished."
            : isProcessing
            ? "Processing your audio..."
            : "Click the microphone to start recording."}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatbot;
