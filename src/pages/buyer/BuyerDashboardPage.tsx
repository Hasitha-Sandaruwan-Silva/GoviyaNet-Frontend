import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { PageHeader, PlaceholderGrid } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { getWelcomeMessage } from '@/lib/navigation'
import { buyerApi } from '@/api/buyer.api'

export function BuyerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const name = user?.fullName?.split(' ')[0] ?? 'there'

  // Get cart items
  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => buyerApi.getCart(user!.id),
    enabled: !!user?.id,
  })

  // Get orders
  const { data: orders = [] } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => buyerApi.getOrdersByBuyer(user!.id),
    enabled: !!user?.id,
  })

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'DISPATCHED'
  ).length

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
          { title: 'Cart Items', value: String(cartItems.length), description: 'Items ready to checkout' },
          { title: 'Active Orders', value: String(activeOrdersCount), description: 'In progress deliveries' },
          { title: 'Total Orders', value: String(orders.length), description: 'All time orders' },
        ]}
      />
    </>
  )
}
