import { TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'

export function BuyerPricesPage() {
  return (
    <>
      <PageHeader
        title="Market Prices"
        description="Compare regional prices and trends across Sri Lanka."
        icon={TrendingUp}
      />
      <AppCard variant="glass">
        <p className="text-slate-600">
          Price comparison cards and Recharts trend graphs will load from{' '}
          <code className="rounded bg-slate-100 px-1 text-sm">/api/prices</code>.
        </p>
      </AppCard>
    </>
  )
}
