import "@testing-library/jest-dom/vitest"
import { vi } from "vitest"
import React from "react"

;(globalThis as typeof globalThis & { React?: typeof React }).React = React

// Mock Next.js navigation hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock ScrollArea to a simple div to avoid Radix internals in JSDOM
vi.mock("@/components/ui/scroll-area", () => {
  const ScrollArea = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    ({ children, ...props }, ref) =>
      React.createElement(
        "div",
        { ref, "data-testid": "scroll-area", ...props },
        children,
      ),
  )
  ScrollArea.displayName = "ScrollArea"
  return { ScrollArea }
})
