import type { LucideIcon } from 'lucide-react'
import { AppCard } from '@/components/shared/AppCard'

interface PageHeaderProps {
  title: string
  description: string
  icon: LucideIcon
  children?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-100">
            <Icon className="h-7 w-7 text-brand-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1 text-slate-600">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

interface PlaceholderGridProps {
  items: { title: string; value: string; description: string }[]
}

export function PlaceholderGrid({ items }: PlaceholderGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <AppCard key={item.title} variant="gradient">
          <p className="text-sm font-medium text-slate-500">{item.title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
          <p className="mt-2 text-sm text-slate-600">{item.description}</p>
        </AppCard>
      ))}
    </div>
  )
}
