import React from "react"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import SignupPage from "@/app/(auth)/signup/page"
import LoginPage from "@/app/(auth)/login/page"
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page"
import ResetPasswordPage from "@/app/(auth)/reset-password/page"

const navigationPushMock = vi.fn()
let navigationSearchParams = new URLSearchParams()

const toastMock = vi.fn()
const dismissMock = vi.fn()

const signInMock = vi.fn()

const fetchMock = vi.fn()

const forgotPasswordMock = vi.fn()
const resetPasswordMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigationPushMock,
  }),
  useSearchParams: () => navigationSearchParams,
}))

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock, dismiss: dismissMock }),
}))

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock("next-auth/react", () => ({
  signIn: (...args: any[]) => signInMock(...args),
}))

vi.mock("@/lib/api", () => ({
  apiClient: {
    forgotPassword: (...args: any[]) => forgotPasswordMock(...args),
    resetPassword: (...args: any[]) => resetPasswordMock(...args),
  },
}))

const originalFetch = global.fetch

beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof fetch
})

afterAll(() => {
  global.fetch = originalFetch
})

beforeEach(() => {
  navigationPushMock.mockReset()
  navigationSearchParams = new URLSearchParams()
  toastMock.mockReset()
  dismissMock.mockReset()
  signInMock.mockReset()
  fetchMock.mockReset()
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const target = typeof input === "string" ? input : input instanceof URL ? input.toString() : ""
    if (target === "/api/auth/providers") {
      return {
        ok: true,
        status: 200,
        json: async () => ({ google: {} }),
      } as any
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({}),
    } as any
  })
  forgotPasswordMock.mockReset()
  resetPasswordMock.mockReset()
})

describe("SignupPage", () => {
  it("submits form successfully and navigates to login", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({}),
    })

    const user = userEvent.setup()
    render(<SignupPage />)

    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/password/i), "StrongPassword123!")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        method: "POST",
      }),
    )

    await waitFor(() => expect(navigationPushMock).toHaveBeenCalledWith("/login"))
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Account created" }),
    )
  })

  it("renders validation errors when submission fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: "User already exists" }),
    })

    const user = userEvent.setup()
    render(<SignupPage />)

    await user.type(screen.getByLabelText(/email/i), "existing@example.com")
    await user.type(screen.getByLabelText(/password/i), "AnotherStrongPass123!")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(navigationPushMock).not.toHaveBeenCalled()
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "User already exists",
        variant: "destructive",
      }),
    )
  })
})

describe("LoginPage", () => {
  it("signs in with credentials and redirects to requested page", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ google: {} }),
    })
    navigationSearchParams = new URLSearchParams([["next", "/dashboard"], ["error", ""]])
    signInMock.mockResolvedValue({ ok: true, url: "/dashboard" })

    const user = userEvent.setup()
    render(<LoginPage />)

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument(),
    )

    await user.type(screen.getByLabelText(/email/i), "demo@example.com")
    await user.type(screen.getByLabelText(/password/i), "SuperSecret123!")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({
          email: "demo@example.com",
          password: "SuperSecret123!",
          redirect: false,
          callbackUrl: "/dashboard",
        }),
      ),
    )

    await waitFor(() => expect(navigationPushMock).toHaveBeenCalledWith("/dashboard"))
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Welcome back!" }),
    )
  })

  it("shows error toast when credentials are invalid", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ google: {} }),
    })
    navigationSearchParams = new URLSearchParams()
    signInMock.mockResolvedValue({ ok: false, error: "Invalid email or password." })

    const user = userEvent.setup()
    render(<LoginPage />)

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument(),
    )

    await user.type(screen.getByLabelText(/email/i), "missing@example.com")
    await user.type(screen.getByLabelText(/password/i), "WrongPass123!")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => expect(signInMock).toHaveBeenCalled())
    expect(navigationPushMock).not.toHaveBeenCalled()
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Invalid credentials",
        variant: "destructive",
      }),
    )
  })

  it("hides Google sign-in when provider is unavailable", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    })

    render(<LoginPage />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/providers",
        expect.objectContaining({ cache: "no-store" }),
      )
      expect(screen.queryByRole("button", { name: /continue with google/i })).toBeNull()
      expect(
        screen.getByText("Google sign-in is not available. Check GOOGLE_CLIENT_ID/SECRET and restart the server."),
      ).toBeInTheDocument()
    })
  })
})

describe("ForgotPasswordPage", () => {
  it("submits email and shows success state", async () => {
    forgotPasswordMock.mockResolvedValueOnce(undefined)

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/email/i), "recover@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => expect(forgotPasswordMock).toHaveBeenCalledWith("recover@example.com"))
    expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    expect(screen.getByText(/recover@example.com/i)).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument(),
    )
  })

  it("shows error toast when request fails", async () => {
    forgotPasswordMock.mockRejectedValueOnce(new Error("network"))

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/email/i), "fail@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => expect(forgotPasswordMock).toHaveBeenCalled())
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      }),
    )
  })

  it("shows fallback message when Google sign-in is unavailable", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    })
    forgotPasswordMock.mockResolvedValueOnce(undefined)

    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.type(screen.getByLabelText(/email/i), "nogoogle@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => expect(forgotPasswordMock).toHaveBeenCalled())
    await waitFor(() =>
      expect(
        screen.getByText("Google sign-in is not available. Check GOOGLE_CLIENT_ID/SECRET and restart the server."),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByRole("button", { name: /continue with google/i })).toBeNull()
  })
})

describe("ResetPasswordPage", () => {
  it("redirects to forgot-password when token missing", async () => {
    navigationSearchParams = new URLSearchParams()

    render(<ResetPasswordPage />)

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Invalid reset link" }),
      ),
    )
    await waitFor(() => expect(navigationPushMock).toHaveBeenCalledWith("/forgot-password"))
    expect(resetPasswordMock).not.toHaveBeenCalled()
  })

  it("redirects when token is expired", async () => {
    navigationSearchParams = new URLSearchParams([["token", "expired-token"]])
    resetPasswordMock.mockRejectedValueOnce(Object.assign(new Error("expired"), { code: "RESET_TOKEN_EXPIRED" }))

    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText(/new password/i), "NewPassword123!")
    await user.type(screen.getByLabelText(/confirm password/i), "NewPassword123!")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Reset link expired",
          description: "Please request a new password reset link.",
          variant: "destructive",
        }),
      ),
    )
    expect(navigationPushMock).toHaveBeenCalledWith("/forgot-password")
  })

  it("resets password successfully and navigates to login", async () => {
    navigationSearchParams = new URLSearchParams([["token", "good-token"]])
    resetPasswordMock.mockResolvedValueOnce(undefined)

    const user = userEvent.setup()
    render(<ResetPasswordPage />)

    await user.type(screen.getByLabelText(/new password/i), "ValidPassword123!")
    await user.type(screen.getByLabelText(/confirm password/i), "ValidPassword123!")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() => expect(resetPasswordMock).toHaveBeenCalledWith("good-token", "ValidPassword123!"))
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Password updated" }),
    )
    expect(navigationPushMock).toHaveBeenCalledWith("/login")
  })

  it("shows fallback message when Google sign-in is unavailable", async () => {
    navigationSearchParams = new URLSearchParams([["token", "good-token"]])
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    })

    render(<ResetPasswordPage />)

    await waitFor(() =>
      expect(
        screen.getByText("Google sign-in is not available. Check GOOGLE_CLIENT_ID/SECRET and restart the server."),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByRole("button", { name: /continue with google/i })).toBeNull()
  })
})
