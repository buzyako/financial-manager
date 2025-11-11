"use client"

import type { ReactNode } from "react"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { StorageManager } from "@/lib/storage"
import { generateId } from "@/lib/utils"
import type { AuthState, AuthSession } from "@/lib/types"

interface AuthContextValue extends AuthState {
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: true } | { success: false; message: string }>
  signup: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ success: true } | { success: false; message: string }>
  logout: () => void
  refresh: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const SESSION_DURATION_MINUTES = 60 * 24
const PASSWORD_SALT = "finance-manager-salt"

function toBase64(input: string): string {
  if (typeof window === "undefined") return input
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  let binary = ""
  data.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return window.btoa(binary)
}

function hashPassword(password: string): string {
  return toBase64(`${PASSWORD_SALT}:${password}`)
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

function createSession(userId: string): AuthSession {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MINUTES * 60 * 1000)
  return {
    userId,
    token: generateId(24),
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastActivityAt: now.toISOString(),
  }
}

function sessionExpired(session: AuthSession | null): boolean {
  if (!session) return true
  return new Date(session.expiresAt) < new Date()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ currentUser: null, isAuthenticated: false })
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    const session = StorageManager.getSession()
    if (!session || sessionExpired(session)) {
      StorageManager.clearSession()
      setState({ currentUser: null, isAuthenticated: false })
      setLoading(false)
      return
    }

    const user = StorageManager.getUsers().find((u) => u.id === session.userId) ?? null
    if (!user) {
      StorageManager.clearSession()
      setState({ currentUser: null, isAuthenticated: false })
      setLoading(false)
      return
    }

    const renewedSession: AuthSession = {
      ...session,
      lastActivityAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000).toISOString(),
    }
    StorageManager.saveSession(renewedSession)
    setState({ currentUser: user, isAuthenticated: true })
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: true } | { success: false; message: string }> => {
    const user = StorageManager.findUserByEmail(email.trim())
    if (!user) {
      return { success: false, message: "User not found" }
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, message: "Invalid password" }
    }

    const session = createSession(user.id)
    StorageManager.saveSession(session)
    setState({ currentUser: user, isAuthenticated: true })
    setLoading(false)
    return { success: true }
  }

  const signup = async (
    email: string,
    password: string,
    name?: string,
  ): Promise<{ success: true } | { success: false; message: string }> => {
    const normalizedEmail = email.trim().toLowerCase()
    const existing = StorageManager.findUserByEmail(normalizedEmail)
    if (existing) {
      return { success: false, message: "Email already in use" }
    }

    const user = StorageManager.createUser({
      email: normalizedEmail,
      name,
      passwordHash: hashPassword(password),
    })

    const session = createSession(user.id)
    StorageManager.saveSession(session)
    setState({ currentUser: user, isAuthenticated: true })
    setLoading(false)
    return { success: true }
  }

  const logout = () => {
    StorageManager.clearSession()
    setState({ currentUser: null, isAuthenticated: false })
    setLoading(false)
  }

  const value = useMemo(
    () => ({
      ...state,
      loading,
      login,
      signup,
      logout,
      refresh,
    }),
    [state, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
