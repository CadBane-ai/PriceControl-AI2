import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to dashboard for now - in a real app, this might be a landing page
  redirect("/dashboard")
}
