"use client"

import { useState } from "react"
import type { Loan } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils-finance"

interface LoanPaymentDialogProps {
  loan: Loan | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: { loanId: string; amount: number; date: string; notes?: string }) => void
}

export function LoanPaymentDialog({ loan, open, onOpenChange, onSubmit }: LoanPaymentDialogProps) {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!loan) return

    const parsedAmount = Number.parseFloat(amount)
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Payment amount must be greater than 0.")
      return
    }

    onSubmit({
      loanId: loan.id,
      amount: parsedAmount,
      date,
      notes: notes.trim() || undefined,
    })

    setAmount("")
    setNotes("")
    setDate(new Date().toISOString().split("T")[0])
    setError(null)
    onOpenChange(false)
  }

  const handleClose = (value: boolean) => {
    if (!value) {
      setError(null)
      setAmount("")
      setNotes("")
      setDate(new Date().toISOString().split("T")[0])
    }
    onOpenChange(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {loan
              ? `Apply a payment to ${loan.name}. Remaining balance: ${formatCurrency(loan.remainingBalance)}.`
              : "Select a loan to record a payment."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="payment-amount">Amount (₱)</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date">Date</Label>
            <Input
              id="payment-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Notes (optional)</Label>
            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Reference number, confirmation, etc."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!loan}>
              Save Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

