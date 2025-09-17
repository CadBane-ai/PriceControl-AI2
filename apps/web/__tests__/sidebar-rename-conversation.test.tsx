import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// Router mocks
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams([["conversation", "c1"]]),
}))

const sessionMock = { user: { id: "user-1", email: "user@example.com" } }
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: sessionMock, status: "authenticated" }),
  signOut: vi.fn(),
}))

const renameMock = vi.fn()

vi.mock("@/lib/api", () => ({
  apiClient: {
    getConversations: vi.fn().mockResolvedValue([
      { id: "c1", title: "Old Title", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ]),
    createConversation: vi.fn(),
    renameConversation: (...args: any[]) => renameMock(...args),
  },
}))

let toastSpy: ReturnType<typeof vi.fn>
vi.mock("@/components/ui/use-toast", () => {
  toastSpy = vi.fn()
  return { useToast: () => ({ toast: toastSpy, toasts: [], dismiss: vi.fn() }) }
})

describe("Sidebar rename conversation", () => {
  beforeEach(() => {
    renameMock.mockReset()
  })

  it("renames a conversation via dialog, updates UI, and shows success toast", async () => {
    const { Sidebar } = await import("@/components/dashboard/sidebar")
    const user = userEvent.setup()
    render(<Sidebar />)

    // Ensure existing title present
    await screen.findByText(/Old Title/)

    renameMock.mockResolvedValue({ id: "c1", title: "New Title", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })

    // Click the rename button (Pencil)
    const btn = await screen.findByRole("button", { name: /rename conversation old title/i })
    await user.click(btn)

    // Dialog opens; type new title and save
    const titleInput = await screen.findByRole("textbox", { name: /conversation title/i })
    await user.clear(titleInput)
    await user.type(titleInput, "New Title")
    const save = await screen.findByRole("button", { name: /save/i })
    await user.click(save)

    // Title should update in the UI
    expect(await screen.findByText(/New Title/)).toBeInTheDocument()

    await waitFor(() => expect(toastSpy).toHaveBeenCalled())
    expect(toastSpy.mock.calls[0][0]).toMatchObject({ title: expect.stringMatching(/conversation renamed/i) })
  })

  it("shows error toast when rename fails", async () => {
    const { Sidebar } = await import("@/components/dashboard/sidebar")
    const user = userEvent.setup()
    render(<Sidebar />)

    await screen.findByText(/Old Title/)

    // Open dialog
    const btn = await screen.findByRole("button", { name: /rename conversation old title/i })
    await user.click(btn)

    // Type new title
    const titleInput = await screen.findByRole("textbox", { name: /conversation title/i })
    await user.clear(titleInput)
    await user.type(titleInput, "Err Title")
    const save = await screen.findByRole("button", { name: /save/i })

    // Cause failure
    renameMock.mockRejectedValueOnce(new Error("fail"))
    await user.click(save)

    await waitFor(() => expect(toastSpy).toHaveBeenCalled())
    const args = toastSpy.mock.calls.at(-1)![0]
    expect(args).toMatchObject({ title: expect.stringMatching(/rename failed/i), variant: "destructive" })
  })
})
