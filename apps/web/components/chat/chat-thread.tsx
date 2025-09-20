"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./message-bubble"
import { CitationsPanel } from "./citations-panel"
import type { Message } from "@/lib/types"

interface ChatThreadProps {
  messages: Message[]
  isLoading?: boolean
  streamingMessage?: Message | null
}

export function ChatThread({ messages, isLoading = false, streamingMessage }: ChatThreadProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const node = bottomRef.current
    if (node && typeof node.scrollIntoView === "function") {
      node.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, streamingMessage])

  // Mock citations for demonstration
  const mockCitations = [
    {
      id: "1",
      title: "Q4 2024 Market Analysis Report",
      type: "document" as const,
      snippet: "Comprehensive analysis of market trends and economic indicators for the fourth quarter of 2024.",
    },
    {
      id: "2",
      title: "Federal Reserve Economic Data",
      type: "data" as const,
      url: "https://fred.stlouisfed.org",
      snippet: "Latest economic data and statistics from the Federal Reserve Bank of St. Louis.",
    },
  ]

  if (messages.length === 0 && !isLoading && !streamingMessage) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-foreground">Start a conversation</h2>
          <p className="text-muted-foreground text-sm">
            Ask me about market analysis, portfolio optimization, financial trends, or any other finance-related
            questions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1">
      <div className="space-y-0">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming message */}
        {streamingMessage && (
          <MessageBubble
            message={streamingMessage}
            isStreaming={true}
          />
        )}

        {/* Show citations after assistant messages */}
        {messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && !isLoading && (
          <div className="px-4 pb-4">
            <CitationsPanel citations={mockCitations} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
