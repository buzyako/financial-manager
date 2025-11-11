"use client"

import type React from "react"

import { useState } from "react"
import type { SavingsGoal } from "@/lib/types"
import { StorageManager } from "@/lib/storage"

interface GoalFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("0")
  const [deadline, setDeadline] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim() || !targetAmount || !deadline) {
      setError("Please fill in all required fields")
      return
    }

    const target = Number.parseFloat(targetAmount)
    const current = Number.parseFloat(currentAmount)

    if (target <= 0) {
      setError("Target amount must be greater than 0")
      return
    }

    if (current < 0 || current > target) {
      setError("Current amount must be between 0 and target amount")
      return
    }

    const newDate = new Date(deadline)
    if (newDate <= new Date()) {
      setError("Deadline must be in the future")
      return
    }

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name,
      targetAmount: target,
      currentAmount: current,
      deadline,
      priority,
    }

    StorageManager.addSavingsGoal(goal)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
          Goal Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Vacation, Emergency Fund"
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="target" className="block text-sm font-medium text-foreground mb-2">
            Target Amount (₱)
          </label>
          <input
            id="target"
            type="number"
            step="0.01"
            min="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="current" className="block text-sm font-medium text-foreground mb-2">
            Current Amount (₱)
          </label>
          <input
            id="current"
            type="number"
            step="0.01"
            min="0"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-2">
            Target Deadline
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Create Goal
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
