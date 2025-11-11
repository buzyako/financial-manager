"use client"

import { useState } from "react"
import type { SavingsGoal } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils-finance"

interface GoalsListProps {
  goals: SavingsGoal[]
  onUpdate: (goal: SavingsGoal) => void
  onDelete: (id: string) => void
}

export default function GoalsList({ goals, onUpdate, onDelete }: GoalsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState("")

  const handleStartEdit = (goal: SavingsGoal) => {
    setEditingId(goal.id)
    setEditAmount(goal.currentAmount.toString())
  }

  const handleSaveEdit = (goal: SavingsGoal) => {
    const newAmount = Number.parseFloat(editAmount)
    if (isNaN(newAmount) || newAmount < 0 || newAmount > goal.targetAmount) {
      alert("Invalid amount")
      return
    }
    onUpdate({ ...goal, currentAmount: newAmount })
    setEditingId(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-yellow-500"
      case "low":
        return "text-accent"
      default:
        return "text-muted-foreground"
    }
  }

  const getDaysRemaining = (deadline: string) => {
    const now = new Date()
    const end = new Date(deadline)
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 3600 * 24))
    return days
  }

  if (goals.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground text-lg">No savings goals yet</p>
        <p className="text-sm text-muted-foreground">
          Create your first goal to start saving toward something meaningful
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100
        const remaining = goal.targetAmount - goal.currentAmount
        const daysLeft = getDaysRemaining(goal.deadline)

        return (
          <Card key={goal.id} className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-foreground">{goal.name}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${getPriorityColor(goal.priority)} opacity-75`}
                  >
                    {goal.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Target: {new Date(goal.deadline).toLocaleDateString()} ({daysLeft} days remaining)
                </p>
              </div>
              <div className="flex gap-2">
                {editingId === goal.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(goal)}
                      className="px-3 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs bg-secondary text-foreground rounded hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleStartEdit(goal)}
                      className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => onDelete(goal.id)}
                      className="px-3 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Amount Info */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-secondary rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Saved</p>
                <p className="text-lg font-bold text-accent">{formatCurrency(goal.currentAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(remaining)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(goal.targetAmount)}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted-foreground">Progress</span>
                <span className="text-sm font-semibold text-accent">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Edit Current Amount */}
            {editingId === goal.id && (
              <div className="mt-4 p-3 bg-secondary rounded-lg">
                <label className="block text-sm font-medium text-foreground mb-2">Update Current Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
