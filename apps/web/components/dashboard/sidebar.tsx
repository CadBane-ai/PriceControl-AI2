"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { apiClient } from "@/lib/api"
import type { Conversation } from "@/lib/types"
import { Plus, MessageSquare, Menu, Loader2, Pencil } from "lucide-react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const params = useSearchParams()

  const [renameOpen, setRenameOpen] = useState(false)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState("")
  const [renameSaving, setRenameSaving] = useState(false)
  const { toast } = useToast()

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

  const handleNewConversation = async () => {
    try {
      const conv = await apiClient.createConversation()
      setConversations((prev) => [conv, ...prev])
      router.push(`/dashboard?conversation=${conv.id}`)
      toast({ title: "New conversation created", description: `Opened "${conv.title}"` })
    } catch (e) {
      console.error("Failed to create conversation", e)
      toast({ title: "Creation failed", description: "Could not create conversation.", variant: "destructive" })
    }
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
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                  (params.get("conversation") === conversation.id) && "bg-accent text-accent-foreground",
                )}
              >
                <Link href={`/dashboard?conversation=${conversation.id}`} className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="font-medium truncate">{conversation.title}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(conversation.updatedAt)}</div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Rename conversation ${conversation.title}`}
                  title="Rename"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault()
                    setRenameId(conversation.id)
                    setRenameTitle(conversation.title)
                    setRenameOpen(true)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
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

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={(o) => { setRenameOpen(o); if (!o) { setRenameSaving(false) } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              aria-label="Conversation title"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Enter conversation title"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (!renameId) return
                const title = renameTitle.trim()
                if (!title) return
                setRenameSaving(true)
                try {
                  const updated = await apiClient.renameConversation(renameId, title)
                  setConversations((prev) => prev.map((c) => (c.id === renameId ? { ...c, title: updated.title, updatedAt: updated.updatedAt } : c)))
                  setRenameOpen(false)
                  toast({ title: "Conversation renamed", description: `Renamed to "${updated.title}"` })
                } catch (err) {
                  console.error("Failed to rename conversation", err)
                  toast({ title: "Rename failed", description: "Could not rename conversation.", variant: "destructive" })
                } finally {
                  setRenameSaving(false)
                }
              }}
              disabled={renameSaving || !renameTitle.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
