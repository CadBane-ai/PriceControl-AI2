import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { MessageComposer } from "../components/chat/message-composer"
import { ChatThread } from "../components/chat/chat-thread"
import type { Message } from "../lib/types"

describe("Frontend chat logic (Story 2.2)", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

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

    const input = screen.getByLabelText(/message input/i)
    const sendButton = screen.getByRole("button", { name: /send message/i })

    await user.type(input, "Hello world")

    // Send the message
    await user.click(sendButton)

    // Input clears
    expect((input as HTMLTextAreaElement).value).toBe("")

    // Message appears in thread
    expect(screen.getByText(/hello world/i)).toBeInTheDocument()

    // Loading indicator disables the button briefly
    expect(screen.getByRole("button", { name: /sending message/i })).toBeDisabled()

    // Advance time to finish simulated processing
    vi.advanceTimersByTime(400)

    // Button re-enabled
    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled()
  })
})
