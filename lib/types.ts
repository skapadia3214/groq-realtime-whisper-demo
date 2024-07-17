export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}

export interface MicrophoneProps {
  onTranscription: (transcription: string, rtf: number | null) => void;
  noSpeechProb?: number;
  apiKey: string;
}


export type UIState = {
  id: string
  display: React.ReactNode
}[]

export type Message = {
  role: "ai" | "human";
  text: string;
};


export interface ChatResponse {
  response: string | null;
  comp_tokens: number;
  comp_time: number | undefined;
  prompt_tokens: number;
  prompt_time: number | undefined;
}