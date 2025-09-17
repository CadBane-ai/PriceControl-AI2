"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { ChatThread } from "@/components/chat/chat-thread"
import { MessageComposer } from "@/components/chat/message-composer"
import type { ChatState } from "@/lib/types"
import { OPENROUTER_MODELS, findOptionById } from "@/lib/models"
import { useChat } from "ai/react"

export default function DashboardPage() {
  const [chatState, setChatState] = useState<ChatState>({
    conversationId: null,
    messages: [],
    loading: false,
    model: "instruct",
    modelId: OPENROUTER_MODELS.instruct.id,
  })
  const [streamingMessage] = useState("")

  const handleModelChange = (model: "instruct" | "reasoning") => {
    setChatState((prev) => ({ ...prev, model, modelId: OPENROUTER_MODELS[model].id }))
  }

  const handleModelIdChange = (modelId: string) => {
    // Infer mode from modelId if it matches known entries; default to instruct
    const opt = findOptionById(modelId)
    const mode = opt?.mode as "instruct" | "reasoning" | undefined
    setChatState((prev) => ({ ...prev, model: mode ?? prev.model, modelId }))
  }
  // useChat manages message state and streaming to /api/ai (Story 2.3)
  const { messages, isLoading, append } = useChat({ api: "/api/ai", body: { model: chatState.modelId, mode: chatState.model } })

  const mappedMessages = useMemo(() => {
    return messages.map((m, idx) => ({
      id: m.id ?? String(idx),
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: new Date().toISOString(),
    }))
  }, [messages])


  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        <TopBar modelId={chatState.modelId!} onModelIdChange={handleModelIdChange} />

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Chat Thread (scrollable area) */}
            <ChatThread messages={mappedMessages} isLoading={isLoading} streamingMessage={streamingMessage} />

            {/* Message Composer wired to /api/ai via useChat (Story 2.3) */}
            <MessageComposer
              onSendMessage={(content) => {
                // Keep model selection local for 2.3; not sent yet (2.4)
                append({ role: "user", content })
              }}
              disabled={isLoading}
              placeholder="Ask about market trends, portfolio analysis, or financial insights..."
            />
          </div>
        </main>
      </div>
    </div>
  )
}
