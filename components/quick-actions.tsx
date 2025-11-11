import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Target, Plus, Landmark } from "lucide-react"

export default function QuickActions() {
  return (
    <Card className="card-premium p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Link href="/transactions?type=expense">
          <Button
            variant="outline"
            className="w-full btn-premium flex items-center gap-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 bg-transparent"
          >
            <TrendingDown className="w-4 h-4" />
            Add Expense
          </Button>
        </Link>
        <Link href="/transactions?type=income">
          <Button
            variant="outline"
            className="w-full btn-premium flex items-center gap-2 hover:bg-accent/5 hover:text-accent hover:border-accent/30 bg-transparent"
          >
            <TrendingUp className="w-4 h-4" />
            Add Income
          </Button>
        </Link>
        <Link href="/budgets">
          <Button
            variant="outline"
            className="w-full btn-premium flex items-center gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 bg-transparent"
          >
            <Target className="w-4 h-4" />
            Budget
          </Button>
        </Link>
        <Link href="/goals">
          <Button
            variant="outline"
            className="w-full btn-premium flex items-center gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 bg-transparent"
          >
            <Plus className="w-4 h-4" />
            Goal
          </Button>
        </Link>
        <Link href="/loans">
          <Button
            variant="outline"
            className="w-full btn-premium flex items-center gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/30 bg-transparent"
          >
            <Landmark className="w-4 h-4" />
            Loan
          </Button>
        </Link>
      </div>
    </Card>
  )
}
