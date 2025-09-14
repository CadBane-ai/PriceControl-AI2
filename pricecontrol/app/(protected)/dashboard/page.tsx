"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { ChatThread } from "@/components/chat/chat-thread"
import { MessageComposer } from "@/components/chat/message-composer"
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import type { ChatState, Message } from "@/lib/types"

export default function DashboardPage() {
  const [chatState, setChatState] = useState<ChatState>({
    conversationId: null,
    messages: [],
    loading: false,
    model: "instruct",
  })
  const [streamingMessage, setStreamingMessage] = useState("")
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const conversationId = searchParams.get("conversation")

  // Load conversation when URL changes
  useEffect(() => {
    const loadConversation = async () => {
      if (conversationId) {
        setChatState((prev) => ({ ...prev, loading: true }))
        try {
          const messages = await apiClient.getMessages(conversationId)
          setChatState((prev) => ({
            ...prev,
            conversationId,
            messages,
            loading: false,
          }))
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load conversation",
            variant: "destructive",
          })
          setChatState((prev) => ({ ...prev, loading: false }))
        }
      } else {
        setChatState((prev) => ({
          ...prev,
          conversationId: null,
          messages: [],
          loading: false,
        }))
      }
    }

    loadConversation()
  }, [conversationId, toast])

  const handleModelChange = (model: "instruct" | "reasoning") => {
    setChatState((prev) => ({ ...prev, model }))
  }

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    }

    // Add user message immediately
    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      loading: true,
    }))

    try {
      // Send message to API
      const stream = await apiClient.sendMessage([...chatState.messages, userMessage], chatState.model)
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      let assistantContent = ""
      setStreamingMessage("")

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        assistantContent += chunk
        setStreamingMessage(assistantContent)
      }

      // Add final assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        createdAt: new Date().toISOString(),
      }

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        loading: false,
      }))
      setStreamingMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
      setChatState((prev) => ({ ...prev, loading: false }))
      setStreamingMessage("")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:ml-64">
        <TopBar model={chatState.model} onModelChange={handleModelChange} />

        <main className="flex-1 overflow-hidden">
          {!conversationId ? (
            <div className="h-full overflow-auto p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome back! Here's an overview of your PriceControl activity.
                  </p>
                </div>
                <AnalyticsOverview />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Chat Thread */}
              <ChatThread
                messages={chatState.messages}
                isLoading={chatState.loading}
                streamingMessage={streamingMessage}
              />

              {/* Message Composer */}
              <MessageComposer onSendMessage={handleSendMessage} disabled={chatState.loading} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
