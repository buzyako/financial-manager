"use client"

import type { Loan } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils-finance"
import Link from "next/link"
import { Landmark } from "lucide-react"

interface LoanOverviewCardProps {
  loans: Loan[]
}

export function LoanOverviewCard({ loans }: LoanOverviewCardProps) {
  const activeLoans = loans.filter((loan) => loan.status === "active")
  const outstandingBalance = activeLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0)
  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0)
  const nextPaymentTimestamp = activeLoans
    .filter((loan) => loan.nextPaymentDate)
    .map((loan) => new Date(loan.nextPaymentDate as string).getTime())
  const upcomingPayment =
    nextPaymentTimestamp.length > 0 ? new Date(Math.min(...nextPaymentTimestamp)).toLocaleDateString() : null

  const hasLoans = loans.length > 0

  return (
    <Card className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Loans & Debts</p>
          <h2 className="text-3xl font-bold text-foreground">
            {hasLoans ? formatCurrency(outstandingBalance) : formatCurrency(0)}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {hasLoans
              ? `${activeLoans.length} active • ${formatCurrency(totalPrincipal)} borrowed`
              : "No loans tracked yet"}
          </p>
          {upcomingPayment && (
            <p className="mt-2 text-xs text-muted-foreground">Next payment due {upcomingPayment}</p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Landmark className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/loans">{hasLoans ? "Manage loans" : "Create loan"}</Link>
        </Button>
      </div>
    </Card>
  )
}

