"use client"

import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import type { FinanceData } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import BudgetForm from "@/components/budget-form"
import BudgetsList from "@/components/budgets-list"
import { getCurrentMonth } from "@/lib/utils-finance"

export default function BudgetsPage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [currentMonth] = useState(getCurrentMonth())

  useEffect(() => {
    const financeData = StorageManager.getData()
    setData(financeData)
  }, [])

  const handleBudgetAdded = () => {
    const financeData = StorageManager.getData()
    setData(financeData)
    setShowForm(false)
  }

  const handleDeleteBudget = (id: string) => {
    StorageManager.deleteBudget(id)
    const financeData = StorageManager.getData()
    setData(financeData)
  }

  if (!data) return null

  const currentBudgets = data.budgets.filter((b) => b.month === currentMonth)

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navigation />

      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Budget Management</h1>
              <p className="text-muted-foreground">Set and manage your spending limits for {currentMonth}</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Budget
              </button>
            )}
          </div>

          {showForm && (
            <Card className="p-6 mb-8">
              <BudgetForm
                categories={data.categories}
                currentMonth={currentMonth}
                onSuccess={handleBudgetAdded}
                onCancel={() => setShowForm(false)}
              />
            </Card>
          )}

          <BudgetsList
            budgets={currentBudgets}
            transactions={data.transactions}
            categories={data.categories}
            currentMonth={currentMonth}
            onDelete={handleDeleteBudget}
          />
        </div>
      </main>
    </div>
  )
}
