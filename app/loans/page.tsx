"use client"

import { useMemo, useState } from "react"
import Navigation from "@/components/navigation"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { LoanProvider, useLoans } from "@/components/loans/loan-context"
import { LoanForm } from "@/components/loans/loan-form"
import { LoanList } from "@/components/loans/loan-list"
import { LoanPaymentDialog } from "@/components/loans/loan-payment-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils-finance"
import type { Loan } from "@/lib/types"
import { CalendarDays, PlusCircle } from "lucide-react"

function LoansContent() {
  const { loans, payments, loading, addLoan, deleteLoan, addPayment } = useLoans()
  const [showForm, setShowForm] = useState(loans.length === 0)
  const [paymentLoan, setPaymentLoan] = useState<Loan | null>(null)

  const totalPrincipal = useMemo(
    () => loans.reduce((sum, loan) => sum + loan.principal, 0),
    [loans],
  )
  const totalRemaining = useMemo(
    () => loans.reduce((sum, loan) => sum + loan.remainingBalance, 0),
    [loans],
  )
  const upcomingPayment = useMemo(() => {
    const nextDates = loans
      .filter((loan) => loan.nextPaymentDate)
      .map((loan) => new Date(loan.nextPaymentDate as string).getTime())
    if (nextDates.length === 0) return null
    return new Date(Math.min(...nextDates))
  }, [loans])

  const handleDeleteLoan = (loan: Loan) => {
    if (confirm(`Delete ${loan.name}? This will remove all recorded payments.`)) {
      deleteLoan(loan.id)
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Navigation />

      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Loans & Debts</h1>
              <p className="text-muted-foreground">
                Track outstanding balances, payment schedules, and payoff progress.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setShowForm((prev) => !prev)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {showForm ? "Hide form" : "New loan"}
              </Button>
            </div>
          </header>

          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Total principal</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalPrincipal)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Outstanding balance</p>
              <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalRemaining)}</p>
            </Card>
            <Card className="flex items-center gap-3 p-5">
              <CalendarDays className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Next payment due</p>
                <p className="text-lg font-semibold text-foreground">
                  {upcomingPayment ? upcomingPayment.toLocaleDateString() : "Not scheduled"}
                </p>
              </div>
            </Card>
          </section>

          {showForm && (
            <Card className="mb-8 p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Add a new loan or debt</h2>
              <LoanForm
                onSubmit={(payload) => {
                  addLoan(payload)
                  setShowForm(false)
                }}
                onCancel={() => setShowForm(false)}
              />
            </Card>
          )}

          <section className="space-y-4">
            {loading ? (
              <Card className="p-10 text-center text-sm text-muted-foreground">Loading loans…</Card>
            ) : (
              <LoanList
                loans={loans}
                payments={payments}
                onRecordPayment={(loan) => setPaymentLoan(loan)}
                onDelete={handleDeleteLoan}
              />
            )}
          </section>
        </div>
      </main>

      <LoanPaymentDialog
        loan={paymentLoan}
        open={Boolean(paymentLoan)}
        onOpenChange={(open) => {
          if (!open) setPaymentLoan(null)
        }}
        onSubmit={(payment) => {
          addPayment(payment)
          setPaymentLoan(null)
        }}
      />
    </div>
  )
}

export default function LoansPage() {
  return (
    <ProtectedRoute>
      <LoanProvider>
        <LoansContent />
      </LoanProvider>
    </ProtectedRoute>
  )
}

