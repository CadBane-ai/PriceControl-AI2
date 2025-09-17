import { describe, it, expect } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { MessageComposer } from "../components/chat/message-composer"
import { ChatThread } from "../components/chat/chat-thread"
import type { Message } from "../lib/types"

describe("Frontend chat logic (Story 2.2)", () => {
  it("appends user message on send, clears input, and shows loading", async () => {
    function TestHarness() {
      const [messages, setMessages] = useState<Message[]>([])
      const [loading, setLoading] = useState(false)

      const handleSend = (content: string) => {
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}`, role: "user", content, createdAt: new Date().toISOString() },
        ])
        setLoading(true)
        setTimeout(() => setLoading(false), 300)
      }

      return (
        <div>
          <ChatThread messages={messages} isLoading={loading} />
          <MessageComposer onSendMessage={handleSend} disabled={loading} />
        </div>
      )
    }

    render(<TestHarness />)
    const user = userEvent.setup()

    const input = screen.getByLabelText(/message input/i) as HTMLTextAreaElement
    const sendButton = screen.getByRole("button", { name: /send message/i })

    await user.type(input, "Hello world")
    await user.click(sendButton)

    await waitFor(() => expect(input.value).toBe(""))
    await waitFor(() => expect(screen.getByText(/hello world/i)).toBeInTheDocument())
    await waitFor(() => expect(sendButton).toBeDisabled())
  })
})
