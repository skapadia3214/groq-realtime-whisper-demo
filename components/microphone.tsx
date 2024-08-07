"use client";
import { transcribeAudio } from "@/lib/transcriber";
import { MicrophoneProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";
import React, { useRef, useState } from "react";


const Microphone: React.FC<MicrophoneProps> = ({ onTranscription, noSpeechProb, apiKey }) => {
  const [recording, setRecording] = useState(false);
  const isActive = useRef(true);
  const frzTranscript = useRef<string>("");
  const curTranscript = useRef<string>("");
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeType = useRef<string>("");

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
    setRecording(!recording);
  };

  const resetAndInitializeRecorder = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      streamRef.current = stream;
      isActive.current = true;
      const options = { mimeType: mimeType.current };
      if (mimeType && mimeType.current === "") {
        let options = { mimeType: "" };
        if (MediaRecorder.isTypeSupported("audio/webm; codecs=opus")) {
          options = { mimeType: "audio/webm; codecs=opus" };
        } else if (MediaRecorder.isTypeSupported("audio/webm; codecs=vp9")) {
          options = { mimeType: "audio/webm; codecs=vp9" };
        } else if (MediaRecorder.isTypeSupported("audio/webm")) {
          options = { mimeType: "audio/webm" };
        } else if (MediaRecorder.isTypeSupported("audio/mp4; codecs=opus")) {
          options = { mimeType: "audio/mp4; codecs=opus" };
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          options = { mimeType: "audio/mp4" };
        } else {
          mimeType.current = "audio/webm";
        }

        mimeType.current = options.mimeType;
      }
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
      mediaRecorderRef.current.start(parseInt(process.env.NEXT_PUBLIC_EMIT_DELAY!));
    });
  };

  const handleDataAvailable = async (event: BlobEvent) => {
    if (!isActive.current || event.data.size === 0) {
      return;
    }

    chunksRef.current.push(event.data);
    const audioBlob = new Blob(chunksRef.current, { type: mimeType.current });
    const formData = new FormData();
    formData.append("audio", audioBlob);
    const { transcript: new_transcription, rtf } = await transcribeAudio(
      formData, 
      apiKey,
      Date.now(), 
      noSpeechProb
    );

    curTranscript.current = new_transcription;
    
    let audio_len = chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
    if (audio_len >= 300000) {
      frzTranscript.current += " " + curTranscript.current;
      curTranscript.current = "";
      setTranscript(frzTranscript.current.trim() + " " + curTranscript.current.trim());
      onTranscription(frzTranscript.current.trim() + " " + curTranscript.current.trim(), rtf);
      resetAndInitializeRecorder();
    } else {
      setTranscript(frzTranscript.current.trim() + " " + curTranscript.current.trim());
      onTranscription(frzTranscript.current.trim() + " " + curTranscript.current.trim(), rtf);
    }
  };

  const startRecording = () => {
    resetAndInitializeRecorder();
  };

  const stopRecording = async () => {
    isActive.current = false;
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  return (
    <Mic 
      className={cn(
        (recording ? "bg-red-400 animate-pulse" : "hover:bg-slate-200"),
        "h-20 w-20 border p-4 cursor-pointer rounded-full"
      )}
      onClick={toggleRecording}
    />
  );
};

export default Microphone;