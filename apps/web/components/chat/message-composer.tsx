"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"

interface MessageComposerProps {
  input: string
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSendMessage: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading?: boolean
  placeholder?: string
  statusMessage?: string
}

export function MessageComposer({
  input,
  onInputChange,
  onSendMessage,
  isLoading = false,
  placeholder = "Ask about market trends, portfolio analysis, or financial insights...",
  statusMessage,
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // The form submission will trigger onSendMessage
      textareaRef.current?.form?.requestSubmit()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [input])

  return (
    <div className="border-t bg-background p-4 pb-safe-area-inset-bottom md:pb-4 sticky bottom-0">
      <form onSubmit={onSendMessage} className="flex gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="h-11 max-h-[120px] resize-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            rows={1}
            aria-label="Message input"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-11 w-11 flex-shrink-0"
          aria-label={isLoading ? "Sending message" : "Send message"}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        {statusMessage ? (
          <span>{statusMessage}</span>
        ) : (
          <>
            <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
            <span className="sm:hidden">Tap to send</span>
          </>
        )}
      </div>
    </div>
  )
}
