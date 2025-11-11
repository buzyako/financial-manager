import type { Transaction, Category } from "./types"

export const generateRecurringTransactions = (transactions: Transaction[], categories: Category[]): Transaction[] => {
  const today = new Date()
  const generated: Transaction[] = []

  transactions.forEach((transaction) => {
    if (!transaction.isRecurring || !transaction.recurringPattern) return

    const transactionDate = new Date(transaction.date)
    const nextDate = new Date(transactionDate)

    while (nextDate <= today) {
      switch (transaction.recurringPattern) {
        case "daily":
          nextDate.setDate(nextDate.getDate() + 1)
          break
        case "weekly":
          nextDate.setDate(nextDate.getDate() + 7)
          break
        case "monthly":
          nextDate.setMonth(nextDate.getMonth() + 1)
          break
        case "yearly":
          nextDate.setFullYear(nextDate.getFullYear() + 1)
          break
      }

      if (nextDate <= today && nextDate > transactionDate) {
        const dateStr = nextDate.toISOString().split("T")[0]
        const existingTransaction = transactions.find(
          (t) =>
            t.categoryId === transaction.categoryId &&
            t.date === dateStr &&
            t.description === transaction.description &&
            t.amount === transaction.amount,
        )

        if (!existingTransaction) {
          generated.push({
            id: `${transaction.id}-${dateStr}`,
            categoryId: transaction.categoryId,
            amount: transaction.amount,
            description: transaction.description,
            date: dateStr,
            type: transaction.type,
            isRecurring: false,
          })
        }
      }
    }
  })

  return generated
}

export const getRecurringTransactionNextDate = (
  lastDate: string,
  pattern: "daily" | "weekly" | "monthly" | "yearly",
): string => {
  const date = new Date(lastDate)

  switch (pattern) {
    case "daily":
      date.setDate(date.getDate() + 1)
      break
    case "weekly":
      date.setDate(date.getDate() + 7)
      break
    case "monthly":
      date.setMonth(date.getMonth() + 1)
      break
    case "yearly":
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return date.toISOString().split("T")[0]
}

export const getRecurringTransactionStats = (transactions: Transaction[]) => {
  const recurring = transactions.filter((t) => t.isRecurring)

  const monthlyExpenses = recurring
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => {
      if (t.recurringPattern === "monthly") return sum + t.amount
      if (t.recurringPattern === "daily") return sum + t.amount * 30
      if (t.recurringPattern === "weekly") return sum + t.amount * 4.33
      if (t.recurringPattern === "yearly") return sum + t.amount / 12
      return sum
    }, 0)

  const monthlyIncome = recurring
    .filter((t) => t.type === "income")
    .reduce((sum, t) => {
      if (t.recurringPattern === "monthly") return sum + t.amount
      if (t.recurringPattern === "daily") return sum + t.amount * 30
      if (t.recurringPattern === "weekly") return sum + t.amount * 4.33
      if (t.recurringPattern === "yearly") return sum + t.amount / 12
      return sum
    }, 0)

  return { recurring: recurring.length, monthlyExpenses, monthlyIncome }
}
