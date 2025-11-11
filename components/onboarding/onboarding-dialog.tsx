"use client"

import Link from "next/link"
import { CheckCircle2, Circle, Rocket } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { OnboardingStepKey } from "@/lib/types"

export const onboardingStepMeta: Record<
  OnboardingStepKey,
  { label: string; description: string; href: string; cta: string }
> = {
  accountBalance: {
    label: "Set your starting balance",
    description: "Update your current account balance in Settings.",
    href: "/settings",
    cta: "Go to Settings",
  },
  transaction: {
    label: "Record your first transaction",
    description: "Add an income or expense to start tracking cash flow.",
    href: "/transactions?action=add-expense",
    cta: "Add Transaction",
  },
  budget: {
    label: "Create a budget",
    description: "Set a monthly budget limit to monitor spending.",
    href: "/budgets",
    cta: "Create Budget",
  },
  goal: {
    label: "Set a savings goal",
    description: "Plan for the future by creating your first savings goal.",
    href: "/goals",
    cta: "Create Goal",
  },
}

interface OnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  steps: Record<OnboardingStepKey, boolean>
  onDismiss: () => void
}

export function OnboardingDialog({ open, onOpenChange, steps, onDismiss }: OnboardingDialogProps) {
  const completedCount = Object.values(steps).filter(Boolean).length
  const totalSteps = Object.keys(steps).length
  const allCompleted = completedCount === totalSteps

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Rocket className="h-5 w-5" />
            <p className="text-sm font-medium uppercase tracking-wide">Welcome</p>
          </div>
          <DialogTitle>Let&apos;s get your workspace ready</DialogTitle>
          <DialogDescription>
            Complete these quick steps to unlock the full Finance Manager experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{completedCount}</span> of{" "}
            <span className="font-medium text-foreground">{totalSteps}</span> tasks completed
          </div>

          <div className="space-y-3">
            {(Object.keys(steps) as OnboardingStepKey[]).map((key) => {
              const meta = onboardingStepMeta[key]
              const completed = steps[key]
              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-lg border border-border bg-background px-4 py-3 transition hover:border-primary/30",
                    completed && "bg-primary/5 border-primary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-1 items-start gap-3">
                      {completed ? (
                        <CheckCircle2 className="mt-1 h-5 w-5 text-primary" aria-hidden />
                      ) : (
                        <Circle className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{meta.label}</p>
                        <p className="text-sm text-muted-foreground">{meta.description}</p>
                      </div>
                    </div>
                    <Button variant={completed ? "ghost" : "outline"} size="sm" asChild>
                      <Link href={meta.href}>{meta.cta}</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={onDismiss}>
            {allCompleted ? "Close" : "Skip for now"}
          </Button>
          <Button onClick={() => onOpenChange(false)} disabled={!allCompleted}>
            {allCompleted ? "Finish onboarding" : "Continue later"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

