import { Sprout } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { PageHeader, PlaceholderGrid } from '@/components/layout/PageHeader'
import { getWelcomeMessage } from '@/lib/navigation'

export function FarmerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const name = user?.fullName?.split(' ')[0] ?? 'Farmer'

  return (
    <>
      <PageHeader
        title="Farmer Dashboard"
        description={getWelcomeMessage('FARMER', name)}
        icon={Sprout}
      />
      <PlaceholderGrid
        items={[
          { title: 'Total Products', value: '—', description: 'Listed produce items' },
          { title: 'Active Orders', value: '—', description: 'Orders awaiting action' },
          { title: 'This Month', value: '—', description: 'Revenue (LKR)' },
          { title: 'Rating', value: '—', description: 'Average buyer rating' },
        ]}
      />
    </>
  )
}
