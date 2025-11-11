"use client"

import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import type { FinanceData } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import SpendingTrendChart from "@/components/spending-trend-chart"
import CategoryBreakdownChart from "@/components/category-breakdown-chart"
import MonthlyComparisonChart from "@/components/monthly-comparison-chart"
import AnalyticsStats from "@/components/analytics-stats"
import { formatCurrency } from "@/lib/utils-finance"

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

  return (
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
