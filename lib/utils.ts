import { Message } from "ai"
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function vercelToLangchain(
  messages: Message[]
) {
  return messages.map(message =>
    message.role == 'user'
      ? new HumanMessage(message.content)
      : message.role == 'system'
          ? new SystemMessage(message.content)
          : new AIMessage(message.content),
  )
}