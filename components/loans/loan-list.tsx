"use client"

import type { Loan, LoanPayment } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils-finance"
import { format, parseISO } from "date-fns"
import { Info, Wallet } from "lucide-react"

interface LoanListProps {
  loans: Loan[]
  payments: LoanPayment[]
  onRecordPayment: (loan: Loan) => void
  onDelete: (loan: Loan) => void
}

const statusColor: Record<Loan["status"], string> = {
  active: "bg-primary/10 text-primary",
  paid: "bg-accent/10 text-accent",
  default: "bg-destructive/10 text-destructive",
}

const statusLabel: Record<Loan["status"], string> = {
  active: "Active",
  paid: "Paid",
  default: "In Default",
}

export function LoanList({ loans, payments, onRecordPayment, onDelete }: LoanListProps) {
  if (loans.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Wallet className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-4 text-lg font-semibold text-foreground">No loans yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first loan or debt to start tracking balances and payments.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {loans.map((loan) => {
        const loanPayments = payments
          .filter((payment) => payment.loanId === loan.id)
          .sort((a, b) => (a.date > b.date ? -1 : 1))
          .slice(0, 3)

        const nextPaymentLabel = loan.nextPaymentDate
          ? format(parseISO(loan.nextPaymentDate), "MMM d, yyyy")
          : "Not set"

        return (
          <Card key={loan.id} className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{loan.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{loan.type}</span>
                  <span>•</span>
                  <span>Started {format(parseISO(loan.startDate), "MMM d, yyyy")}</span>
                </div>
              </div>
              <Badge className={statusColor[loan.status]}>{statusLabel[loan.status]}</Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Principal</p>
                <p className="text-base font-semibold text-foreground">{formatCurrency(loan.principal)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Remaining Balance</p>
                <p className="text-base font-semibold text-foreground">{formatCurrency(loan.remainingBalance)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Monthly Payment</p>
                <p className="text-base font-semibold text-foreground">{formatCurrency(loan.paymentAmount)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">Interest Rate</p>
                <p className="text-base font-semibold text-foreground">{loan.interestRate.toFixed(2)}%</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 sm:col-span-2">
                <p className="text-xs text-muted-foreground">Next Payment Due</p>
                <p className="text-base font-semibold text-foreground">{nextPaymentLabel}</p>
              </div>
            </div>

            {loan.notes && (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p>{loan.notes}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent payments</p>
              {loanPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {loanPayments.map((payment) => (
                    <li key={payment.id} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2">
                      <span>{format(parseISO(payment.date), "MMM d, yyyy")}</span>
                      <span className="font-medium text-foreground">{formatCurrency(payment.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={() => onRecordPayment(loan)} disabled={loan.status !== "active"}>
                Record Payment
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDelete(loan)}>
                Delete
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

