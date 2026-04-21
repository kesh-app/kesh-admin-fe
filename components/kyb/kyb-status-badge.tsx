import { Badge } from "@/components/ui/badge"
import { cn } from "@/libs/utils"

interface KYBStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected'
  className?: string
}

export default function KYBStatusBadge({ status, className }: KYBStatusBadgeProps) {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    approved: "bg-green-100 text-green-800 hover:bg-green-100/80 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    rejected: "bg-red-100 text-red-800 hover:bg-red-100/80 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("capitalize font-medium px-2.5 py-0.5 rounded-full", statusStyles[status], className)}
    >
      {status}
    </Badge>
  )
}
