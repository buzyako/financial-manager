"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { Category, Transaction } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import { generateId } from "@/lib/utils"

interface TransactionFormProps {
  categories: Category[]
  onSuccess: () => void
  onCancel: () => void
  initialType?: "expense" | "income"
}

export default function TransactionForm({ categories, onSuccess, onCancel, initialType = "expense" }: TransactionFormProps) {
  const [type, setType] = useState<"expense" | "income">(initialType)
  const [categoryId, setCategoryId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPattern, setRecurringPattern] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setType(initialType)
    setCategoryId("")
  }, [initialType])

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!categoryId || !amount || !description) {
      setError("Please fill in all required fields")
      return
    }

    if (Number.parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    const transaction: Transaction = {
      id: generateId(),
      categoryId,
      amount: Number.parseFloat(amount),
      description,
      date,
      type,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
    }

    StorageManager.addTransaction(transaction)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType("expense")
                setCategoryId("")
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                type === "expense"
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income")
                setCategoryId("")
              }}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                type === "income" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground hover:bg-muted"
              }`}
            >
              Income
            </button>
          </div>
        </div>

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
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
            Amount (₱)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-foreground mb-2">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you spend or earn money on?"
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Recurring */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium text-foreground">This is a recurring transaction</span>
        </label>

        {isRecurring && (
          <div>
            <label htmlFor="pattern" className="block text-sm font-medium text-foreground mb-2">
              Recurring Pattern
            </label>
            <select
              id="pattern"
              value={recurringPattern}
              onChange={(e) => setRecurringPattern(e.target.value as any)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Add Transaction
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
