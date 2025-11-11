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

export interface User {
  id: string
  email: string
  passwordHash: string
  name?: string
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: string
  createdAt: string
  lastActivityAt: string
}

export interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
}

export interface AuthFormState {
  email: string
  password: string
  name?: string
  loading: boolean
  error?: string
}

export type OnboardingStepKey = "accountBalance" | "transaction" | "budget" | "goal"

export interface OnboardingState {
  steps: Record<OnboardingStepKey, boolean>
  completed: boolean
  dismissed: boolean
  updatedAt: string
}
