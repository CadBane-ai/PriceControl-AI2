/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Conversation, Message, Usage, User } from "./types"

// Mock API client functions - replace with real implementations later
export class ApiClient {
  private baseUrl = "/api"

  async register(email: string, _password: string): Promise<void> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Mock register:", { email })
    // Set mock auth for preview
    localStorage.setItem("mock-auth", "true")
  }

  async login(email: string, _password: string): Promise<User> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Set mock auth for preview
    localStorage.setItem("mock-auth", "true")
    return {
      id: "1",
      email,
      name: email.split("@")[0],
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      cache: "no-store",
      body: JSON.stringify({ email }),
    })
    if (!res.ok && res.status !== 202) {
      throw new Error(`Failed to request password reset: ${res.status}`)
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      cache: "no-store",
      body: JSON.stringify({ token, password }),
    })
    if (res.status === 204) {
      return
    }

    if (res.status === 410) {
      const error = new Error("Reset token expired. Please request a new link.") as Error & { code?: string }
      error.code = "RESET_TOKEN_EXPIRED"
      throw error
    }

    if (!res.ok) {
      throw new Error(`Failed to reset password: ${res.status}`)
    }
  }

  async getConversations(): Promise<Conversation[]> {
    const res = await fetch("/api/conversations", { cache: "no-store" })
    if (!res.ok) throw new Error(`Failed to load conversations: ${res.status}`)
    const data = await res.json()
    return data.conversations as Conversation[]
  }

  async createConversation(title?: string): Promise<Conversation> {
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    if (!res.ok) throw new Error(`Failed to create conversation: ${res.status}`)
    const data = await res.json()
    return data.conversation as Conversation
  }

  async renameConversation(id: string, title: string): Promise<Conversation> {
    const res = await fetch(`/api/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    if (!res.ok) throw new Error(`Failed to rename conversation: ${res.status}`)
    const data = await res.json()
    return data.conversation as Conversation
  }

  async getMessages(_conversationId: string): Promise<Message[]> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [
      {
        id: "1",
        role: "user",
        content: "What are the key market trends for Q4 2024?",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "2",
        role: "assistant",
        content: "Based on current market data, here are the key trends for Q4 2024...",
        createdAt: new Date(Date.now() - 3500000).toISOString(),
      },
    ]
  }

  async sendMessage(_messages: Message[], _model: "instruct" | "reasoning"): Promise<ReadableStream> {
    // Mock streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const response =
          "This is a mock streaming response from the AI assistant. In a real implementation, this would connect to your AI service."
        const words = response.split(" ")
        let i = 0

        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(words[i] + " "))
            i++
          } else {
            controller.close()
            clearInterval(interval)
          }
        }, 100)
      },
    })

    return stream
  }

  async getUsage(): Promise<Usage> {
    const res = await fetch("/api/usage", { cache: "no-store" })
    if (!res.ok) {
      throw new Error(`Failed to load usage summary: ${res.status}`)
    }
    const data = await res.json()
    return data as Usage
  }

  async createCheckoutSession(): Promise<{ url: string }> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      url: "https://checkout.stripe.com/mock-session",
    }
  }
}

export const apiClient = new ApiClient()
