import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  toast: vi.fn(),
  createConversation: vi.fn(),
  getConversations: vi.fn(),
  session: { user: { id: "user-1", email: "user@example.com" } },
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: mocks.session, status: "authenticated" }),
  signOut: vi.fn(),
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}))

vi.mock("@/lib/api", () => ({
  apiClient: {
    getConversations: (...args: any[]) => mocks.getConversations(...args),
    createConversation: (...args: any[]) => mocks.createConversation(...args),
  },
}))

vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({ toast: mocks.toast, toasts: [], dismiss: vi.fn() }),
}))

describe("Sidebar new conversation", () => {
  beforeEach(() => {
    mocks.push.mockClear()
    mocks.toast.mockClear()
    mocks.createConversation.mockReset()
    mocks.getConversations.mockReset()

    mocks.createConversation.mockResolvedValue({
      id: "test-conv-1",
      title: "Untitled conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    mocks.getConversations.mockResolvedValue([])
  })

  it("creates a conversation, navigates, and shows success toast", async () => {
    const { Sidebar } = await import("@/components/dashboard/sidebar")
    const user = userEvent.setup()
    render(<Sidebar />)

    await waitFor(() => expect(mocks.getConversations).toHaveBeenCalled())
    const btn = await screen.findByRole("button", { name: /new conversation/i })
    await user.click(btn)

    await waitFor(() => expect(mocks.createConversation).toHaveBeenCalled())
    await waitFor(() => expect(mocks.push).toHaveBeenCalled())
    const arg = mocks.push.mock.calls[0][0]
    expect(String(arg)).toContain("/dashboard?conversation=test-conv-1")

    await waitFor(() => expect(mocks.toast).toHaveBeenCalled())
    expect(mocks.toast.mock.calls[0][0]).toMatchObject({ title: expect.stringMatching(/New conversation created/i) })
  })

  it("shows error toast when creation fails", async () => {
    const { Sidebar } = await import("@/components/dashboard/sidebar")
    const user = userEvent.setup()
    render(<Sidebar />)

    await waitFor(() => expect(mocks.getConversations).toHaveBeenCalled())
    mocks.createConversation.mockRejectedValueOnce(new Error("fail"))

    const btn = await screen.findByRole("button", { name: /new conversation/i })
    await user.click(btn)

    await waitFor(() => expect(mocks.toast).toHaveBeenCalled())
    const args = mocks.toast.mock.calls.at(-1)![0]
    expect(args).toMatchObject({ title: expect.stringMatching(/creation failed/i), variant: "destructive" })
  })
})
