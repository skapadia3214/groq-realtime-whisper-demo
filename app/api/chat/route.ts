import { ChatResponse } from '@/lib/types';
import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const defaultInst = `\
Your task is to correct any errors, improve grammar and clarity, \
and ensure the transcript is coherent and accurate.\
`
export async function POST(req: Request): Promise<NextResponse<ChatResponse>> {
  const {
    query,
    systemPrompt,
    model,
    ...args
  }: {
    query: string;
    systemPrompt?: string;
    model?: string;
    [key: string]: any;
  } = await req.json();


  const SystemPrompt = `\
  You are an AI assistant that translates, converts transcripts based on the instructions given to you. \
  Instructions:
  ${systemPrompt ? systemPrompt : defaultInst}

  The transcript is provided within the <Transcript></Transcript> tags. \
  Your response should be JSON formatted containing the changed transcript based on the instruction provided. \
  Here is the JSON schema:
  {
    "transcript": "Converted Transcript here"
  }
  Make sure to escape any special characters that might cause any errors in your JSON response.\
  `

  const UserPrompt = `<Transcript> ${query} </Transcript>`
  const response = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      {
        role: "system",
        content: SystemPrompt
      },
      {
        role: "user",
        content: UserPrompt
      }
    ],
    response_format: {'type': 'json_object'},
    ...args
  })
  const output = JSON.parse(response.choices[0].message.content!).transcript;

  return NextResponse.json({
    response: output,
    comp_tokens: response.usage!.completion_tokens,
    comp_time: response.usage!.completion_time,
    prompt_tokens: response.usage!.prompt_tokens,
    prompt_time: response.usage!.prompt_time,
  });
}