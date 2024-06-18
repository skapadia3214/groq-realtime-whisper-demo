'use client';
import Microphone from '@/components/microphone';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Chat() {
  const [transcript, setTranscript] = useState<string>("");

  const submitTranscript = (newTranscript: string) => {
    setTranscript(newTranscript);
  }

  const clearTranscript = () => {
    setTranscript("");
  }

  return (
    <div className="absolute flex flex-col justify-center items-center h-full w-full space-y-4">
      <Button
        onClick={clearTranscript}
        className="rounded-none"
      >
        Clear Transcript
      </Button>
      <Microphone onTranscription={submitTranscript} noSpeechProb={1e-5}/>
      <span className="p-4 border w-full max-w-lg text-left">
        {transcript}
      </span>
    </div>
  );
}
