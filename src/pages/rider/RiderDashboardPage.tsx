import { Bike } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { PageHeader, PlaceholderGrid } from '@/components/layout/PageHeader'
import { getWelcomeMessage } from '@/lib/navigation'
import { AppCard } from '@/components/shared/AppCard'

export function RiderDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const name = user?.fullName?.split(' ')[0] ?? 'Rider'

  return (
    <>
      <PageHeader
        title="Rider Dashboard"
        description={getWelcomeMessage('RIDER', name)}
        icon={Bike}
      />
      <AppCard className="mb-6" variant="gradient">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">You are offline</p>
            <p className="text-sm text-slate-600">Go online to receive delivery requests</p>
          </div>
          <div className="h-8 w-14 rounded-full bg-slate-200" />
        </div>
      </AppCard>
      <PlaceholderGrid
        items={[
          { title: "Today's Deliveries", value: '0', description: 'Completed today' },
          { title: 'This Week', value: '—', description: 'Earnings (LKR)' },
          { title: 'Rating', value: '—', description: 'Customer rating' },
        ]}
      />
    </>
  )
}
