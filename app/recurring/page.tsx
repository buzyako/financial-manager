"use client"

import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import type { FinanceData, Transaction } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import RecurringTransactionsList from "@/components/recurring-transactions-list"
import { getRecurringTransactionStats, generateRecurringTransactions } from "@/lib/recurring-utils"
import { formatCurrency } from "@/lib/utils-finance"
import { generateId } from "@/lib/utils"

export default function RecurringPage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [generatedTransactions, setGeneratedTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const financeData = StorageManager.getData()
    setData(financeData)
    const generated = generateRecurringTransactions(financeData.transactions, financeData.categories)
    setGeneratedTransactions(generated)
  }, [])

  const handleAddGenerated = (transaction: Transaction) => {
    StorageManager.addTransaction({
      ...transaction,
      id: generateId(),
      isRecurring: false,
    })
    const financeData = StorageManager.getData()
    setData(financeData)
    const generated = generateRecurringTransactions(financeData.transactions, financeData.categories)
    setGeneratedTransactions(generated.filter((t) => t.id !== transaction.id))
  }

  const handleDeleteRecurring = (id: string) => {
    StorageManager.deleteTransaction(id)
    const financeData = StorageManager.getData()
    setData(financeData)
  }

  if (!data) return null

  const recurringTransactions = data.transactions.filter((t) => t.isRecurring)
  const stats = getRecurringTransactionStats(data.transactions)

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navigation />

      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Recurring Transactions</h1>
            <p className="text-muted-foreground">Manage your automatic and recurring payments</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Active Recurring</p>
              <p className="text-3xl font-bold text-primary">{stats.recurring}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Monthly Expenses</p>
              <p className="text-3xl font-bold text-destructive">{formatCurrency(stats.monthlyExpenses)}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
              <p className="text-3xl font-bold text-accent">{formatCurrency(stats.monthlyIncome)}</p>
            </Card>
          </div>

          {/* Pending Generated Transactions */}
          {generatedTransactions.length > 0 && (
            <Card className="p-6 mb-8 border-accent border-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">Due Recurring Transactions</h2>
              <p className="text-sm text-muted-foreground mb-4">
                These recurring transactions are due. Click "Add" to confirm and record them.
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {generatedTransactions.map((transaction) => {
                  const category = data.categories.find((c) => c.id === transaction.categoryId)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{category?.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {category?.name} • {transaction.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold text-foreground">{formatCurrency(transaction.amount)}</p>
                        <button
                          onClick={() => handleAddGenerated(transaction)}
                          className="px-4 py-2 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Active Recurring Transactions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Active Recurring Transactions</h2>
            <RecurringTransactionsList
              transactions={recurringTransactions}
              categories={data.categories}
              onDelete={handleDeleteRecurring}
            />
          </Card>
        </div>
      </main>
    </div>
  )
}
