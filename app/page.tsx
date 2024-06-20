'use client';
import Microphone from '@/components/microphone';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
      <div className="mb-6">
        <Link
          href={"https://groq.com"}
        >
        <Image
          src="/banner.png"
          alt='Powered by Groq'
          height={380}
          width={380}
        />
        </Link>
      </div>
      <Microphone onTranscription={submitTranscript} noSpeechProb={parseFloat(process.env.NEXT_PUBLIC_NO_SPEECH_THRESHOLD!)}/>
      <Button
        onClick={clearTranscript}
        className="rounded-none text-groqPrimary1 hover:text-groqPrimary1 text-md"
        variant='outline'
      >
        Clear Transcript
      </Button>
      <span className="p-4 border w-full max-w-lg max-h-30 text-left text-md text-[#434343] overflow-auto">
        {transcript}
      </span>
    </div>
  );
  
}
