import { MapPin } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'

export function RiderDeliveriesPage() {
  return (
    <>
      <PageHeader
        title="Deliveries"
        description="Active and available delivery assignments."
        icon={MapPin}
      />
      <AppCard>
        <p className="text-slate-600">
          Nearby pending deliveries with pickup/drop addresses will load from the delivery API.
        </p>
      </AppCard>
    </>
  )
}
