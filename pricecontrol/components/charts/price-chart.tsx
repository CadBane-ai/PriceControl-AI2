"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface PriceDataPoint {
  date: string
  price: number
  volume?: number
}

interface PriceChartProps {
  data: PriceDataPoint[]
  title: string
  symbol?: string
  className?: string
}

export function PriceChart({ data, title, symbol, className }: PriceChartProps) {
  const { trend, changePercent } = useMemo(() => {
    if (data.length < 2) return { trend: "neutral", changePercent: 0 }

    const firstPrice = data[0].price
    const lastPrice = data[data.length - 1].price
    const change = ((lastPrice - firstPrice) / firstPrice) * 100

    return {
      trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
      changePercent: Math.abs(change),
    }
  }, [data])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const currentPrice = data[data.length - 1]?.price || 0

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {symbol && <CardDescription className="text-sm text-muted-foreground">{symbol}</CardDescription>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatPrice(currentPrice)}</div>
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : trend === "down" ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : null}
              <Badge
                variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
                className={
                  trend === "up"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    : trend === "down"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      : ""
                }
              >
                {trend === "up" ? "+" : trend === "down" ? "-" : ""}
                {changePercent.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                className="text-xs fill-muted-foreground"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-md">
                        <div className="text-sm font-medium">{formatDate(label)}</div>
                        <div className="text-sm text-primary">{formatPrice(payload[0].value as number)}</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, className: "fill-primary" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
