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
  name: "",
  loading: false,
  error: undefined,
}

export default function SignupPage() {
  const { signup, isAuthenticated, loading: authLoading } = useAuth()
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
    if (formState.password.length < 6) {
      setFormState((prev) => ({
        ...prev,
        error: "Password must be at least 6 characters long.",
      }))
      return
    }

    setFormState((prev) => ({ ...prev, loading: true, error: undefined }))
    const result = await signup(formState.email, formState.password, formState.name)
    if (!result.success) {
      setFormState((prev) => ({ ...prev, loading: false, error: result.message }))
      return
    }
    setHasRedirected(false)
    setFormState(initialState)
  }

  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">Sign up to unlock your personalized financial dashboard.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            autoComplete="name"
            value={formState.name ?? ""}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
          />
        </div>

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
            autoComplete="new-password"
            required
            value={formState.password}
            onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Must be at least 6 characters.</p>
        </div>

        {formState.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{formState.error}</p>
        )}

        <Button type="submit" className="w-full" disabled={formState.loading}>
          {formState.loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline font-medium">
          Log in
        </Link>
      </p>
    </Card>
  )
}

