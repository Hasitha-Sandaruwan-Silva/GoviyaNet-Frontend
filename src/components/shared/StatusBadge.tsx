import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_COLORS, DELIVERY_STATUS_COLORS } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
  icon?: LucideIcon
  className?: string
}

export function StatusBadge({ status, icon: Icon, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase()
  
  let colorClass = 'bg-slate-100 text-slate-700'
  
  if (normalized in ORDER_STATUS_COLORS) {
    colorClass = ORDER_STATUS_COLORS[normalized as keyof typeof ORDER_STATUS_COLORS] ?? 'bg-slate-100 text-slate-700'
  } else if (normalized in DELIVERY_STATUS_COLORS) {
    colorClass = DELIVERY_STATUS_COLORS[normalized] ?? 'bg-slate-100 text-slate-700'
  } else if (normalized === 'ACTIVE' || normalized === 'VERIFIED') {
    colorClass = 'bg-green-100 text-green-700'
  } else if (normalized === 'INACTIVE' || normalized === 'UNVERIFIED' || normalized === 'PENDING_VERIFICATION') {
    colorClass = 'bg-amber-100 text-amber-700'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize transition-colors',
        colorClass,
        className,
      )}
    >
      {Icon ? <Icon className="h-3 w-3" /> : null}
      {status.toLowerCase().replace(/_/g, ' ')}
    </span>
  )
}
