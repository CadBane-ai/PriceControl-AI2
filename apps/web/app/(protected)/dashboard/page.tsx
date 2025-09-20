"use client"

import { useCallback, useMemo, useState } from "react"
import { useChat } from "ai/react"

import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatThread } from "@/components/chat/chat-thread"
import { MessageComposer } from "@/components/chat/message-composer"
import type { Message } from "@/lib/types"
import { ModelPicker } from "@/components/chat/model-picker"
import { inferModeFromModelId, OPENROUTER_MODELS, type ChatMode } from "@/lib/models"

const STATIC_TRANSCRIPT: Message[] = [
  {
    id: "assistant-1",
    role: "assistant",
    content: "Welcome to PriceControl AI. Ask about your portfolio, market trends, or macro insights to get started.",
  },
]

const DEFAULT_MODEL_ID = OPENROUTER_MODELS.instruct.id
const DEFAULT_MODE: ChatMode = inferModeFromModelId(DEFAULT_MODEL_ID) ?? "instruct"

export default function DashboardPage() {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID)
  const [mode, setMode] = useState<ChatMode>(DEFAULT_MODE)

  const handleModelSelect = useCallback((modelId: string) => {
    setSelectedModelId(modelId)
    setMode((previous) => inferModeFromModelId(modelId) ?? previous ?? DEFAULT_MODE)
  }, [])

  const chatConfig = useMemo(
    () => ({
      initialMessages: STATIC_TRANSCRIPT,
      api: "/api/ai",
      body: {
        model: selectedModelId,
        mode,
      },
    }),
    [mode, selectedModelId],
  )

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat(chatConfig)

  const streamingMessage = useMemo(() => {
    const lastMessage = messages[messages.length - 1]
    if (isLoading && lastMessage?.role === "assistant") {
      return lastMessage
    }
    return null
  }, [messages, isLoading])

  const orderedMessages = useMemo(() => {
    return messages
      .filter((msg) => msg.id !== streamingMessage?.id)
      .sort((a, b) => (a.createdAt && b.createdAt) ? a.createdAt.getTime() - b.createdAt.getTime() : 0)
  }, [messages, streamingMessage])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col md:ml-64">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4 md:px-6">
            <div>
              <h1 className="text-lg font-semibold">Chat</h1>
              <p className="text-sm text-muted-foreground">
                Preview the upcoming PriceControl AI assistant experience.
              </p>
            </div>
            <ModelPicker selectedModelId={selectedModelId} mode={mode} onSelect={handleModelSelect} />
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <ChatThread
              messages={orderedMessages}
              isLoading={isLoading && !streamingMessage}
              streamingMessage={streamingMessage}
            />
            <MessageComposer
              input={input}
              onInputChange={handleInputChange}
              onSendMessage={handleSubmit}
              isLoading={isLoading}
              placeholder="Message PriceControl AI..."
              statusMessage={
                error
                  ? "An error occurred. Please try again."
                  : "Chat is in preview mode. Responses are simulated."
              }
            />
          </div>
        </main>
      </div>
    </div>
  )
}
