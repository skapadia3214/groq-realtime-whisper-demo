"use client";
import { transcribeAudio } from "@/lib/transcriber";
import { cn } from "@/lib/utils";
import { MicrophoneProps } from "@/lib/types";
import { Button } from "./ui/button";
import { Mic } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

const Microphone: React.FC<MicrophoneProps> = ({ onTranscription, noSpeechProb }) => {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const currentMinuteRef = useRef<number>(0);

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
    setRecording(!recording);
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const options = { mimeType: "audio/webm" };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      startTimeRef.current = Date.now();
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        async (event: BlobEvent) => {
          if (event.data.size > 0) {
            const currentTime = Date.now();
            const elapsedMinutes = Math.floor((currentTime - startTimeRef.current!) / 60000);

            if (elapsedMinutes > currentMinuteRef.current) {
              // More than a minute has passed, process new chunks only
              chunksRef.current = [event.data]; // Reset with the current chunk only
              currentMinuteRef.current = elapsedMinutes; // Update current minute
            } else {
              // Still within the same minute, accumulate chunks
              chunksRef.current.push(event.data);
            }

            const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
            const formData = new FormData();
            formData.append("audio", audioBlob);
            const new_transcription = await transcribeAudio(formData, currentTime, noSpeechProb);

            if (elapsedMinutes > currentMinuteRef.current) {
              setTranscription(prevTranscript => `${prevTranscript} ${new_transcription}`);
            } else {
              setTranscription(new_transcription);
            }
          }
        },
      );
      mediaRecorderRef.current.start(1000); // Emit a blob every 1000ms
    });
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop()); // Stop the audio track
    }
  };

  useEffect(() => {
    onTranscription(transcription);
  }, [transcription]);

  return (
    <Mic 
      className={cn(
        (recording ? "bg-red-400 animate-pulse" : ""),
        "h-20 w-20 border p-4 cursor-pointer rounded-full hover:bg-slate-200"
      )}
      onClick={toggleRecording}
    />
  );
};

export default Microphone;
