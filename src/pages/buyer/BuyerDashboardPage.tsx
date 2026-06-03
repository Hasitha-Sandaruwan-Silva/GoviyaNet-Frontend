import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { PageHeader, PlaceholderGrid } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { getWelcomeMessage } from '@/lib/navigation'

export function BuyerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const name = user?.fullName?.split(' ')[0] ?? 'there'

  return (
    <>
      <PageHeader
        title="Buyer Dashboard"
        description={getWelcomeMessage('BUYER', name)}
        icon={ShoppingBag}
      >
        <Button asChild>
          <Link to="/buyer/browse">Browse Produce</Link>
        </Button>
      </PageHeader>
      <PlaceholderGrid
        items={[
          { title: 'Cart Items', value: '0', description: 'Items ready to checkout' },
          { title: 'Active Orders', value: '—', description: 'In progress deliveries' },
          { title: 'Favorites', value: '—', description: 'Saved produce' },
        ]}
      />
    </>
  )
}
