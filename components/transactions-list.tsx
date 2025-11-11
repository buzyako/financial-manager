"use client"

import type { Transaction, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/utils-finance"

interface TransactionsListProps {
  transactions: Transaction[]
  categories: Category[]
  onDelete: (id: string) => void
}

export default function TransactionsList({ transactions, categories, onDelete }: TransactionsListProps) {
  return (
    <div className="space-y-2">
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No transactions yet</p>
          <p className="text-sm text-muted-foreground">Add your first transaction to get started</p>
        </div>
      ) : (
        transactions.map((transaction) => {
          const category = categories.find((c) => c.id === transaction.categoryId)
          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary transition-colors border border-border"
            >
              <div className="flex items-center gap-4 flex-1">
                <span className="text-3xl">{category?.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{transaction.description}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{category?.name}</span>
                    <span>{transaction.date}</span>
                    {transaction.isRecurring && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                        {transaction.recurringPattern}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${transaction.type === "income" ? "text-accent" : "text-foreground"}`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="px-3 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
