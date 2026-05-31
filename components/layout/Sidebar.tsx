"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, HelpCircle, BarChart2, Trophy, Plus, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth-client"

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/questions", label: "Questions", icon: HelpCircle },
  { href: "/calibration", label: "Calibration", icon: BarChart2 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col w-56 border-r bg-card h-full">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">F</span>
          </div>
          <span className="font-semibold text-sm">Forecaster</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <Link
          href="/questions/new"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-3"
        >
          <Plus className="h-4 w-4" />
          New Question
        </Link>

        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
