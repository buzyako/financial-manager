"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CreditCard, Target, TrendingUp, BarChart3, Settings, Repeat, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { StorageManager } from "@/lib/storage"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/goals", label: "Goals", icon: TrendingUp },
  { href: "/recurring", label: "Recurring", icon: Repeat },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { isAuthenticated, currentUser, logout } = useAuth()

  const handleNavigate = (href: string, onNavigate?: () => void) => {
    if (!isAuthenticated && href !== "/auth/login" && href !== "/auth/signup") {
      StorageManager.setAuthRedirectIntent(href)
    }
    onNavigate?.()
  }

  const renderNavLinks = (onNavigate?: () => void) => (
    <div className="space-y-1 flex-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={isAuthenticated ? item.href : "/auth/login"}
            onClick={() => handleNavigate(item.href, onNavigate)}
            className={cn(
              "nav-item",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 active:bg-sidebar-accent",
            )}
            aria-disabled={!isAuthenticated}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </div>
  )

  const renderBrand = () => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">₱</span>
      </div>
      <div>
        <h1 className="text-xl font-bold text-sidebar-foreground">Finance</h1>
        <p className="text-xs text-sidebar-foreground/60">Manager</p>
      </div>
    </div>
  )

  return (
    <>
      <nav className="hidden md:flex flex-col w-72 bg-gradient-to-b from-sidebar to-sidebar border-r border-sidebar-border p-6 gap-1 shadow-lg">
        <div className="mb-8 pb-6 border-b border-sidebar-border">{renderBrand()}</div>
        {renderNavLinks()}
        <div className="mt-6 flex flex-col gap-2">
          {isAuthenticated ? (
            <>
              <div className="text-sm text-sidebar-foreground/80">
                <p className="font-medium">{currentUser?.name || currentUser?.email}</p>
                <p className="text-xs text-sidebar-foreground/60">Signed in</p>
              </div>
              <Button variant="outline" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/auth/login">
                <Button variant="default" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="pt-6 border-t border-sidebar-border text-xs text-sidebar-foreground/60 text-center">
          <p>Finance Manager v1.0</p>
        </div>
      </nav>

      <div className="md:hidden">
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {renderBrand()}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-sidebar text-sidebar-foreground">
              <div className="flex flex-col h-full p-6 gap-6">
                {renderBrand()}
                {renderNavLinks(() => setOpen(false))}
                <div className="mt-auto flex flex-col gap-3">
                  {isAuthenticated ? (
                    <>
                      <div className="text-sm text-sidebar-foreground/80">
                        <p className="font-medium">{currentUser?.name || currentUser?.email}</p>
                        <p className="text-xs text-sidebar-foreground/60">Signed in</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          logout()
                          setOpen(false)
                        }}
                      >
                        Log out
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link href="/auth/login" onClick={() => setOpen(false)}>
                        <Button variant="default" className="w-full">
                          Log in
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Sign up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="pt-6 border-t border-sidebar-border text-xs text-sidebar-foreground/60 text-center">
                  <p>Finance Manager v1.0</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
