"use client"

import { useEffect, useMemo, useState } from "react"
import Navigation from "@/components/navigation"
import type { FinanceData } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import SpendingTrendChart from "@/components/spending-trend-chart"
import CategoryBreakdownChart from "@/components/category-breakdown-chart"
import MonthlyComparisonChart from "@/components/monthly-comparison-chart"
import AnalyticsStats from "@/components/analytics-stats"
import { formatCurrency } from "@/lib/utils-finance"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"

export default function AnalyticsPage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [selectedMonth, setSelectedMonth] = useState("")

  useEffect(() => {
    const financeData = StorageManager.getData()
    setData(financeData)
    const now = new Date()
    setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`)
  }, [])

  if (!data || !selectedMonth) return null

  const monthTransactions = useMemo(
    () => data.transactions.filter((transaction) => transaction.date.startsWith(selectedMonth)),
    [data.transactions, selectedMonth],
  )
  const monthExpenses = monthTransactions.filter((transaction) => transaction.type === "expense")
  const monthIncome = monthTransactions.filter((transaction) => transaction.type === "income")
  const totalExpenses = monthExpenses.reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalIncome = monthIncome.reduce((sum, transaction) => sum + transaction.amount, 0)
  const netBalance = totalIncome - totalExpenses
  const averageExpense = monthExpenses.length > 0 ? totalExpenses / monthExpenses.length : 0
  const averageIncome = monthIncome.length > 0 ? totalIncome / monthIncome.length : 0
  const transactionCount = monthTransactions.length

  const categoryTotals = monthExpenses.reduce<Record<string, number>>((acc, transaction) => {
    acc[transaction.categoryId] = (acc[transaction.categoryId] || 0) + transaction.amount
    return acc
  }, {})

  const topCategoryEntry = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      category: data.categories.find((category) => category.id === categoryId),
    }))[0]

  const topCategoryLabel = topCategoryEntry
    ? `${topCategoryEntry.category?.name ?? "Deleted Category"} (${formatCurrency(topCategoryEntry.amount)})`
    : "—"

  const loanMetrics = useMemo(() => {
    const loans = data.loans ?? []
    const activeLoans = loans.filter((loan) => loan.status === "active")
    const outstandingBalance = activeLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0)
    const totalBorrowed = loans.reduce((sum, loan) => sum + loan.principal, 0)
    const upcomingDates = activeLoans
      .filter((loan) => loan.nextPaymentDate)
      .map((loan) => new Date(loan.nextPaymentDate as string).getTime())
    const nextPayment =
      upcomingDates.length > 0 ? new Date(Math.min(...upcomingDates)).toLocaleDateString() : "Not scheduled"
    return {
      active: activeLoans.length,
      outstandingBalance,
      totalBorrowed,
      nextPayment,
    }
  }, [data.loans])

  const handleExport = () => {
    if (monthTransactions.length === 0) return
    const toCsvValue = (value: string) => `"${value.replace(/"/g, '""')}"`
    const header = ["Date", "Type", "Category", "Description", "Amount", "Recurring"]
    const rows = monthTransactions.map((transaction) => {
      const category = data.categories.find((category) => category.id === transaction.categoryId)
      return [
        transaction.date,
        transaction.type,
        category?.name ?? "Uncategorized",
        transaction.description,
        transaction.amount.toFixed(2),
        transaction.isRecurring ? transaction.recurringPattern ?? "recurring" : "one-time",
      ]
    })

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => toCsvValue(String(cell))).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `finance-report-${selectedMonth}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col md:flex-row bg-background">
        <Navigation />

        <main className="flex-1 overflow-auto w-full">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
              <p className="text-muted-foreground">Visualize your spending trends and financial patterns</p>
            </div>

            {/* Stats Overview */}
            <div className="my-8">
              <AnalyticsStats
                transactions={data.transactions}
                categories={data.categories}
                selectedMonth={selectedMonth}
              />
            </div>

            {/* Month Selector */}
            <Card className="p-4 mb-8">
              <label htmlFor="month" className="block text-sm font-medium text-foreground mb-2">
                Select Month
              </label>
              <input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Card>

            <Card className="p-6 mb-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Monthly Summary</h2>
                  <p className="text-sm text-muted-foreground">
                    Key performance indicators for {selectedMonth || "this month"}.
                  </p>
                </div>
                <Button variant="outline" onClick={handleExport} disabled={monthTransactions.length === 0}>
                  Export CSV
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Transactions recorded</td>
                      <td className="py-2 font-medium text-foreground">{transactionCount}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Total income</td>
                      <td className="py-2 font-medium text-accent">{formatCurrency(totalIncome)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Total expenses</td>
                      <td className="py-2 font-medium text-destructive">{formatCurrency(totalExpenses)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Net position</td>
                      <td
                        className={`py-2 font-medium ${
                          netBalance >= 0 ? "text-accent" : "text-destructive"
                        }`}
                      >
                        {formatCurrency(netBalance)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Average income per entry</td>
                      <td className="py-2 font-medium text-foreground">{formatCurrency(averageIncome)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Average expense per entry</td>
                      <td className="py-2 font-medium text-foreground">{formatCurrency(averageExpense)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Top spending category</td>
                      <td className="py-2 font-medium text-foreground">{topCategoryLabel}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Active loans</td>
                      <td className="py-2 font-medium text-foreground">{loanMetrics.active}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Outstanding loan balance</td>
                      <td className="py-2 font-medium text-foreground">
                        {formatCurrency(loanMetrics.outstandingBalance)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Total borrowed</td>
                      <td className="py-2 font-medium text-foreground">{formatCurrency(loanMetrics.totalBorrowed)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-muted-foreground">Next loan payment</td>
                      <td className="py-2 font-medium text-foreground">{loanMetrics.nextPayment}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {monthTransactions.length === 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Add income and expenses for {selectedMonth} to unlock detailed reporting.
                </p>
              )}
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Spending Trend (Last 12 Months)</h2>
                <SpendingTrendChart transactions={data.transactions} />
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Monthly Comparison</h2>
                <MonthlyComparisonChart transactions={data.transactions} />
              </Card>
            </div>

            <Card className="p-6 mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4">Category Breakdown - {selectedMonth}</h2>
              <CategoryBreakdownChart
                transactions={data.transactions}
                categories={data.categories}
                selectedMonth={selectedMonth}
              />
            </Card>

            {/* Top Spending Categories */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Top Spending Categories</h2>
              <TopSpendingCategories
                transactions={data.transactions}
                categories={data.categories}
                selectedMonth={selectedMonth}
              />
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

function TopSpendingCategories({ transactions, categories, selectedMonth }: any) {
  const categorySpending: Record<string, number> = {}

  transactions
    .filter((t: any) => t.type === "expense" && t.date.startsWith(selectedMonth))
    .forEach((t: any) => {
      categorySpending[t.categoryId] = (categorySpending[t.categoryId] || 0) + t.amount
    })

  const sorted = Object.entries(categorySpending)
    .map(([categoryId, amount]) => ({
      categoryId,
      category: categories.find((c: any) => c.id === categoryId),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  if (sorted.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No spending data for this month</p>
  }

  const total = Object.values(categorySpending).reduce((sum: number, amount: number) => sum + amount, 0)

  return (
    <div className="space-y-3">
      {sorted.map(({ category, amount, categoryId }: any) => {
        const displayName = category?.name ?? "Deleted Category"
        const displayIcon = category?.icon ?? "🗑️"
        const totalForMonth = total || 1
        const percent = ((amount / totalForMonth) * 100).toFixed(1)

        return (
          <div key={categoryId} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl" aria-hidden="true">
                {displayIcon}
              </span>
              <div>
                <p className="font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{percent}% of total</p>
              </div>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(amount)}</p>
          </div>
        )
      })}
    </div>
  )
}
