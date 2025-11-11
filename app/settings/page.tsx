"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import type { FinanceData, Category } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import { Card } from "@/components/ui/card"

const CATEGORY_ICONS = ["🍽️", "🚗", "🎬", "💡", "🛍️", "💪", "💰", "💼", "📈", "⚽", "🎓", "🏥", "✈️", "🎁", "📱"]
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#95E1D3",
  "#F38181",
  "#AA96DA",
  "#52D2A3",
  "#73C6F5",
  "#FFB347",
  "#87CEEB",
]

export default function SettingsPage() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState(CATEGORY_ICONS[0])
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0])
  const [newCategoryType, setNewCategoryType] = useState<"expense" | "income">("expense")
  const [accountBalance, setAccountBalance] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const financeData = StorageManager.getData()
    setData(financeData)
    setAccountBalance(financeData.accountBalance.toString())
  }, [])

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newCategoryName.trim()) {
      setError("Category name is required")
      return
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName,
      icon: newCategoryIcon,
      color: newCategoryColor,
      type: newCategoryType,
    }

    StorageManager.addCategory(newCategory)
    const financeData = StorageManager.getData()
    setData(financeData)
    setNewCategoryName("")
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      const financeData = StorageManager.getData()
      financeData.categories = financeData.categories.filter((c) => c.id !== categoryId)
      StorageManager.saveData(financeData)
      setData(financeData)
    }
  }

  const handleUpdateBalance = () => {
    const newBalance = Number.parseFloat(accountBalance)
    if (isNaN(newBalance) || newBalance < 0) {
      setError("Please enter a valid balance")
      return
    }
    StorageManager.updateAccountBalance(newBalance)
    const financeData = StorageManager.getData()
    setData(financeData)
    setError("")
    alert("Account balance updated successfully!")
  }

  if (!data) return null

  const expenseCategories = data.categories.filter((c) => c.type === "expense")
  const incomeCategories = data.categories.filter((c) => c.type === "income")

  return (
    <div className="flex h-screen bg-background">
      <Navigation />

      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

          {/* Account Balance */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Balance</h2>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                min="0"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={handleUpdateBalance}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Update
              </button>
            </div>
          </Card>

          {/* Add Category */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Add Custom Category</h2>
            {error && <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-4">{error}</div>}
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cat-name" className="block text-sm font-medium text-foreground mb-2">
                    Category Name
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Groceries"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="cat-type" className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    id="cat-type"
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cat-icon" className="block text-sm font-medium text-foreground mb-2">
                    Icon
                  </label>
                  <select
                    id="cat-icon"
                    value={newCategoryIcon}
                    onChange={(e) => setNewCategoryIcon(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORY_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cat-color" className="block text-sm font-medium text-foreground mb-2">
                    Color
                  </label>
                  <select
                    id="cat-color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {COLORS.map((color) => (
                      <option key={color} value={color}>
                        <span
                          style={{
                            display: "inline-block",
                            width: "12px",
                            height: "12px",
                            backgroundColor: color,
                            marginRight: "5px",
                          }}
                        ></span>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
              >
                Add Category
              </button>
            </form>
          </Card>

          {/* Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expense Categories */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Expense Categories</h2>
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-foreground font-medium">{category.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-3 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Income Categories */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Income Categories</h2>
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-foreground font-medium">{category.name}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="px-3 py-1 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
