import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, change, icon: Icon, trend = 'neutral' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
            {change && (
              <p className={`text-xs mt-2 ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {change}
              </p>
            )}
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
