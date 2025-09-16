import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageComposer } from "../components/chat/message-composer";
import { ChatThread } from "../components/chat/chat-thread";

describe("Chat UI scaffold (Story 2.1)", () => {
  it("renders a scrollable message area placeholder when no messages", () => {
    render(<ChatThread messages={[]} isLoading={false} />);
    expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument();
  });

  it("renders input and disabled Send button in composer", () => {
    render(<MessageComposer onSendMessage={() => {}} disabled={true} />);
    expect(screen.getByLabelText(/Message input/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });
});
