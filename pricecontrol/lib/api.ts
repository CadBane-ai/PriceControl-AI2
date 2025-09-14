import type { Conversation, Message, Usage, User } from "./types"

// Mock API client functions - replace with real implementations later
export class ApiClient {
  private baseUrl = "/api"

  async register(email: string, password: string): Promise<void> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Mock register:", { email })
    // Set mock auth for preview
    localStorage.setItem("mock-auth", "true")
  }

  async login(email: string, password: string): Promise<User> {
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
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Mock forgot password:", { email })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Mock reset password:", { token })
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
    // Mock implementation
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      plan: "free",
      usedToday: 15,
      dailyLimit: 50,
    }
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
