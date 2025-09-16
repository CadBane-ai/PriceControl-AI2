"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sidebar } from "./sidebar"
import { useTheme } from "next-themes"
import { apiClient } from "@/lib/api"
import type { Usage } from "@/lib/types"
import { User, Settings, LogOut, Sun, Moon, Zap } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

interface TopBarProps {
  model: "instruct" | "reasoning"
  onModelChange: (model: "instruct" | "reasoning") => void
}

export function TopBar({ model, onModelChange }: TopBarProps) {
  const [usage, setUsage] = useState<Usage | null>(null)
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const data = await apiClient.getUsage()
        setUsage(data)
      } catch (error) {
        console.error("Failed to load usage:", error)
      }
    }

    loadUsage()
  }, [])

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  const getUsageColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 90) return "destructive"
    if (percentage >= 70) return "secondary"
    return "default"
  }

  return (
    <header className="relative z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Sidebar />
          </div>

          {/* Model Selector - responsive sizing */}
          <Tabs value={model} onValueChange={(value) => onModelChange(value as "instruct" | "reasoning")}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="instruct" className="text-xs px-2 py-1">
                Instruct
              </TabsTrigger>
              <TabsTrigger value="reasoning" className="text-xs px-2 py-1">
                Reasoning
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Usage Meter - hide on very small screens */}
          {usage && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant={getUsageColor(usage.usedToday, usage.dailyLimit)} className="text-xs">
                <Zap className="mr-1 h-3 w-3" />
                <span className="hidden md:inline">{usage.usedToday}/</span>
                <span className="md:hidden">{usage.usedToday}</span>
                <span className="hidden md:inline">{usage.dailyLimit}</span>
              </Badge>
              {usage.plan === "free" && usage.usedToday >= usage.dailyLimit * 0.8 && (
                <Link href="/billing">
                  <Button size="sm" variant="outline" className="text-xs bg-transparent hidden md:inline-flex">
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Quick Account Access (temporary fallback) */}
          <Link href="/account" title="Account" aria-label="Account">
            <Button
              asChild={false}
              variant="outline"
              size="sm"
              className="h-8"
            >
              <>
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </>
            </Button>
          </Link>

          {/* Secondary Logout Button (temporary fallback) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="h-8"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </Button>

          {/* Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                title="Open user menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">PC</AvatarFallback>
                </Avatar>
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.email ?? "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session?.user?.email ?? ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {usage && (
                <>
                  <div className="sm:hidden px-2 py-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Usage Today</span>
                      <Badge variant={getUsageColor(usage.usedToday, usage.dailyLimit)} className="text-xs">
                        {usage.usedToday}/{usage.dailyLimit}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="sm:hidden" />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/account" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/billing" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                Toggle theme
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
