import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-6', className)}>
      <Skeleton className="mb-4 h-40 w-full rounded-xl" />
      <Skeleton className="mb-2 h-5 w-3/4" />
      <Skeleton className="mb-4 h-4 w-1/2" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 py-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  )
}

export function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
          <Skeleton className="mb-4 h-10 w-10 rounded-xl" />
          <Skeleton className="mb-2 h-8 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
