"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PriceChart } from "@/components/charts/price-chart"
import { UsageMeter } from "./usage-meter"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, TrendingUp, Clock, Zap } from "lucide-react"

interface AnalyticsData {
  totalMessages: number
  avgResponseTime: number
  topQueries: string[]
  weeklyUsage: Array<{ date: string; messages: number }>
}

export function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    // Mock analytics data
    const mockData: AnalyticsData = {
      totalMessages: 127,
      avgResponseTime: 2.3,
      topQueries: ["Market Analysis", "Portfolio Review", "Risk Assessment"],
      weeklyUsage: [
        { date: "2024-12-08", messages: 12 },
        { date: "2024-12-09", messages: 18 },
        { date: "2024-12-10", messages: 15 },
        { date: "2024-12-11", messages: 22 },
        { date: "2024-12-12", messages: 19 },
        { date: "2024-12-13", messages: 25 },
        { date: "2024-12-14", messages: 16 },
      ],
    }

    setAnalytics(mockData)
  }, [])

  // Mock price data for demonstration
  const mockPriceData = [
    { date: "2024-12-08", price: 4250.32 },
    { date: "2024-12-09", price: 4312.18 },
    { date: "2024-12-10", price: 4298.75 },
    { date: "2024-12-11", price: 4356.92 },
    { date: "2024-12-12", price: 4389.44 },
    { date: "2024-12-13", price: 4412.67 },
    { date: "2024-12-14", price: 4445.23 },
  ]

  if (!analytics) {
    return (
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics - responsive grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <span className="hidden sm:inline">Total Messages</span>
              <span className="sm:hidden">Messages</span>
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{analytics.totalMessages}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <span className="hidden sm:inline">Avg Response Time</span>
              <span className="sm:hidden">Response</span>
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{analytics.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              <span className="hidden sm:inline">12% faster than last month</span>
              <span className="sm:hidden">+12%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <span className="hidden sm:inline">Active Conversations</span>
              <span className="sm:hidden">Active</span>
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">2 new this week</span>
              <span className="sm:hidden">2 new</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <span className="hidden sm:inline">Model Usage</span>
              <span className="sm:hidden">Model</span>
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">Instruct model preferred</span>
              <span className="sm:hidden">Instruct</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Usage - stack on mobile */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        <PriceChart data={mockPriceData} title="S&P 500 Index" symbol="SPX" />
        <UsageMeter showDetails={true} />
      </div>

      {/* Top Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Popular Query Types</CardTitle>
          <CardDescription>Your most common conversation topics this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.topQueries.map((query, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {query}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
