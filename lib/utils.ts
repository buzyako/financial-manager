import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(length = 8): string {
  if (typeof globalThis !== "undefined") {
    const globalCrypto = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto
    if (globalCrypto?.randomUUID) {
      return globalCrypto.randomUUID().replace(/-/g, "").slice(0, length)
    }
    if (globalCrypto?.getRandomValues) {
      const buffer = new Uint8Array(length)
      globalCrypto.getRandomValues(buffer)
      return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, length)
    }
  }

  return Math.random().toString(36).replace(/[^a-z0-9]+/g, "").slice(0, length) || Date.now().toString(36).slice(-length)
}
