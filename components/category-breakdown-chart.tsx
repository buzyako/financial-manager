"use client"

import type { Transaction, Category } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface CategoryBreakdownChartProps {
  transactions: Transaction[]
  categories: Category[]
  selectedMonth: string
}

export default function CategoryBreakdownChart({
  transactions,
  categories,
  selectedMonth,
}: CategoryBreakdownChartProps) {
  const categoryData: Record<string, { category: string; amount: number; icon: string }> = {}

  transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(selectedMonth))
    .forEach((transaction) => {
      const category = categories.find((c) => c.id === transaction.categoryId)
      if (category) {
        if (!categoryData[category.id]) {
          categoryData[category.id] = { category: category.name, amount: 0, icon: category.icon }
        }
        categoryData[category.id].amount += transaction.amount
      }
    })

  const chartData = Object.values(categoryData).sort((a, b) => b.amount - a.amount)

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No spending data for this month
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="category" stroke="var(--color-muted-foreground)" angle={-45} textAnchor="end" height={100} />
        <YAxis stroke="var(--color-muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          }}
          formatter={(value) => `$${value.toFixed(2)}`}
        />
        <Bar dataKey="amount" fill="var(--color-accent)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
