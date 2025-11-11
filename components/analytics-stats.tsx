"use client"

import type { Transaction, Category } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils-finance"

interface AnalyticsStatsProps {
  transactions: Transaction[]
  categories: Category[]
  selectedMonth: string
}

export default function AnalyticsStats({ transactions, categories, selectedMonth }: AnalyticsStatsProps) {
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth))

  const totalExpenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const allMonthsData: Record<string, { expenses: number; income: number }> = {}
  transactions.forEach((t) => {
    const monthKey = t.date.substring(0, 7)
    if (!allMonthsData[monthKey]) {
      allMonthsData[monthKey] = { expenses: 0, income: 0 }
    }
    if (t.type === "expense") {
      allMonthsData[monthKey].expenses += t.amount
    } else {
      allMonthsData[monthKey].income += t.amount
    }
  })

  const allMonths = Object.entries(allMonthsData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, data]) => data)

  const avgMonthlyExpenses =
    allMonths.length > 0 ? allMonths.reduce((sum, m) => sum + m.expenses, 0) / allMonths.length : 0

  const categoryCount = new Set(monthTransactions.map((t) => t.categoryId)).size

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-to-br from-accent to-accent/70 text-accent-foreground">
        <p className="text-sm font-medium opacity-90 mb-2">Total Income</p>
        <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-destructive to-destructive/70 text-destructive-foreground">
        <p className="text-sm font-medium opacity-90 mb-2">Total Expenses</p>
        <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
      </Card>

      <Card
        className={`p-6 bg-gradient-to-br ${balance >= 0 ? "from-green-500 to-green-500/70" : "from-orange-500 to-orange-500/70"} text-white`}
      >
        <p className="text-sm font-medium opacity-90 mb-2">Monthly Balance</p>
        <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-muted-foreground mb-2">Average Monthly Spend</p>
        <p className="text-3xl font-bold text-foreground">{formatCurrency(avgMonthlyExpenses)}</p>
        <p className="text-xs text-muted-foreground mt-2">Based on {allMonths.length} months</p>
      </Card>
    </div>
  )
}
