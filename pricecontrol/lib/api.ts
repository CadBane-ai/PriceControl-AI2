import type { Conversation, Message, Usage, User } from "./types"

// Mock API client functions - replace with real implementations later
export class ApiClient {
  private baseUrl = "/api"

  async register(email: string, password: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error("Registration failed")
  }

  async login(email: string, password: string): Promise<User> {
    // Delegate to NextAuth credentials provider
    const params = new URLSearchParams()
    params.set("email", email)
    params.set("password", password)
    // NextAuth expects form-encoded by default; we'll call via next-auth/react in page for feedback
    throw new Error("Use next-auth signIn in UI")
  }

  async forgotPassword(email: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error("Request failed")
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/auth/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    if (!res.ok) throw new Error("Reset failed")
  }

  async getConversations(): Promise<Conversation[]> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [
      {
        id: "1",
        title: "Market Analysis Q4 2024",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "2",
        title: "Portfolio Optimization",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]
  }

  async getMessages(conversationId: string): Promise<Message[]> {
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

  async sendMessage(messages: Message[], model: "instruct" | "reasoning"): Promise<ReadableStream> {
    const res = await fetch(`${this.baseUrl}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model }),
    })
    if (!res.ok || !res.body) throw new Error("Chat failed")
    return res.body
  }

  async getUsage(): Promise<Usage> {
    const res = await fetch(`${this.baseUrl}/usage`)
    if (!res.ok) throw new Error("Failed to load usage")
    return res.json()
  }

  async createCheckoutSession(): Promise<{ url: string }> {
    const res = await fetch(`${this.baseUrl}/billing/checkout`, { method: "POST" })
    if (!res.ok) throw new Error("Checkout failed")
    return res.json()
  }
}

export const apiClient = new ApiClient()
