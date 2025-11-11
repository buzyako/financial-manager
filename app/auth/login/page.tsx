"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/auth-context"
import { StorageManager } from "@/lib/storage"
import type { AuthFormState } from "@/lib/types"

const initialState: AuthFormState = {
  email: "",
  password: "",
  loading: false,
  error: undefined,
}

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const [formState, setFormState] = useState<AuthFormState>(initialState)
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasRedirected) {
      const redirect = StorageManager.consumeAuthRedirectIntent() ?? "/"
      setHasRedirected(true)
      router.replace(redirect)
    }
  }, [authLoading, isAuthenticated, hasRedirected, router])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormState((prev) => ({ ...prev, loading: true, error: undefined }))
    const result = await login(formState.email, formState.password)
    if (!result.success) {
      setFormState((prev) => ({ ...prev, loading: false, error: result.message }))
      return
    }
    setFormState(initialState)
    setHasRedirected(false)
  }

  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to access your Finance Manager dashboard.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={formState.email}
            onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={formState.password}
            onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
          />
        </div>

        {formState.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{formState.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={formState.loading}>
          {formState.loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline font-medium">
          Create one
        </Link>
      </p>
    </Card>
  )
}

