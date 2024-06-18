import { ChatGroq } from '@langchain/groq';
import { LangChainAdapter, Message, StreamingTextResponse, generateId } from 'ai';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableMap } from "@langchain/core/runnables";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"

const CONCAT_SYSTEM_PROMPT = `You have been provided with a set of responses from various open-source models to the latest user query. 
Your task is to synthesize these responses into a single, high-quality response. 
It is crucial to critically evaluate the information provided in these responses, recognizing that some of it may be biased or incorrect. 
Your response should not simply replicate the given answers but should offer a refined, accurate, and comprehensive reply to the instruction. 
Ensure your response is well-structured, coherent, and adheres to the highest standards of accuracy and reliability.

Responses from models:`

function injectReferencesToMessages(
    messages: Message[],
    references: string[],
    systemPrompt?: undefined
  ): Message[] {
  
    let system = systemPrompt || CONCAT_SYSTEM_PROMPT;
  
    for (let i = 0; i < references.length; i++) {
      system += `\n${i + 1}. ${references[i]}`;
    }
  
    if (messages[0] && messages[0].role === "system") {
      messages[0].content += `\n\n${system}`;
    } else {
      messages.unshift({ role: "system", content: system, id: generateId() });
    }
  
    return messages;
}
  
type CycleConfig = {
    model: string,
    systemPrompt?: string
}[]

async function moa_agent(
    cycleConfig: CycleConfig,
    numCycles: number = 2,
    messages: Message[]
) {

    const sysPrompt1 = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant."],
        new MessagesPlaceholder("messages")
    ]);
    const sysPrompt2 = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant."],
    new MessagesPlaceholder("messages")
    ]);
    const sysPrompt3 = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant."],
    new MessagesPlaceholder("messages")
    ]);

    const model1 = new ChatGroq({model: 'llama-70b-8192'})
    const model2 = new ChatGroq({model: 'llama-70b-8192'})
    const model3 = new ChatGroq({model: 'llama-70b-8192'})

    
}

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: Message[];
  } = await req.json();

  const model = new ChatGroq({
    model: 'llama3-8b-8192',
    temperature: 0,
  });

  const stream = await model.stream(
    messages.map(message =>
      message.role == 'user'
        ? new HumanMessage(message.content)
        : message.role == 'system'
            ? new SystemMessage(message.content)
            : new AIMessage(message.content),
    ),
  );

  return new StreamingTextResponse(LangChainAdapter.toAIStream(stream));
}