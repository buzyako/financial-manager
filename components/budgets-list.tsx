"use client"

import type { Budget, Category, Transaction } from "@/lib/types"
import { formatCurrency, calculateBudgetStatus, getSpendingByCategory } from "@/lib/utils-finance"
import { Card } from "@/components/ui/card"

interface BudgetsListProps {
  budgets: Budget[]
  transactions: Transaction[]
  categories: Category[]
  currentMonth: string
  onDelete: (id: string) => void
}

export default function BudgetsList({ budgets, transactions, categories, currentMonth, onDelete }: BudgetsListProps) {
  const spendingByCategory = getSpendingByCategory(transactions, currentMonth)

  if (budgets.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">No budgets created yet</p>
        <p className="text-sm text-muted-foreground">Create your first budget to start tracking spending limits</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {budgets.map((budget) => {
        const category = categories.find((c) => c.id === budget.categoryId)
        const spent = spendingByCategory[budget.categoryId] || 0
        const { percentage, status } = calculateBudgetStatus(spent, budget.limit)

        const statusColor = {
          good: "text-accent",
          warning: "text-yellow-500",
          over: "text-destructive",
        }[status]

        const progressColor = {
          good: "bg-accent",
          warning: "bg-yellow-500",
          over: "bg-destructive",
        }[status]

        return (
          <Card key={budget.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category?.icon}</span>
                <div>
                  <h3 className="font-semibold text-foreground">{category?.name}</h3>
                  <p className="text-xs text-muted-foreground">Budget</p>
                </div>
              </div>
              <button
                onClick={() => onDelete(budget.id)}
                className="px-3 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
              >
                Delete
              </button>
            </div>

            {/* Amount Info */}
            <div className="mb-4 p-3 bg-secondary rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Spent</span>
                <span className={`font-semibold ${statusColor}`}>{formatCurrency(spent)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Limit</span>
                <span className="font-semibold text-foreground">{formatCurrency(budget.limit)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted-foreground">Progress</span>
                <span className={`text-sm font-semibold ${statusColor}`}>{percentage.toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} rounded-full transition-all`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Status Message */}
            <p className="text-xs text-muted-foreground">
              {status === "good" && `${formatCurrency(budget.limit - spent)} remaining`}
              {status === "warning" && `${formatCurrency(budget.limit - spent)} remaining - approaching limit`}
              {status === "over" && `${formatCurrency(spent - budget.limit)} over budget`}
            </p>
          </Card>
        )
      })}
    </div>
  )
}
