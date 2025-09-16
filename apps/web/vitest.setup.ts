import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// Mock ScrollArea to a simple div to avoid Radix internals in JSDOM
vi.mock("@/components/ui/scroll-area", () => {
  const ScrollArea = ({ children }: any) => React.createElement("div", { "data-testid": "scroll-area" }, children)
  return { ScrollArea }
})
