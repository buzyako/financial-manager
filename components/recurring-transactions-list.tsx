"use client"

import type { Transaction, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/utils-finance"
import { getRecurringTransactionNextDate } from "@/lib/recurring-utils"
import { Card } from "@/components/ui/card"

interface RecurringTransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  onDelete: (id: string) => void
}

export default function RecurringTransactionsList({
  transactions,
  categories,
  onDelete,
}: RecurringTransactionsListProps) {
  const getPatternLabel = (pattern?: string) => {
    switch (pattern) {
      case "daily":
        return "Daily"
      case "weekly":
        return "Weekly"
      case "monthly":
        return "Monthly"
      case "yearly":
        return "Yearly"
      default:
        return "Unknown"
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No recurring transactions yet</p>
        <p className="text-sm text-muted-foreground">Add a transaction and mark it as recurring to see it here</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {transactions.map((transaction) => {
        const category = categories.find((c) => c.id === transaction.categoryId)
        const nextDate = getRecurringTransactionNextDate(transaction.date, transaction.recurringPattern || "monthly")

        return (
          <Card key={transaction.id} className="p-4 hover:bg-secondary transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">{category?.icon}</span>
                <div>
                  <p className="font-semibold text-foreground">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{category?.name}</p>
                </div>
              </div>
              <button
                onClick={() => onDelete(transaction.id)}
                className="px-3 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
              >
                Delete
              </button>
            </div>

            <div className="space-y-2 p-3 bg-secondary rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Amount</span>
                <span className={`font-semibold ${transaction.type === "income" ? "text-accent" : "text-foreground"}`}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Frequency</span>
                <span className="text-sm font-medium text-foreground">
                  {getPatternLabel(transaction.recurringPattern)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Last Date</span>
                <span className="text-sm font-medium text-foreground">{transaction.date}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">Next Due</span>
                <span className="text-sm font-medium text-accent">{nextDate}</span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
