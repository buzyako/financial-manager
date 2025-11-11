"use client"

import type React from "react"

import { useState } from "react"
import type { Category, Budget } from "@/lib/types"
import { StorageManager } from "@/lib/storage"

interface BudgetFormProps {
  categories: Category[]
  currentMonth: string
  onSuccess: () => void
  onCancel: () => void
}

export default function BudgetForm({ categories, currentMonth, onSuccess, onCancel }: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState<string>("")
  const [limit, setLimit] = useState<string>("")
  const [error, setError] = useState<string>("")

  const expenseCategories = categories.filter((c) => c.type === "expense")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!categoryId || !limit) {
      setError("Please fill in all fields")
      return
    }

    const limitAmount = Number.parseFloat(limit)
    if (limitAmount <= 0) {
      setError("Budget limit must be greater than 0")
      return
    }

    // Check if budget already exists for this category this month
    const financeData = StorageManager.getData()
    const existingBudget = financeData.budgets.find((b) => b.month === currentMonth && b.categoryId === categoryId)

    if (existingBudget) {
      setError("Budget already exists for this category this month")
      return
    }

    const budget: Budget = {
      id: Date.now().toString(),
      categoryId,
      limit: limitAmount,
      month: currentMonth,
    }

    StorageManager.updateBudget(budget)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a category</option>
            {expenseCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Limit */}
        <div>
          <label htmlFor="limit" className="block text-sm font-medium text-foreground mb-2">
            Monthly Limit ($)
          </label>
          <input
            id="limit"
            type="number"
            step="0.01"
            min="0"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Create Budget
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
