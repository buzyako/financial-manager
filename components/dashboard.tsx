"use client"

import { useEffect, useMemo, useState } from "react"
import type { FinanceData, OnboardingState, OnboardingStepKey } from "@/lib/types"
import { StorageManager } from "@/lib/storage"
import {
  calculateMonthlySpending,
  calculateMonthlyIncome,
  getSpendingByCategory,
  formatCurrency,
  getCurrentMonth,
} from "@/lib/utils-finance"
import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle } from "lucide-react"
import Navigation from "./navigation"
import BalanceCard from "./balance-card"
import BudgetStatus from "./budget-status"
import RecentTransactions from "./recent-transactions"
import QuickActions from "./quick-actions"
import { useAuth } from "@/context/auth-context"
import { OnboardingDialog, onboardingStepMeta } from "@/components/onboarding/onboarding-dialog"

export default function Dashboard() {
  const [data, setData] = useState<FinanceData | null>(null)
  const [currentMonth] = useState(getCurrentMonth())
  const { currentUser } = useAuth()
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null)
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  useEffect(() => {
    const financeData = StorageManager.getData()
    setData(financeData)
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setOnboardingState(null)
      setShowOnboardingBanner(false)
      setOnboardingOpen(false)
      return
    }
    const stored = StorageManager.getOnboardingState(currentUser.id)
    setOnboardingState(stored)
    const shouldPrompt = !stored.completed && !stored.dismissed
    setShowOnboardingBanner(shouldPrompt)
    setOnboardingOpen(shouldPrompt)
  }, [currentUser])

  useEffect(() => {
    if (!currentUser || !data || !onboardingState) return

    const steps: Record<OnboardingStepKey, boolean> = {
      accountBalance: data.accountBalance > 0,
      transaction: data.transactions.length > 0,
      budget: data.budgets.length > 0,
      goal: data.savingsGoals.length > 0,
    }

    const completed = Object.values(steps).every(Boolean)
    const hasStepChange = (Object.keys(steps) as OnboardingStepKey[]).some(
      (key) => onboardingState.steps[key] !== steps[key],
    )
    if (hasStepChange || onboardingState.completed !== completed) {
      const nextState: OnboardingState = {
        ...onboardingState,
        steps,
        completed,
        updatedAt: new Date().toISOString(),
      }
      setOnboardingState(nextState)
      StorageManager.saveOnboardingState(currentUser.id, nextState)
      const shouldPrompt = !nextState.completed && !nextState.dismissed
      setShowOnboardingBanner(shouldPrompt)
      if (nextState.completed) {
        setOnboardingOpen(false)
      }
    } else {
      const shouldPrompt = !onboardingState.completed && !onboardingState.dismissed
      setShowOnboardingBanner(shouldPrompt)
    }
  }, [
    currentUser,
    data?.accountBalance,
    data?.transactions.length,
    data?.budgets.length,
    data?.savingsGoals.length,
    onboardingState,
  ])

  const onboardingSteps = useMemo(() => {
    if (onboardingState) return onboardingState.steps
    return {
      accountBalance: false,
      transaction: false,
      budget: false,
      goal: false,
    }
  }, [onboardingState])

  const completedOnboardingCount = useMemo(
    () => Object.values(onboardingSteps).filter(Boolean).length,
    [onboardingSteps],
  )
  const onboardingTotalSteps = useMemo(() => Object.keys(onboardingSteps).length, [onboardingSteps])

  const handleDismissOnboarding = () => {
    if (!currentUser || !onboardingState) {
      setOnboardingOpen(false)
      setShowOnboardingBanner(false)
      return
    }
    const nextState: OnboardingState = {
      ...onboardingState,
      dismissed: true,
      updatedAt: new Date().toISOString(),
    }
    setOnboardingState(nextState)
    StorageManager.saveOnboardingState(currentUser.id, nextState)
    setOnboardingOpen(false)
    setShowOnboardingBanner(false)
  }

  if (!data) return null

  const monthlySpending = calculateMonthlySpending(data.transactions, currentMonth)
  const monthlyIncome = calculateMonthlyIncome(data.transactions, currentMonth)
  const spendingByCategory = getSpendingByCategory(data.transactions, currentMonth)

  const chartData = Object.entries(spendingByCategory)
    .map(([categoryId, amount]) => {
      const category = data.categories.find((c) => c.id === categoryId)
      return {
        name: category?.name || "Unknown",
        value: amount,
        color: category?.color || "#999",
      }
    })
    .filter((item) => item.value > 0)

  const currentBudgetMonth = data.budgets.filter((b) => b.month === currentMonth)

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navigation />

      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="mb-8 md:mb-10">
            <h1 className="text-5xl font-bold text-foreground mb-2">Finance Manager</h1>
            <p className="text-muted-foreground text-lg">Welcome back! Here's your financial overview</p>
            <p className="text-sm text-muted-foreground mt-2">{currentMonth}</p>
          </div>

          {showOnboardingBanner && (
            <Card className="mb-8 border-primary/30 bg-primary/5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Finish setting up your workspace</h2>
                  <p className="text-sm text-muted-foreground">
                    {completedOnboardingCount} of {onboardingTotalSteps} tasks completed
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDismissOnboarding}>
                    Skip for now
                  </Button>
                  <Button onClick={() => setOnboardingOpen(true)}>Open checklist</Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(Object.keys(onboardingSteps) as OnboardingStepKey[]).map((key) => {
                  const meta = onboardingStepMeta[key]
                  const completed = onboardingSteps[key]
                  return (
                    <div
                      key={key}
                      className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-3"
                    >
                      {completed ? (
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
                      ) : (
                        <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" aria-hidden />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Top Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <BalanceCard balance={data.accountBalance} />
            <BudgetStatus
              spending={monthlySpending}
              income={monthlyIncome}
              currentMonth={currentMonth}
              budgets={currentBudgetMonth}
              categories={data.categories}
            />
          </div>

          {/* Charts and Recent Transactions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Spending by Category Chart */}
            <Card className="card-premium lg:col-span-1 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No spending data yet
                </div>
              )}
            </Card>

            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <RecentTransactions transactions={data.transactions.slice(-10).reverse()} categories={data.categories} />
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </main>

      <OnboardingDialog
        open={onboardingOpen}
        onOpenChange={(open) => setOnboardingOpen(open)}
        steps={onboardingSteps}
        onDismiss={handleDismissOnboarding}
      />
    </div>
  )
}
