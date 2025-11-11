import type { Transaction } from "./types"

export const calculateMonthlySpending = (
  transactions: Transaction[],
  month: string, // YYYY-MM
): number => {
  return transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0)
}

export const calculateMonthlyIncome = (transactions: Transaction[], month: string): number => {
  return transactions
    .filter((t) => t.type === "income" && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0)
}

export const getSpendingByCategory = (transactions: Transaction[], month: string): Record<string, number> => {
  const spending: Record<string, number> = {}
  transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(month))
    .forEach((t) => {
      spending[t.categoryId] = (spending[t.categoryId] || 0) + t.amount
    })
  return spending
}

export const calculateBudgetStatus = (
  spent: number,
  budget: number,
): { percentage: number; status: "good" | "warning" | "over" } => {
  const percentage = (spent / budget) * 100
  return {
    percentage: Math.min(percentage, 100),
    status: percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export const getCurrentMonth = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}
