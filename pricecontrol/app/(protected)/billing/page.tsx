"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { apiClient } from "@/lib/api"
import { ArrowLeft, Check, Zap, Crown, Loader2, ExternalLink } from "lucide-react"

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState<"instruct" | "reasoning">("instruct")
  const { toast } = useToast()

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const { url } = await apiClient.createCheckoutSession()
      // In a real app, redirect to Stripe checkout
      toast({
        title: "Redirecting to checkout",
        description: "You will be redirected to complete your purchase.",
      })
      // window.location.href = url
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = {
    free: ["50 messages per day", "Basic AI models", "Standard response time", "Email support", "Basic market data"],
    pro: [
      "Unlimited messages",
      "Advanced AI models (GPT-4, Claude)",
      "Priority response time",
      "Priority support",
      "Real-time market data",
      "Advanced analytics",
      "Custom model fine-tuning",
      "API access",
    ],
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col md:ml-64">
        <TopBar model={model} onModelChange={setModel} />

        <main className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/account">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
                <p className="text-muted-foreground">Choose the plan that works best for you</p>
              </div>
            </div>

            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>You are currently on the Free plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">Free Plan</h4>
                      <p className="text-sm text-muted-foreground">Perfect for getting started</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Current Plan</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Plans */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Free Plan */}
              <Card className="relative">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <CardTitle>Free</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>Perfect for individuals getting started with AI finance assistance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {features.free.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    Current Plan
                  </Button>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="relative border-primary">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />
                    <CardTitle>Pro</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>
                    For professionals who need advanced AI capabilities and unlimited access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {features.pro.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={handleUpgrade} disabled={isLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upgrade to Pro
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Can I cancel my subscription at any time?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can cancel your subscription at any time. You'll continue to have access to Pro features
                    until the end of your current billing period.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure
                    payment processor, Stripe.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Is there a free trial for the Pro plan?</h4>
                  <p className="text-sm text-muted-foreground">
                    We offer a 7-day free trial for new Pro subscribers. You can cancel anytime during the trial period
                    without being charged.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">How does billing work?</h4>
                  <p className="text-sm text-muted-foreground">
                    Billing is monthly and automatic. You'll be charged on the same date each month. You can view and
                    manage your billing history in your account settings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Our support team is here to help with any questions about billing or subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button variant="outline" asChild>
                    <a href="mailto:support@pricecontrol.ai" className="inline-flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Contact Support
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/help" className="inline-flex items-center gap-2">
                      Help Center
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
