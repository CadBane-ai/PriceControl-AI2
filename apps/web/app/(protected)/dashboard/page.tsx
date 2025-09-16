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

            {/* Message Composer (static scaffold for Story 2.1) */}
            <MessageComposer
              onSendMessage={() => { /* static UI scaffold - no send in 2.1 */ }}
              disabled={true}
              placeholder="Chat UI scaffold (Story 2.1)"
            />
          </div>
        </main>
      </div>
    </div>
  )
}
