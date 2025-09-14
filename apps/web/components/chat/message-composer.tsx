"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"

interface MessageComposerProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageComposer({
  onSendMessage,
  disabled = false,
  placeholder = "Ask about market trends, portfolio analysis, or financial insights...",
}: MessageComposerProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  return (
    <div className="border-t bg-background p-4 pb-safe-area-inset-bottom md:pb-4 sticky bottom-0">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="h-11 max-h-[120px] resize-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            rows={1}
            aria-label="Message input"
          />
        </div>
        <Button
          type="submit"
          disabled={disabled || !message.trim()}
          size="icon"
          className="h-11 w-11 flex-shrink-0"
          aria-label={disabled ? "Sending message" : "Send message"}
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
        <span className="sm:hidden">Tap to send</span>
      </div>
    </div>
  )
}
