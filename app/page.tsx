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
      <Microphone onTranscription={submitTranscript} noSpeechProb={1e-3}/>
      <Button
        onClick={clearTranscript}
        className="rounded-none"
      >
        Clear Transcript
      </Button>
      <span className="p-4 border w-full max-w-lg max-h-30 text-left overflow-auto">
        {transcript}
      </span>
    </div>
  );
}
