import { ChatGroq } from '@langchain/groq';
import { LangChainAdapter, Message, StreamingTextResponse } from 'ai';
import { AIMessage, HumanMessage } from '@langchain/core/messages';

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: Message[];
  } = await req.json();

  const model = new ChatGroq({
    model: 'llama3-70b-8192',
    temperature: 0,
  });

  const stream = await model.stream(
    messages.map(message =>
      message.role == 'user'
        ? new HumanMessage(message.content)
        : new AIMessage(message.content),
    ),
  );

  return new StreamingTextResponse(LangChainAdapter.toAIStream(stream));
}