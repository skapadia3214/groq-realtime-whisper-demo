"use client";
import { transcribeAudio } from "@/lib/transcriber";
import { cn } from "@/lib/utils";
import { MicrophoneProps } from "@/lib/types";
import { Mic } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

const Microphone: React.FC<MicrophoneProps> = ({ onTranscription, noSpeechProb }) => {
  const [recording, setRecording] = useState(false);
  const isActive = useRef(true); // Ref to track if transcription should be active
  const frzTranscript = useRef<string>("");
  const curTranscript = useRef<string>("");
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

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
      mediaRecorderRef.current.stop(); // Stop the recording
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop the media stream tracks
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      streamRef.current = stream;
      isActive.current = true; // Set the active flag to true when starting
      const options = { mimeType: "audio/webm" };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      mediaRecorderRef.current.addEventListener("dataavailable", handleDataAvailable);
      mediaRecorderRef.current.start(800); // Start recording and emit chunks every 800ms
    });
  };

  const handleDataAvailable = async (event: BlobEvent) => {
    if (!isActive.current || event.data.size === 0) {
      return; // Skip processing if recording has been stopped
    }

    chunksRef.current.push(event.data);
    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob);
    const new_transcription = await transcribeAudio(formData, Date.now(), noSpeechProb);

    curTranscript.current = new_transcription;
    
    let audio_len = chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
    if (audio_len >= 100000) {
      frzTranscript.current += " " + curTranscript.current;
      curTranscript.current = "";
      // console.log("Frz trcp: ", frzTranscript.current);
      // console.log("curr trcp: ", curTranscript.current);
      setTranscript(frzTranscript.current.trim() + " " + curTranscript.current.trim());
      resetAndInitializeRecorder(); // Reset and restart the recorder
    } else {
      console.log("Frz trcp: ", frzTranscript.current);
      console.log("curr trcp: ", curTranscript.current);
      setTranscript(frzTranscript.current.trim() + " " + curTranscript.current.trim());
    }
  };

  const startRecording = () => {
    resetAndInitializeRecorder();
  };

  const stopRecording = async () => {
    isActive.current = false; // Set the active flag to false
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); // Stop the recording
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop()); // Stop the media stream tracks
      }
    }
  };

  useEffect(() => {
    onTranscription(transcript);
  }, [transcript]);

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
