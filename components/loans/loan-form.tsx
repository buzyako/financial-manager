"use client"

import { useState } from "react"
import type { Loan } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface LoanFormProps {
  onSubmit: (loan: Omit<Loan, "id" | "createdAt" | "updatedAt" | "remainingBalance">) => void
  onCancel?: () => void
}

export function LoanForm({ onSubmit, onCancel }: LoanFormProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"loan" | "debt">("loan")
  const [principal, setPrincipal] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [nextPaymentDate, setNextPaymentDate] = useState("")
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const parsedPrincipal = Number.parseFloat(principal)
    const parsedInterest = Number.parseFloat(interestRate || "0")
    const parsedPayment = Number.parseFloat(paymentAmount || "0")

    if (!name.trim()) {
      setError("Loan name is required.")
      return
    }

    if (Number.isNaN(parsedPrincipal) || parsedPrincipal <= 0) {
      setError("Principal must be greater than 0.")
      return
    }

    if (Number.isNaN(parsedPayment) || parsedPayment < 0) {
      setError("Monthly payment must be 0 or more.")
      return
    }

    setSubmitting(true)

    onSubmit({
      name,
      type,
      principal: parsedPrincipal,
      interestRate: Number.isNaN(parsedInterest) ? 0 : parsedInterest,
      paymentAmount: parsedPayment,
      startDate,
      nextPaymentDate: nextPaymentDate || undefined,
      status: "active",
      notes: notes.trim() || undefined,
    })

    setSubmitting(false)
    setName("")
    setType("loan")
    setPrincipal("")
    setInterestRate("")
    setPaymentAmount("")
    setStartDate(new Date().toISOString().split("T")[0])
    setNextPaymentDate("")
    setNotes("")
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="loan-name">Loan Name</Label>
          <Input
            id="loan-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Personal Loan"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-type">Type</Label>
          <select
            id="loan-type"
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
            )}
            value={type}
            onChange={(event) => setType(event.target.value as "loan" | "debt")}
          >
            <option value="loan">Loan</option>
            <option value="debt">Debt</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="principal">Principal Amount (₱)</Label>
          <Input
            id="principal"
            type="number"
            step="0.01"
            min="0"
            value={principal}
            onChange={(event) => setPrincipal(event.target.value)}
            placeholder="50000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interest">Interest Rate (%)</Label>
          <Input
            id="interest"
            type="number"
            step="0.01"
            min="0"
            value={interestRate}
            onChange={(event) => setInterestRate(event.target.value)}
            placeholder="7.5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment">Monthly Payment (₱)</Label>
          <Input
            id="payment"
            type="number"
            step="0.01"
            min="0"
            value={paymentAmount}
            onChange={(event) => setPaymentAmount(event.target.value)}
            placeholder="2500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Input id="start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="next-payment">Next Payment Date (optional)</Label>
          <Input
            id="next-payment"
            type="date"
            value={nextPaymentDate}
            onChange={(event) => setNextPaymentDate(event.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Bank, terms, reminders, etc."
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Loan"}
        </Button>
      </div>
    </form>
  )
}

