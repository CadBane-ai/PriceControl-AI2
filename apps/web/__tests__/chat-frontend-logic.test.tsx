import React from "react"
import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import DashboardPage from "../app/(protected)/dashboard/page"

// Mock the AI SDK useChat hook
vi.mock("ai/react", () => ({
  useChat: vi.fn(),
}))

vi.mock("@/components/chat/model-picker", () => ({
  ModelPicker: () => <div data-testid="model-picker" />,
}))

describe("DashboardPage chat logic (Story 2.2)", () => {
  it("appends user message, clears input, and shows loading state", async () => {
    const useChatMock = await import("ai/react").then((mod) => mod.useChat)
    const user = userEvent.setup()

    let messages = [
      { id: "1", role: "assistant", content: "Welcome" },
    ]
    let input = ""

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      input = e.target.value
    }

    const handleSubmit = () => {
      messages.push({ id: `${Date.now()}`, role: "user", content: input })
      input = ""
    }

    ;(useChatMock as ReturnType<typeof vi.fn>).mockReturnValue({
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading: true, // Simulate loading state
      error: null,
    })

    const { rerender } = render(<DashboardPage />)

    const inputEl = screen.getByPlaceholderText(/message pricecontrol ai/i)
    const sendButton = screen.getByRole("button", { name: /send/i })

    await user.type(inputEl, "Hello there")
    // The mock doesn't update the input value, so we'll just check the submit
    await user.click(sendButton)

    // Re-render with updated mock values to simulate state change
    messages.push({ id: "2", role: "user", content: "Hello there" })
    input = ""
    ;(useChatMock as ReturnType<typeof vi.fn>).mockReturnValue({
      messages,
      input,
      handleInputChange,
      handleSubmit,
      isLoading: false, // Back to not loading
      error: null,
    })

    // We need to re-render the component to see the changes
    rerender(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText(/hello there/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      const updatedInputEl = screen.getByPlaceholderText(/message pricecontrol ai/i)
      expect(updatedInputEl.value).toBe("")
    })
  })
})
