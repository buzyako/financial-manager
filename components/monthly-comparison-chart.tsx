"use client"

import type { Transaction } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MonthlyComparisonChartProps {
  transactions: Transaction[]
}

export default function MonthlyComparisonChart({ transactions }: MonthlyComparisonChartProps) {
  const monthlyData: Record<string, { month: string; expenses: number; income: number; balance: number }> = {}

  transactions.forEach((transaction) => {
    const monthKey = transaction.date.substring(0, 7)
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, expenses: 0, income: 0, balance: 0 }
    }
    if (transaction.type === "expense") {
      monthlyData[monthKey].expenses += transaction.amount
    } else {
      monthlyData[monthKey].income += transaction.amount
    }
  })

  const chartData = Object.values(monthlyData)
    .map((item) => ({
      ...item,
      balance: item.income - item.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)

  if (chartData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
        <YAxis stroke="var(--color-muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          }}
          formatter={(value) => `$${value.toFixed(2)}`}
        />
        <Legend />
        <Bar dataKey="expenses" fill="var(--color-destructive)" name="Expenses" />
        <Bar dataKey="income" fill="var(--color-accent)" name="Income" />
      </BarChart>
    </ResponsiveContainer>
  )
}
