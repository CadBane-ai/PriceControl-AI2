"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FormField } from "@/components/ui/form-field"
import { useToast } from "@/hooks/use-toast"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { User, Mail, Shield, CreditCard, ArrowLeft, Loader2 } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState<"instruct" | "reasoning">("instruct")
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "PriceControl User",
      email: "user@example.com",
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col md:ml-64">
        <TopBar model={model} onModelChange={setModel} />

        <main className="flex-1 overflow-auto">
          <div className="container max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
                <p className="text-muted-foreground">Manage your account information and preferences</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal information and email address</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField label="Full Name" error={errors.name?.message} required>
                      <Input {...register("name")} disabled={isLoading} />
                    </FormField>

                    <FormField label="Email Address" error={errors.email?.message} required>
                      <Input type="email" {...register("email")} disabled={isLoading} />
                    </FormField>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Status
                  </CardTitle>
                  <CardDescription>Your current account information and status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account Type</span>
                    <Badge variant="secondary">Free Plan</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Member Since</span>
                    <span className="text-sm text-muted-foreground">December 2024</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Verified</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      Verified
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Authentication Methods</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email & Password
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>Manage your subscription and billing information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Free Plan</h4>
                      <p className="text-sm text-muted-foreground">50 messages per day • Basic AI models</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">$0</div>
                      <div className="text-sm text-muted-foreground">per month</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Upgrade to Pro</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get unlimited messages, advanced AI models, priority support, and more.
                    </p>
                    <Link href="/billing">
                      <Button>View Upgrade Options</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
