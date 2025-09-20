import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageComposer } from "@/components/chat/message-composer";
import { ChatThread } from "@/components/chat/chat-thread";
import type { Message } from "@/lib/types";
import React from "react";

describe("Chat UI scaffold (Story 2.1)", () => {
  it("renders a scrollable message area placeholder when no messages", () => {
    render(<ChatThread messages={[]} isLoading={false} />);
    expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument();
  });

  it("renders input and disabled Send button in composer", () => {
    render(<MessageComposer input="" onInputChange={() => {}} onSendMessage={() => {}} isLoading={true} />);
    expect(screen.getByLabelText(/Message input/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sending message/i })).toBeDisabled();
  });

  it("renders existing messages when provided", () => {
    const sampleMessages: Message[] = [
      { id: "assistant-1", role: "assistant", content: "Hello from PriceControl AI", createdAt: "2025-09-18T00:00:00.000Z" },
    ];

    render(<ChatThread messages={sampleMessages} isLoading={false} />);
    expect(screen.getByText(/Hello from PriceControl AI/i)).toBeInTheDocument();
  });

  it("shows status message when composer is in preview mode", () => {
    render(<MessageComposer input="" onInputChange={() => {}} onSendMessage={() => {}} statusMessage="Preview mode" />);
    expect(screen.getByText(/Preview mode/i)).toBeInTheDocument();
  });

  it("submits trimmed input through onSendMessage", async () => {
    const user = userEvent.setup();
    const handleSend = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());

    function TestHarness() {
      const [input, setInput] = React.useState("");
      return (
        <MessageComposer
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onSendMessage={handleSend}
        />
      );
    }

    render(<TestHarness />);

    const textarea = screen.getByLabelText(/Message input/i);
    await user.type(textarea, "  Hello team {enter}");

    expect(handleSend).toHaveBeenCalledTimes(1);
  });
});
