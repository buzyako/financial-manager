import { generateId } from "@/lib/utils"
import type { FinanceData, Category, Transaction, Budget, SavingsGoal } from "./types"

const STORAGE_KEY = "finance-app-data"

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Food & Dining", icon: "🍽️", color: "#FF6B6B", type: "expense" },
  { id: "2", name: "Transportation", icon: "🚗", color: "#4ECDC4", type: "expense" },
  { id: "3", name: "Entertainment", icon: "🎬", color: "#FFE66D", type: "expense" },
  { id: "4", name: "Utilities", icon: "💡", color: "#95E1D3", type: "expense" },
  { id: "5", name: "Shopping", icon: "🛍️", color: "#F38181", type: "expense" },
  { id: "6", name: "Health & Fitness", icon: "💪", color: "#AA96DA", type: "expense" },
  { id: "7", name: "Salary", icon: "💰", color: "#52D2A3", type: "income" },
  { id: "8", name: "Freelance", icon: "💼", color: "#73C6F5", type: "income" },
  { id: "9", name: "Investment Returns", icon: "📈", color: "#FFB347", type: "income" },
]

const DEFAULT_DATA: FinanceData = {
  transactions: [],
  budgets: [],
  savingsGoals: [],
  categories: DEFAULT_CATEGORIES,
  accountBalance: 5000,
}

export const StorageManager = {
  getData: (): FinanceData => {
    if (typeof window === "undefined") return DEFAULT_DATA
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : DEFAULT_DATA
    } catch {
      return DEFAULT_DATA
    }
  },

  saveData: (data: FinanceData): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },

  addTransaction: (transaction: Transaction): void => {
    const data = StorageManager.getData()
    const entry: Transaction = {
      ...transaction,
      id: transaction.id || generateId(),
    }
    data.transactions.push(entry)
    data.accountBalance += entry.type === "income" ? entry.amount : -entry.amount
    StorageManager.saveData(data)
  },

  deleteTransaction: (id: string): void => {
    const data = StorageManager.getData()
    const transaction = data.transactions.find((t) => t.id === id)
    if (transaction) {
      data.accountBalance -= transaction.type === "income" ? transaction.amount : -transaction.amount
    }
    data.transactions = data.transactions.filter((t) => t.id !== id)
    StorageManager.saveData(data)
  },

  updateBudget: (budget: Budget): void => {
    const data = StorageManager.getData()
    const index = data.budgets.findIndex((b) => b.id === budget.id)
    if (index >= 0) {
      data.budgets[index] = budget
    } else {
      data.budgets.push(budget)
    }
    StorageManager.saveData(data)
  },

  deleteBudget: (id: string): void => {
    const data = StorageManager.getData()
    data.budgets = data.budgets.filter((b) => b.id !== id)
    StorageManager.saveData(data)
  },

  addSavingsGoal: (goal: SavingsGoal): void => {
    const data = StorageManager.getData()
    data.savingsGoals.push(goal)
    StorageManager.saveData(data)
  },

  updateSavingsGoal: (goal: SavingsGoal): void => {
    const data = StorageManager.getData()
    const index = data.savingsGoals.findIndex((g) => g.id === goal.id)
    if (index >= 0) {
      data.savingsGoals[index] = goal
    }
    StorageManager.saveData(data)
  },

  deleteSavingsGoal: (id: string): void => {
    const data = StorageManager.getData()
    data.savingsGoals = data.savingsGoals.filter((g) => g.id !== id)
    StorageManager.saveData(data)
  },

  addCategory: (category: Category): void => {
    const data = StorageManager.getData()
    data.categories.push(category)
    StorageManager.saveData(data)
  },

  updateAccountBalance: (amount: number): void => {
    const data = StorageManager.getData()
    data.accountBalance = amount
    StorageManager.saveData(data)
  },
}
