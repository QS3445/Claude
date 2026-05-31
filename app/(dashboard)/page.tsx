import { redirect } from "next/navigation"

// (dashboard)/page.tsx is the root — redirect to /dashboard
export default function DashboardRoot() {
  redirect("/dashboard")
}
