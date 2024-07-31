export type SpeedInsights = {
  sttRTF: number | null;
  ctps: number | null;
  llmResponseCached: boolean;
}

export type MicrophoneProps = {
  onTranscription: (transcription: string, rtf: number | null) => void;
  noSpeechProb?: number;
  apiKey: string;
}

export type ChatResponse = {
  response: string | null;
  comp_tokens: number;
  comp_time: number | undefined;
  prompt_tokens: number;
  prompt_time: number | undefined;
}