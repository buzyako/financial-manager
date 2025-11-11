"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navigation from "@/components/navigation"
import TransactionForm from "@/components/transaction-form"
import TransactionsList from "@/components/transactions-list"
import type { FinanceData } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import { Card } from "@/components/ui/card"

export default function TransactionsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paramsString = searchParams.toString()
  const initialTypeParam = useMemo(() => {
    const params = new URLSearchParams(paramsString)
    const type = params.get("type")
    if (type === "income" || type === "expense") return type
    if (params.get("action") === "add-income") return "income"
    return "expense"
  }, [paramsString])
  const shouldOpenForm = useMemo(() => {
    const params = new URLSearchParams(paramsString)
    const action = params.get("action")
    return action === "add-expense" || action === "add-income" || params.has("type")
  }, [paramsString])
  const [data, setData] = useState<FinanceData | null>(null)
  const [showForm, setShowForm] = useState(shouldOpenForm)
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all")
  const [formType, setFormType] = useState<"expense" | "income">(initialTypeParam)

  useEffect(() => {
    const financeData = StorageManager.getData()
    setData(financeData)
  }, [])

  useEffect(() => {
    setShowForm(shouldOpenForm)
  }, [shouldOpenForm])

  useEffect(() => {
    setFormType(initialTypeParam)
    if (shouldOpenForm && (initialTypeParam === "expense" || initialTypeParam === "income")) {
      setFilterType("all")
    }
  }, [initialTypeParam, shouldOpenForm])

  const resetQueryParams = () => {
    router.replace("/transactions", { scroll: false })
  }

  const handleTransactionAdded = () => {
    const financeData = StorageManager.getData()
    setData(financeData)
    setShowForm(false)
    resetQueryParams()
  }

  const handleDeleteTransaction = (id: string) => {
    StorageManager.deleteTransaction(id)
    const financeData = StorageManager.getData()
    setData(financeData)
  }

  const handleOpenForm = (type: "expense" | "income") => {
    setFormType(type)
    setShowForm(true)
  }

  if (!data) return null

  const filteredTransactions = data.transactions.filter((t) => {
    if (filterType === "all") return true
    return t.type === filterType
  })

  return (
    <div className="flex h-screen bg-background">
      <Navigation />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
              <p className="text-muted-foreground">Track all your income and expenses</p>
            </div>
            {!showForm && (
              <button
                onClick={() => handleOpenForm("expense")}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add Transaction
              </button>
            )}
          </div>

          {showForm && (
            <Card className="p-6 mb-8">
              <TransactionForm
                categories={data.categories}
                initialType={formType}
                onSuccess={handleTransactionAdded}
                onCancel={() => {
                  setShowForm(false)
                  resetQueryParams()
                }}
              />
            </Card>
          )}

          <Card className="p-6">
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterType === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("expense")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterType === "expense"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setFilterType("income")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterType === "income"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                Income
              </button>
            </div>

            <TransactionsList
              transactions={filteredTransactions}
              categories={data.categories}
              onDelete={handleDeleteTransaction}
            />
          </Card>
        </div>
      </main>
    </div>
  )
}
