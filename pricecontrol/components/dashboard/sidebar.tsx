"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import type { Conversation } from "@/lib/types"
import { Plus, MessageSquare, Menu, Loader2 } from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await apiClient.getConversations()
        setConversations(data)
      } catch (error) {
        console.error("Failed to load conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConversations()
  }, [])

  const handleNewConversation = () => {
    // In a real app, this would create a new conversation
    console.log("Creating new conversation...")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return "Today"
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const SidebarContent = () => (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="p-4 border-b">
        <Button onClick={handleNewConversation} className="w-full justify-start" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/dashboard?conversation=${conversation.id}`}
                className={cn(
                  "flex flex-col gap-1 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname.includes(conversation.id) && "bg-accent text-accent-foreground",
                )}
              >
                <div className="font-medium truncate">{conversation.title}</div>
                <div className="text-xs text-muted-foreground">{formatDate(conversation.updatedAt)}</div>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
