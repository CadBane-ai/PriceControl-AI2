import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Mock useChat to simulate streaming behavior
const appendMock = vi.fn()
vi.mock("ai/react", () => ({
  useChat: () => ({
    messages: [
      { id: "1", role: "user", content: "Hello" },
      { id: "2", role: "assistant", content: "Hi there" },
    ],
    isLoading: false,
    append: appendMock,
  }),
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

describe("Dashboard useChat integration (Story 2.3)", () => {
  it("renders messages from useChat and sends via append", async () => {
    const DashboardPage = (await import("@/app/(protected)/dashboard/page")).default
    const user = userEvent.setup()
    render(<DashboardPage />)

    // Messages are rendered
    expect(screen.getByText(/hello/i)).toBeInTheDocument()
    expect(screen.getByText(/hi there/i)).toBeInTheDocument()

    // Send a new message
    const input = screen.getByLabelText(/message input/i)
    await user.type(input, "Question?")
    const send = screen.getByRole("button", { name: /send message/i })
    await user.click(send)
    await waitFor(() => expect(appendMock).toHaveBeenCalledWith({ role: "user", content: "Question?" }))
  })
})

