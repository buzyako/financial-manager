import { Card } from "@/components/ui/card"
import type { Transaction, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/utils-finance"

interface RecentTransactionsProps {
  transactions: Transaction[]
  categories: Category[]
}

export default function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  return (
    <Card className="card-premium p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>

      {transactions.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const category = categories.find((c) => c.id === transaction.categoryId)
            const isExpense = transaction.type === "expense"
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{category?.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <p className={`font-bold whitespace-nowrap ml-2 ${isExpense ? "text-destructive" : "text-accent"}`}>
                  {isExpense ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
