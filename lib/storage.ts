import { generateId } from "@/lib/utils"
import type {
  FinanceData,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  User,
  AuthSession,
  OnboardingState,
} from "./types"

const STORAGE_KEY = "finance-app-data"
const USERS_KEY = "finance-app-users"
const AUTH_SESSION_KEY = "finance-app-session"
const AUTH_INTENT_KEY = "finance-app-auth-intent"
const ONBOARDING_KEY = "finance-app-onboarding"
const ONBOARDING_DEFAULT_STATE: OnboardingState = {
  steps: {
    accountBalance: false,
    transaction: false,
    budget: false,
    goal: false,
  },
  completed: false,
  dismissed: false,
  updatedAt: new Date().toISOString(),
}

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
  accountBalance: 0,
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

  getUsers: (): User[] => {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(USERS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  saveUsers: (users: User[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  },

  findUserByEmail: (email: string): User | undefined => {
    const users = StorageManager.getUsers()
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase())
  },

  createUser: (user: Omit<User, "id" | "createdAt" | "updatedAt"> & { passwordHash: string }): User => {
    const users = StorageManager.getUsers()
    const now = new Date().toISOString()
    const newUser: User = {
      id: generateId(),
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      createdAt: now,
      updatedAt: now,
    }
    users.push(newUser)
    StorageManager.saveUsers(users)
    return newUser
  },

  updateUser: (user: User): void => {
    const users = StorageManager.getUsers()
    const index = users.findIndex((existing) => existing.id === user.id)
    if (index !== -1) {
      users[index] = { ...user, updatedAt: new Date().toISOString() }
      StorageManager.saveUsers(users)
    }
  },

  deleteUser: (userId: string): void => {
    const users = StorageManager.getUsers().filter((user) => user.id !== userId)
    StorageManager.saveUsers(users)
  },

  getSession: (): AuthSession | null => {
    if (typeof window === "undefined") return null
    try {
      const stored = localStorage.getItem(AUTH_SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  saveSession: (session: AuthSession): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
  },

  clearSession: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(AUTH_SESSION_KEY)
  },

  setAuthRedirectIntent: (path: string): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(AUTH_INTENT_KEY, path)
  },

  consumeAuthRedirectIntent: (): string | null => {
    if (typeof window === "undefined") return null
    const intent = localStorage.getItem(AUTH_INTENT_KEY)
    localStorage.removeItem(AUTH_INTENT_KEY)
    return intent
  },

  getOnboardingState: (userId: string): OnboardingState => {
    if (typeof window === "undefined") return { ...ONBOARDING_DEFAULT_STATE }
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY)
      const allStates: Record<string, OnboardingState> = stored ? JSON.parse(stored) : {}
      return allStates[userId]
        ? { ...ONBOARDING_DEFAULT_STATE, ...allStates[userId] }
        : { ...ONBOARDING_DEFAULT_STATE }
    } catch {
      return { ...ONBOARDING_DEFAULT_STATE }
    }
  },

  saveOnboardingState: (userId: string, state: OnboardingState): void => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY)
      const allStates: Record<string, OnboardingState> = stored ? JSON.parse(stored) : {}
      allStates[userId] = state
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(allStates))
    } catch {
      // ignore
    }
  },

  clearOnboardingState: (userId: string): void => {
    if (typeof window === "undefined") return
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY)
      if (!stored) return
      const allStates: Record<string, OnboardingState> = JSON.parse(stored)
      delete allStates[userId]
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(allStates))
    } catch {
      // ignore
    }
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
