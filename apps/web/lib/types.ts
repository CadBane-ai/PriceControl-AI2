export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export interface ChatState {
  conversationId: string | null
  messages: Message[]
  loading: boolean
  model: "instruct" | "reasoning"
}

export interface Usage {
  plan: "free" | "pro"
  usedToday: number
  dailyLimit: number
}

export interface User {
  id: string
  email: string
  name?: string
}
