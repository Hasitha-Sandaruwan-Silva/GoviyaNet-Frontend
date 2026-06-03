import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'

export function BuyerOrdersPage() {
  return (
    <>
      <PageHeader
        title="My Orders"
        description="Track all your orders from farm to doorstep."
        icon={ClipboardList}
      />
      <AppCard>
        <p className="text-slate-600">
          Time to make your first order! Order cards with visual trackers will appear here.
        </p>
      </AppCard>
    </>
  )
}
