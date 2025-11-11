import { Card } from "@/components/ui/card"
import type { Budget, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/utils-finance"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"

interface BudgetStatusProps {
  spending: number
  income: number
  currentMonth: string
  budgets: Budget[]
  categories: Category[]
}

export default function BudgetStatus({ spending, income, currentMonth, budgets, categories }: BudgetStatusProps) {
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const budgetRemaining = totalBudget - spending
  const percentUsed = totalBudget > 0 ? (spending / totalBudget) * 100 : 0
  const isOverBudget = spending > totalBudget

  let statusIcon = <CheckCircle className="w-6 h-6 text-accent" />
  let statusColor = "text-accent"

  if (percentUsed > 90) {
    statusIcon = <AlertTriangle className="w-6 h-6 text-yellow-500" />
    statusColor = "text-yellow-500"
  }

  if (isOverBudget) {
    statusIcon = <AlertCircle className="w-6 h-6 text-destructive" />
    statusColor = "text-destructive"
  }

  return (
    <Card className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Budget Status</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-foreground">{formatCurrency(spending)}</h2>
            <span className="text-muted-foreground text-sm">of {formatCurrency(totalBudget)}</span>
          </div>
        </div>
        <div>{statusIcon}</div>
      </div>

      {totalBudget > 0 && (
        <div className="space-y-3">
          <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget ? "bg-destructive" : percentUsed > 90 ? "bg-yellow-500" : "bg-accent"
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
          <p className={`text-sm font-medium ${statusColor}`}>
            {isOverBudget ? "Over Budget" : percentUsed > 90 ? "Warning" : "On Track"}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-lg font-bold text-accent">{formatCurrency(income)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Spending</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(spending)}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
