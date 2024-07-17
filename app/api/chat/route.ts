import { ChatResponse } from '@/lib/types';
import Groq from 'groq-sdk';
import { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions.mjs';
import { NextResponse } from 'next/server';


const defaultInst = `\
Your task is to correct any errors, improve grammar and clarity, \
and ensure the transcript is coherent and accurate.\
`
export async function POST(req: Request): Promise<NextResponse<ChatResponse>> {
  const {
    query,
    apiKey,
    systemPrompt,
    model,
    prevMessages,
    prevTranscript,
    ...args
  }: {
    query: string;
    apiKey: string
    systemPrompt?: string;
    model?: string;
    prevMessages?: ChatCompletionMessageParam[];
    prevTranscript?: string;
    [key: string]: any;
  } = await req.json();

  const client = new Groq({ apiKey: apiKey });
  const SystemPrompt = `\
You are an AI assistant that translates, converts transcripts based on the instructions given to you. \
Instructions:
${systemPrompt ? systemPrompt : defaultInst}
The transcript is provided within the <Transcript></Transcript> tags. \
Your response should be JSON formatted containing the changed transcript based on the instruction provided. \
JSON schema:
{
  "transcript": "Converted Transcript here"
}
Make sure to escape any special characters that might cause any errors in your JSON response. \
If the transcript is empty or if you see any weird behaviour like a lot of repeated words, return an empty string within the "transcript" field in your JSON response. \
When relevant, use the Previous Refined Transcript to support your response. \
For example, if the transcript has not changed and the previous refined transcript accurately follows the instructions, just repeat the output.\
`

  const UserMessage = prevTranscript ? `Previous Refined Transcript: ${prevTranscript} \n\n<Transcript> ${query} </Transcript>` : `<Transcript> ${query} </Transcript>`;
  let messages: ChatCompletionMessageParam[];
  if (prevMessages) {
    messages = [
      {
        role: "system",
        content: SystemPrompt
      },
      ...prevMessages,
      {
        role: "user",
        content: UserMessage
      }
    ]
  } else {
    messages = [
      {
        role: "system",
        content: SystemPrompt
      },
      {
        role: "user",
        content: UserMessage
      }
    ]
  }
  const response = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: messages,
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