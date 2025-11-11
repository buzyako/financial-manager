export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: "expense" | "income"
}

export interface Transaction {
  id: string
  categoryId: string
  amount: number
  description: string
  date: string
  type: "expense" | "income"
  isRecurring: boolean
  recurringPattern?: "daily" | "weekly" | "monthly" | "yearly"
}

export interface Budget {
  id: string
  categoryId: string
  limit: number
  month: string // YYYY-MM
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  priority: "low" | "medium" | "high"
}

export interface FinanceData {
  transactions: Transaction[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  categories: Category[]
  accountBalance: number
}
