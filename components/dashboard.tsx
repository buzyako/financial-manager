"use client"

import { useEffect, useState } from "react"
import type { FinanceData } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import {
  calculateMonthlySpending,
  calculateMonthlyIncome,
  getSpendingByCategory,
  formatCurrency,
  getCurrentMonth,
} from "@/lib/utils-finance"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import Navigation from "./navigation"
import BalanceCard from "./balance-card"
import BudgetStatus from "./budget-status"
import RecentTransactions from "./recent-transactions"
import QuickActions from "./quick-actions"

export default function Dashboard() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [currentMonth] = useState(getCurrentMonth())

  useEffect(() => {
    const financeData = StorageManager.getData()
    setData(financeData)
  }, [])

  if (!data) return null

  const monthlySpending = calculateMonthlySpending(data.transactions, currentMonth)
  const monthlyIncome = calculateMonthlyIncome(data.transactions, currentMonth)
  const spendingByCategory = getSpendingByCategory(data.transactions, currentMonth)

  const chartData = Object.entries(spendingByCategory)
    .map(([categoryId, amount]) => {
      const category = data.categories.find((c) => c.id === categoryId)
      return {
        name: category?.name || "Unknown",
        value: amount,
        color: category?.color || "#999",
      }
    })
    .filter((item) => item.value > 0)

  const currentBudgetMonth = data.budgets.filter((b) => b.month === currentMonth)

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navigation />

      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-8 md:mb-10">
            <h1 className="text-5xl font-bold text-foreground mb-2">Finance Manager</h1>
            <p className="text-muted-foreground text-lg">Welcome back! Here's your financial overview</p>
            <p className="text-sm text-muted-foreground mt-2">{currentMonth}</p>
          </div>

          {/* Top Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <BalanceCard balance={data.accountBalance} />
            <BudgetStatus
              spending={monthlySpending}
              income={monthlyIncome}
              currentMonth={currentMonth}
              budgets={currentBudgetMonth}
              categories={data.categories}
            />
          </div>

          {/* Charts and Recent Transactions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Spending by Category Chart */}
            <Card className="card-premium lg:col-span-1 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No spending data yet
                </div>
              )}
            </Card>

            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <RecentTransactions transactions={data.transactions.slice(-10).reverse()} categories={data.categories} />
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </main>
    </div>
  )
}
