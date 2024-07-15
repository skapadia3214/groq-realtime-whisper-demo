'use client';
import Microphone from '@/components/microphone';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatResponse } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { HelpCircle } from 'lucide-react';

interface Model {
  id: string;
  created: number;
  object: 'model';
  owned_by: string;
}

interface SpeedInsights {
  sttRTF: number | null;
  ctps: number | null;
}

const defaultSystemPrompt = `\
Your task is to correct any errors, improve grammar and clarity, \
and ensure the transcript is coherent and accurate.\
`;

export default function Chat() {
  const [transcript, setTranscript] = useState<string>("");
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [autoRefine, setAutoRefine] = useState<boolean>(false);
  const [systemPrompt, setSystemPrompt] = useState<string>(defaultSystemPrompt);
  const [models, setModels] = useState<Model[]>([]);
  const [speedInsights, setSpeedInsights] = useState<SpeedInsights>({ sttRTF: null, ctps: null });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const modelData: Model[] = (await response.json()).models;
      const filteredModels = modelData.filter(model => model.id !== 'whisper-large-v3');
      setModels(filteredModels);
      if (filteredModels.length > 0) {
        setSelectedModel(filteredModels[0].id);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const submitTranscript = async (newTranscript: string, rtf: number | null) => {
    setSpeedInsights(prev => ({ ...prev, sttRTF: rtf }));
    if (autoRefine) {
      await handleRefineTranscript(newTranscript);
    } else {
      setTranscript(newTranscript);
    }
  }

  const clearTranscript = () => {
    setTranscript("");
    setSpeedInsights({ sttRTF: null, ctps: null });
  }

  const handleRefineTranscript = async (textToRefine: string = transcript) => {
    if (textToRefine && selectedModel) {
      setIsRefining(true);
      let chatResponse: ChatResponse | null = null;
  
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: textToRefine,
            systemPrompt: systemPrompt,
            model: selectedModel,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to refine transcript');
        }
  
        chatResponse = await response.json();
        const refinedTranscript = chatResponse!.response;
        setTranscript(refinedTranscript!);
      } catch (error) {
        console.error("Error refining transcript:", error);
      } finally {
        if (chatResponse) {
          setSpeedInsights(prev => ({ 
            ...prev, 
            ctps: chatResponse!.comp_tokens / chatResponse!.comp_time!
          }));
        }
        setIsRefining(false);
      }
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-4 overflow-x-hidden">
      <div className="w-full max-w-3xl flex flex-col items-center space-y-4">
        <div className="mb-6">
          <Link href={"https://groq.com"}>
            <Image
              src="/banner.svg"
              alt='Powered by Groq'
              height={380}
              width={380}
            />
          </Link>
        </div>
        
        <div className="w-full flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Select onValueChange={setSelectedModel} value={selectedModel}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-none">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-refine"
                      checked={autoRefine}
                      onCheckedChange={setAutoRefine}
                    />
                    <label htmlFor="auto-refine">Auto Refine</label>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>When enabled, automatically refines the transcript using the LLM and instructions provided in realtime</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle 
                  size={16} 
                  className="text-gray-500 cursor-pointer" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>When enabled, automatically refines the transcript using the LLM and instructions provided in realtime</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="w-full space-y-2">
          <Label htmlFor="system-prompt" className="text-sm font-medium">
            Instructions
          </Label>
          <Textarea
            id="system-prompt"
            placeholder="Instructions for refining/changing the transcript in realtime (optional)"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full min-h-[100px] max-h-[400px] rounded-none"
          />
        </div>
        
        <Microphone onTranscription={submitTranscript} noSpeechProb={parseFloat(process.env.NEXT_PUBLIC_NO_SPEECH_THRESHOLD!)}/>
        
        <div className="flex space-x-2">
          <Button
            onClick={clearTranscript}
            className="rounded-none text-groqPrimary1 hover:text-groqPrimary1 text-md"
            variant='outline'
          >
            Clear Transcript
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleRefineTranscript()}
                  className="rounded-none text-groqPrimary1 hover:text-groqPrimary1 text-md"
                  variant='outline'
                  disabled={!transcript || isRefining || autoRefine || !selectedModel}
                >
                  {isRefining ? 'Refining...' : 'Refine Transcript'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manually refine the current transcript using the selected model</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-auto"
                  disabled={!transcript || isRefining || autoRefine || !selectedModel}
                >
                  <HelpCircle size={16} className="text-gray-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manually refine the current transcript using the selected model</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="w-full p-4 border max-h-60 overflow-auto">
          <ReactMarkdown className="text-left text-md text-[#434343]">
            {transcript}
          </ReactMarkdown>
        </div>
        
        <div className="w-full text-sm text-gray-500">
          {speedInsights.sttRTF !== null && (
            <p>Speech-to-Text Speed Factor: {speedInsights.sttRTF.toFixed(2)}x</p>
          )}
          {speedInsights.ctps !== null && (
            <p>LLM Inference Speed: {speedInsights.ctps.toFixed(2)} Tokens/sec</p>
          )}
        </div>
      </div>
    </div>
  );;
}