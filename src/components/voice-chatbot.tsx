// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Mic, MicOff } from "lucide-react"

// interface Message {
//   text: string
//   isUser: boolean
// }

// export default function VoiceChatbot() {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [isListening, setIsListening] = useState(false)
//   const [isBotThinking, setIsBotThinking] = useState(false)
//   const [audioSrc, setAudioSrc] = useState<string | null>(null)

//   const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
//   const recognition = new SpeechRecognition()

//   recognition.continuous = true
//   recognition.interimResults = true
//   recognition.lang = 'en-US'

//   const handleListen = useCallback(() => {
//     if (isListening) {
//       recognition.start()
//     } else {
//       recognition.stop()
//     }

//     recognition.onresult = (event: (Event & { results: SpeechRecognitionResultList })) => {
//       const transcript = Array.from(event.results)
//         .map(result => result[0])
//         .map(result => result.transcript)
//         .join('')

//       if (event.results[0].isFinal) {
//         setMessages(prev => [...prev, { text: transcript, isUser: true }])
//         setIsBotThinking(true)
//         // Simulate bot response after 1 second

//          // Send the transcript to the backend server
//          fetch('/api/speech-to-text', {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ text: transcript }),
//           })
//           .then(res => res.json())
//           .then(data => {
//             setMessages(prev => [...prev, { text: data.text, isUser: false }])
//             setAudioSrc(data.audio) // Audio returned from backend
//             setIsBotThinking(false)
//           })

//         // setTimeout(() => {
//         //   setMessages(prev => [...prev, { text: "I heard you say: " + transcript, isUser: false }])
//         //   setIsBotThinking(false)
//         // }, 1000)
//       }
//     }
//   }, [isListening])

//   useEffect(() => {
//     handleListen()
//     return () => recognition.stop()
//   }, [isListening, handleListen])

//   const toggleListening = () => setIsListening(!isListening)

//   return (
//     <div className="flex flex-col h-screen max-w-md mx-auto bg-gradient-to-b from-gray-50 to-white shadow-xl">
//       <header className="bg-primary text-primary-foreground p-4 text-center rounded-b-lg shadow">
//         <h1 className="text-2xl font-bold">Voice Chatbot</h1>
//       </header>
//       <ScrollArea className="flex-grow mb-4 p-4">
//         <div className="space-y-4">
//           {messages.map((message, index) => (
//             <div
//               key={index}
//               className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
//             >
//               <div
//                 className={`max-w-[80%] p-3 rounded-lg ${
//                   message.isUser
//                     ? 'bg-primary text-primary-foreground rounded-br-none'
//                     : 'bg-secondary text-secondary-foreground rounded-bl-none'
//                 }`}
//               >
//                 {message.text}
//               </div>
//             </div>
//           ))}
//           {isBotThinking && (
//             <div className="flex justify-start">
//               <div className="bg-secondary text-secondary-foreground max-w-[80%] p-3 rounded-lg rounded-bl-none">
//                 <div className="flex space-x-2">
//                   <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
//                   <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                   <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </ScrollArea>
//       <div className="flex justify-center p-4">
//         <Button
//           onClick={toggleListening}
//           className={`rounded-full w-16 h-16 transition-colors duration-300 ${
//             isListening
//               ? 'bg-red-500 hover:bg-red-600 animate-pulse'
//               : 'bg-primary hover:bg-primary/90'
//           }`}
//         >
//           {isListening ? (
//             <MicOff className="h-6 w-6 text-white" />
//           ) : (
//             <Mic className="h-6 w-6 text-white" />
//           )}
//         </Button>
//       </div>
//     </div>
//   )
// }

/*
"use client"
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VoiceChatbot: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
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
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await axios.post('/api/process-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
    } catch (error) {
      console.error('Error sending audio to server:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
        <div className="mb-4 flex justify-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isRecording ? <StopCircle className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
        </div>
        {audioUrl && (
          <div className="mt-4">
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatbot;

*/

/*
 "use client"
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, StopCircle, Volume2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
      console.error('Error accessing microphone:', error);
      setError('Unable to access microphone. Please check your permissions.');
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
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await axios.post('/api/process-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
      setIsProcessing(false);

      // Fetch the transcript
      const transcriptResponse = await axios.get('/api/get-transcript');
      setTranscript(transcriptResponse.data.transcript);
    } catch (error) {
      console.error('Error sending audio to server:', error);
      setError('An error occurred while processing your audio. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">Voice Chatbot</h1>
        <div className="mb-6 flex justify-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-4 rounded-full transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600'
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
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}
        <p className="mt-6 text-sm text-center text-gray-600">
          {isRecording ? 'Recording... Click stop when finished.' : 
           isProcessing ? 'Processing your audio...' :
           'Click the microphone to start recording.'}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatbot;
*/
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
      const url = URL.createObjectURL(data);
      setAudioUrl(url);
      setIsProcessing(false);

      // Fetch the transcript
      const transcriptResponse = await axios.get("/api/transcript");
      setTranscript(transcriptResponse.data.transcript);
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
