import { TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'

export function AdminPricesPage() {
  return (
    <>
      <PageHeader
        title="Manage Prices"
        description="Record and update market price data by category and region."
        icon={TrendingUp}
      />
      <AppCard>
        <p className="mb-4 text-slate-600">POST new price records to the price service API.</p>
        <Button>Add Price Record</Button>
      </AppCard>
    </>
  )
}
