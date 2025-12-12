import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: LucideIcon
  iconColor?: string
}

export function StatCard({ title, value, change, trend, icon: Icon, iconColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="bg-card border-0 shadow-none">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                {trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
                <span className={cn("text-sm", trend === "up" ? "text-success" : "text-destructive")}>{change}</span>
              </div>
            )}
          </div>
          <div className={cn("w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center", iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
