"use client"

import type { Transaction } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SpendingTrendChartProps {
  transactions: Transaction[]
}

export default function SpendingTrendChart({ transactions }: SpendingTrendChartProps) {
  const monthlyData: Record<string, { month: string; expenses: number; income: number }> = {}

  transactions.forEach((transaction) => {
    const monthKey = transaction.date.substring(0, 7)
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthKey, expenses: 0, income: 0 }
    }
    if (transaction.type === "expense") {
      monthlyData[monthKey].expenses += transaction.amount
    } else {
      monthlyData[monthKey].income += transaction.amount
    }
  })

  const chartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12)

  if (chartData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
        <YAxis stroke="var(--color-muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="expenses" stroke="var(--color-destructive)" name="Expenses" strokeWidth={2} />
        <Line type="monotone" dataKey="income" stroke="var(--color-accent)" name="Income" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
