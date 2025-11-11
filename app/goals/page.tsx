"use client"

import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import type { FinanceData, SavingsGoal } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import GoalForm from "@/components/goal-form"
import GoalsList from "@/components/goals-list"

export default function GoalsPage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const financeData = StorageManager.getData()
    setData(financeData)
  }, [])

  const handleGoalAdded = () => {
    const financeData = StorageManager.getData()
    setData(financeData)
    setShowForm(false)
  }

  const handleUpdateGoal = (goal: SavingsGoal) => {
    StorageManager.updateSavingsGoal(goal)
    const financeData = StorageManager.getData()
    setData(financeData)
  }

  const handleDeleteGoal = (id: string) => {
    StorageManager.deleteSavingsGoal(id)
    const financeData = StorageManager.getData()
    setData(financeData)
  }

  if (!data) return null

  const totalSavings = data.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0)
  const totalTarget = data.savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0)

  return (
    <div className="flex h-screen bg-background">
      <Navigation />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Savings Goals</h1>
              <p className="text-muted-foreground">Track progress toward your financial goals</p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create Goal
              </button>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Saved</p>
              <p className="text-3xl font-bold text-accent">${totalSavings.toFixed(2)}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Target</p>
              <p className="text-3xl font-bold text-foreground">${totalTarget.toFixed(2)}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-muted-foreground mb-1">Active Goals</p>
              <p className="text-3xl font-bold text-primary">{data.savingsGoals.length}</p>
            </Card>
          </div>

          {showForm && (
            <Card className="p-6 mb-8">
              <GoalForm onSuccess={handleGoalAdded} onCancel={() => setShowForm(false)} />
            </Card>
          )}

          <GoalsList goals={data.savingsGoals} onUpdate={handleUpdateGoal} onDelete={handleDeleteGoal} />
        </div>
      </main>
    </div>
  )
}
