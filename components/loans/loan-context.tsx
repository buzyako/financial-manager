"use client"

import type { ReactNode } from "react"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { Loan, LoanPayment } from "@/lib/types"
import { StorageManager } from "@/lib/storage"

interface LoanContextValue {
  loans: Loan[]
  payments: LoanPayment[]
  loading: boolean
  addLoan: (loan: Omit<Loan, "id" | "createdAt" | "updatedAt" | "remainingBalance">) => void
  updateLoan: (loan: Loan) => void
  deleteLoan: (loanId: string) => void
  addPayment: (payment: Omit<LoanPayment, "id">) => void
  refresh: () => void
}

const LoanContext = createContext<LoanContextValue | undefined>(undefined)

export function LoanProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>([])
  const [payments, setPayments] = useState<LoanPayment[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    setLoading(true)
    const allLoans = StorageManager.listLoans()
    const allPayments = StorageManager.listLoanPayments()
    setLoans(allLoans)
    setPayments(allPayments)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleAddLoan = (loan: Omit<Loan, "id" | "createdAt" | "updatedAt" | "remainingBalance">) => {
    StorageManager.createLoan(loan)
    refresh()
  }

  const handleUpdateLoan = (loan: Loan) => {
    StorageManager.updateLoan(loan)
    refresh()
  }

  const handleDeleteLoan = (loanId: string) => {
    StorageManager.deleteLoan(loanId)
    refresh()
  }

  const handleAddPayment = (payment: Omit<LoanPayment, "id">) => {
    StorageManager.addLoanPayment(payment)
    refresh()
  }

  const value = useMemo(
    () => ({
      loans,
      payments,
      loading,
      addLoan: handleAddLoan,
      updateLoan: handleUpdateLoan,
      deleteLoan: handleDeleteLoan,
      addPayment: handleAddPayment,
      refresh,
    }),
    [loans, payments, loading],
  )

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>
}

export function useLoans(): LoanContextValue {
  const context = useContext(LoanContext)
  if (!context) {
    throw new Error("useLoans must be used within a LoanProvider")
  }
  return context
}

