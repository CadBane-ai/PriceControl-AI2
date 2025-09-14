"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { apiClient } from "@/lib/api"
import type { Usage } from "@/lib/types"
import { Zap, Info, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface UsageMeterProps {
  className?: string
  showDetails?: boolean
}

export function UsageMeter({ className, showDetails = false }: UsageMeterProps) {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const data = await apiClient.getUsage()
        setUsage(data)
      } catch (error) {
        console.error("Failed to load usage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUsage()
    // Refresh usage every 5 minutes
    const interval = setInterval(loadUsage, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || !usage) {
    return (
      <div className={className}>
        <div className="animate-pulse bg-muted h-6 w-20 rounded"></div>
      </div>
    )
  }

  const percentage = (usage.usedToday / usage.dailyLimit) * 100
  const remaining = usage.dailyLimit - usage.usedToday

  const getUsageColor = () => {
    if (percentage >= 90) return "destructive"
    if (percentage >= 70) return "secondary"
    return "default"
  }

  const getProgressColor = () => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-primary"
  }

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getUsageColor()} className={cn("text-xs cursor-help", className)}>
              <Zap className="mr-1 h-3 w-3" />
              {usage.usedToday}/{usage.dailyLimit}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">Daily Usage</div>
              <div className="text-muted-foreground">
                {remaining} messages remaining on {usage.plan} plan
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Usage Today
          </CardTitle>
          <Badge variant={getUsageColor()}>{usage.plan.toUpperCase()}</Badge>
        </div>
        <CardDescription>{remaining > 0 ? `${remaining} messages remaining` : "Daily limit reached"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Messages Used</span>
            <span className="font-medium">
              {usage.usedToday} / {usage.dailyLimit}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {usage.plan === "free" && percentage >= 80 && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4 text-primary" />
              Upgrade Recommended
            </div>
            <p className="text-xs text-muted-foreground">
              You're approaching your daily limit. Upgrade to Pro for unlimited messages and advanced features.
            </p>
            <Link href="/billing">
              <Button size="sm" className="w-full">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        )}

        {percentage >= 100 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <Info className="h-4 w-4" />
              Daily Limit Reached
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your daily message limit has been reached. {usage.plan === "free" ? "Upgrade to Pro" : "Limit resets"} at
              midnight.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
