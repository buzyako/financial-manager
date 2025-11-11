import { z } from "zod"

export const categorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  type: z.enum(["expense", "income"]),
})

export const transactionSchema = z
  .object({
    id: z.string().min(1),
    categoryId: z.string().min(1),
    amount: z.number().finite(),
    description: z.string().min(1),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    type: z.enum(["expense", "income"]),
    isRecurring: z.boolean(),
    recurringPattern: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.isRecurring && !value.recurringPattern) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring transactions must specify a recurring pattern.",
        path: ["recurringPattern"],
      })
    }
  })

export const budgetSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  limit: z.number().finite().nonnegative(),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
})

export const savingsGoalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  targetAmount: z.number().finite().positive(),
  currentAmount: z.number().finite().nonnegative(),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be in YYYY-MM-DD format"),
  priority: z.enum(["low", "medium", "high"]),
})

export const loanSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["loan", "debt"]),
  principal: z.number().finite().positive(),
  interestRate: z.number().finite().nonnegative(),
  paymentAmount: z.number().finite().nonnegative(),
  remainingBalance: z.number().finite().min(0),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  nextPaymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Next payment must be in YYYY-MM-DD format")
    .optional(),
  status: z.enum(["active", "paid", "default"]),
  notes: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
})

export const loanPaymentSchema = z.object({
  id: z.string().min(1),
  loanId: z.string().min(1),
  amount: z.number().finite().positive(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Payment date must be in YYYY-MM-DD format"),
  notes: z.string().optional(),
})

export const financeDataSchema = z.object({
  transactions: z.array(transactionSchema),
  budgets: z.array(budgetSchema),
  savingsGoals: z.array(savingsGoalSchema),
  categories: z.array(categorySchema),
  accountBalance: z.number().finite(),
  loans: z.array(loanSchema).optional().default([]),
})

export const transactionInputSchema = transactionSchema.omit({ id: true })
export const loanInputSchema = loanSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  remainingBalance: true,
})
export const loanPaymentInputSchema = loanPaymentSchema.omit({ id: true })

