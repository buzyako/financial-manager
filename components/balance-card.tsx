import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils-finance"
import { TrendingUp } from "lucide-react"

interface BalanceCardProps {
  balance: number
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <Card className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Account Balance</p>
          <h2 className="text-4xl font-bold text-foreground">{formatCurrency(balance)}</h2>
        </div>
        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-accent" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Your total available funds</p>
    </Card>
  )
}
