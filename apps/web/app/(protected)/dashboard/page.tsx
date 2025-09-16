"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { ChatThread } from "@/components/chat/chat-thread"
import { MessageComposer } from "@/components/chat/message-composer"
import type { ChatState } from "@/lib/types"

export default function DashboardPage() {
  const [chatState, setChatState] = useState<ChatState>({
    conversationId: null,
    messages: [],
    loading: false,
    model: "instruct",
  })
  const [streamingMessage] = useState("")

  const handleModelChange = (model: "instruct" | "reasoning") => {
    setChatState((prev) => ({ ...prev, model }))
  }

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: `${Date.now()}`,
      role: "user" as const,
      content,
      createdAt: new Date().toISOString(),
    }
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      loading: true,
    }))
    // Simulate processing without any network calls (Story 2.2)
    setTimeout(() => {
      setChatState((prev) => ({ ...prev, loading: false }))
    }, 300)
  }


  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        <TopBar model={chatState.model} onModelChange={handleModelChange} />

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Chat Thread (scrollable area) */}
            <ChatThread
              messages={chatState.messages}
              isLoading={chatState.loading}
              streamingMessage={streamingMessage}
            />

            {/* Message Composer (client-side logic only for Story 2.2) */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              disabled={chatState.loading}
              placeholder="Ask about market trends, portfolio analysis, or financial insights..."
            />
          </div>
        </main>
      </div>
    </div>
  )
}
