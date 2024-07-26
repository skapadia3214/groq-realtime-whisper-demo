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
  const mimeType = useRef<string>("");

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported on your browser!");
      return;
    }
    
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

  const askForMicrophonePermissionAndDefineAudioMimeType = () => {
    try {
      if (mimeType.current === "") {
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
          console.error("Microphone error: no suitable mimetype found for this device");
        }

        mimeType.current = options.mimeType;
      }
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((_) => {
          console.error("Microphone error: Error accessing the microphone");
        });
    } catch (_) {
      console.error("Microphone error: Error accessing the microphone");
    }
  };

  const initializeMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType.current,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(Number.parseInt(process.env.NEXT_PUBLIC_EMIT_DELAY || "1000"));

      return mediaRecorder;
    } catch (error) {
      console.error("Error accessing the microphone:", error);
      throw error;
    }
  };
  
  const toggleRecording = async () => {

    if (!recording) {
      // @ts-ignore
      navigator.permissions.query({ name: "microphone" }).then((result) => {
        if (result.state === "granted") {
          initializeMediaRecorder().then(() => {
            startRecording();
          });
        } else if (result.state === "prompt") {
          askForMicrophonePermissionAndDefineAudioMimeType();
        } else if (result.state === "denied") {
          console.error("Unable to access the microphone. Please enable microphone permissions to proceed.");
        }
      });
    } else {
      await stopRecording();
    }
    setRecording(!recording);
  };

  const handleDataAvailable = async (event: BlobEvent) => {
    if (!isActive.current || event.data.size === 0) {
      return;
    }

    chunksRef.current.push(event.data);
    const audioBlob = new Blob(chunksRef.current, { type: mimeType.current });
    const formData = new FormData();
    formData.append("audio", audioBlob);
    
    try {
      const { transcript: new_transcription, rtf } = await transcribeAudio(
        formData, 
        apiKey,
        Date.now(), 
        noSpeechProb,
        mimeType.current
      );

      curTranscript.current = new_transcription;
      
      const audio_len = chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
      if (audio_len >= 300000) {
        frzTranscript.current += ` ${curTranscript.current}`;
        curTranscript.current = "";
        setTranscript(`${frzTranscript.current.trim()} ${curTranscript.current.trim()}`);
        onTranscription(`${frzTranscript.current.trim()} ${curTranscript.current.trim()}`, rtf);
        await initializeMediaRecorder();
      } else {
        setTranscript(`${frzTranscript.current.trim()} ${curTranscript.current.trim()}`);
        onTranscription(`${frzTranscript.current.trim()} ${curTranscript.current.trim()}`, rtf);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
    }
  };

  const startRecording = async () => {
    setRecording(true);
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
    setRecording(false);
  };

  return (
    <>
    <Mic 
      className={cn(
        (recording ? "bg-red-400 animate-pulse" : "hover:bg-slate-200"),
        "h-20 w-20 border p-4 cursor-pointer rounded-full",
      )}
      onClick={toggleRecording}
    />
    </>
  );
};

export default Microphone;