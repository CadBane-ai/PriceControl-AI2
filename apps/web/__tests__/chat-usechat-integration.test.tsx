import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { Message } from "@/lib/types"
import { OPENROUTER_MODELS } from "@/lib/models"

const STATIC_TRANSCRIPT: Message[] = [
  {
    id: "assistant-1",
    role: "assistant",
    content: "Welcome to PriceControl AI. Ask about your portfolio, market trends, or macro insights to get started.",
    createdAt: "2025-09-18T00:00:00.000Z",
  },
]

const useChatMock = vi.fn()
const handleSubmitMock = vi.fn()
const handleInputChangeMock = vi.fn()

const chatThreadProps: Array<{
  messages: Message[]
  streamingMessage: Message | null
  isLoading: boolean
}> = []

const ChatThreadMock = vi.fn(({ messages, streamingMessage }: { messages: Message[]; streamingMessage: Message | null }) => {
  chatThreadProps.push({ messages, streamingMessage, isLoading: false })
  return (
    <div data-testid="chat-thread">
      {messages.map((msg) => (
        <p key={msg.id}>{msg.content}</p>
      ))}
      {streamingMessage ? <span data-testid="streaming-message">{streamingMessage.content}</span> : null}
    </div>
  )
})

vi.mock("ai/react", () => ({
  useChat: (...args: unknown[]) => useChatMock(...args),
}))

const pushMock = vi.fn()
const sessionMock = { user: { id: "user-1", email: "user@example.com" } }
const toastSpy = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: sessionMock, status: "authenticated" }),
  signOut: vi.fn(),
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}))

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: toastSpy, toasts: [], dismiss: vi.fn() }),
}))

vi.mock("@/components/chat/chat-thread", () => ({
  ChatThread: ChatThreadMock,
}))

vi.mock("@/lib/api", () => ({
  apiClient: {
    getUsage: vi.fn().mockResolvedValue({ plan: "free", usedToday: 0, dailyLimit: 50 }),
    getConversations: vi.fn().mockResolvedValue([]),
    createConversation: vi.fn().mockResolvedValue({
      id: "conv-1",
      title: "Untitled conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    renameConversation: vi.fn(),
  },
}))

beforeEach(() => {
  chatThreadProps.length = 0
  useChatMock.mockReturnValue({
    messages: STATIC_TRANSCRIPT,
    input: "Draft message",
    handleInputChange: handleInputChangeMock,
    handleSubmit: handleSubmitMock,
    isLoading: false,
    error: null,
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("Dashboard useChat integration (Story 2.3)", () => {
  it("configures useChat with /api/ai and submits messages", async () => {
    const DashboardPage = (await import("@/app/(protected)/dashboard/page")).default
    const user = userEvent.setup()
    render(<DashboardPage />)

    expect(useChatMock).toHaveBeenCalled()
    const configArg = useChatMock.mock.calls[0]?.[0] as { api: string; initialMessages: Message[]; body: Record<string, unknown> }
    expect(configArg).toMatchObject({ api: "/api/ai" })
    expect(configArg.body).toEqual({
      model: OPENROUTER_MODELS.instruct.id,
      mode: "instruct",
    })
    expect(configArg.initialMessages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "assistant-1",
          role: "assistant",
        }),
      ]),
    )

    const input = screen.getByPlaceholderText(/message pricecontrol ai/i)
    await user.type(input, "Question?")
    expect(handleInputChangeMock).toHaveBeenCalled()

    const send = screen.getByRole("button", { name: /send/i })
    await user.click(send)
    expect(handleSubmitMock).toHaveBeenCalled()
  })

  it("passes streaming assistant messages to ChatThread", async () => {
    const streamingAssistant: Message = {
      id: "assistant-stream",
      role: "assistant",
      content: "Streaming...",
      createdAt: "2025-09-18T00:00:05.000Z",
    }

    useChatMock.mockReturnValue({
      messages: [...STATIC_TRANSCRIPT, streamingAssistant],
      input: "Draft message",
      handleInputChange: handleInputChangeMock,
      handleSubmit: handleSubmitMock,
      isLoading: true,
      error: null,
    })

    const DashboardPage = (await import("@/app/(protected)/dashboard/page")).default
    render(<DashboardPage />)

    const latestCall = ChatThreadMock.mock.calls.at(-1)
    expect(latestCall).toBeDefined()
    const props = latestCall![0]
    expect(props.streamingMessage).toEqual(streamingAssistant)
    expect(props.messages.find((msg: Message) => msg.id === streamingAssistant.id)).toBeUndefined()
    expect(screen.getByTestId("streaming-message")).toHaveTextContent("Streaming...")
  })

  it("updates useChat body when the user selects a different model", async () => {
    const DashboardPage = (await import("@/app/(protected)/dashboard/page")).default
    const user = userEvent.setup()
    render(<DashboardPage />)

    const trigger = screen.getByTestId("model-picker-trigger")
    await user.click(trigger)

    const reasoningOption = screen.getByTestId("model-option-meta-llama/llama-3.3-70b-instruct")
    await user.click(reasoningOption)

    const latestCall = useChatMock.mock.calls.at(-1)?.[0] as { body?: Record<string, unknown> } | undefined
    expect(latestCall?.body).toEqual({
      model: "meta-llama/llama-3.3-70b-instruct",
      mode: "reasoning",
    })
  })
})
