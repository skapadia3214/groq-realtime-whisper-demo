"use client";
import { transcribeAudio } from "@/lib/transcriber";
import type { MicrophoneProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react"; 
import { useRef, useState, useEffect } from "react";

  const Microphone: React.FC<MicrophoneProps> = ({ onTranscription, noSpeechProb, apiKey }) => {
  const [recording, setRecording] = useState(false);
  const isActive = useRef(true);
  const frzTranscript = useRef<string>("");
  const curTranscript = useRef<string>("");
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(false);

  useEffect(() => {
    // Check if the current context is secure
    setIsSecureContext(window.isSecureContext);
    
    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported on your browser!");
      return;
    }
    
    // Clean up function
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    };
  }, []);
  
  
  const toggleRecording = async () => {
    if (!isSecureContext) {
      console.error("Microphone access is only available in a secure context (HTTPS or localhost)");
      return;
    }

    if (recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
    setRecording(!recording);
  };

  const resetAndInitializeRecorder = async () => {
    if (!isSecureContext) {
      console.error("Microphone access is only available in a secure context (HTTPS or localhost)");
      return;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      for (const track of mediaRecorderRef.current.stream.getTracks()) {
        track.stop();
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      isActive.current = true;
      const options = { mimeType: "audio/webm" };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
      mediaRecorderRef.current.start(Number.parseInt(process.env.NEXT_PUBLIC_EMIT_DELAY || "1000"));
    } catch (error) {
      console.error("Error accessing the microphone:", error);
    }
  };

  const handleDataAvailable = async (event: BlobEvent) => {
    if (!isActive.current || event.data.size === 0) {
      return;
    }

    chunksRef.current.push(event.data);
    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob);
    
    try {
      const { transcript: new_transcription, rtf } = await transcribeAudio(
        formData, 
        apiKey,
        Date.now(), 
        noSpeechProb
      );

      curTranscript.current = new_transcription;
      
      const audio_len = chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
      if (audio_len >= 300000) {
        frzTranscript.current += ` ${curTranscript.current}`;
        curTranscript.current = "";
        setTranscript(`${frzTranscript.current.trim()} ${curTranscript.current.trim()}`);
        onTranscription(`${frzTranscript.current.trim()} ${curTranscript.current.trim()}`, rtf);
        await resetAndInitializeRecorder();
      } else {
        setTranscript(`${frzTranscript.current.trim()} ${curTranscript.current.trim()}`);
        onTranscription(`${frzTranscript.current.trim()} ${curTranscript.current.trim()}`, rtf);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  const startRecording = async () => {
    await resetAndInitializeRecorder();
  };

  const stopRecording = async () => {
    isActive.current = false;
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        for (const track of streamRef.current.getTracks()) {
          track.stop();
        }
      }
    }
  };

  return (
    <>
    <Mic 
      className={cn(
        (recording ? "bg-red-400 animate-pulse" : "hover:bg-slate-200"),
        "h-20 w-20 border p-4 cursor-pointer rounded-full",
        !isSecureContext && "opacity-50 cursor-not-allowed"
      )}
      onClick={isSecureContext ? toggleRecording : () => console.error("Microphone access is only available in a secure context (HTTPS or localhost)")}
    />
    {isSecureContext ? <p>Context is secure</p> : <p>Context is not secure</p>}
    </>
  );
};

export default Microphone;