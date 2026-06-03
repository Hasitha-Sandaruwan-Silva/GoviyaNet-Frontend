import { ClipboardList } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'

export function FarmerOrdersPage() {
  return (
    <>
      <PageHeader
        title="Orders"
        description="View and update orders from buyers."
        icon={ClipboardList}
      />
      <AppCard>
        <p className="text-slate-600">
          Order cards with status timelines (Pending → Confirmed → Dispatched → Delivered) will
          load from your farmer orders API.
        </p>
      </AppCard>
    </>
  )
}
