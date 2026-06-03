import { Sprout } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { PageHeader, PlaceholderGrid } from '@/components/layout/PageHeader'
import { getWelcomeMessage } from '@/lib/navigation'
import { farmerApi } from '@/api/farmer.api'
import { buyerApi } from '@/api/buyer.api'
import type { Farmer, Produce, Order } from '@/types'

export function FarmerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const name = user?.fullName?.split(' ')[0] ?? 'Farmer'

  // Get farmer profile
  const { data: farmer, isLoading: farmerLoading } = useQuery<Farmer>({
    queryKey: ['farmer', user?.id],
    queryFn: () => farmerApi.getByUserId(user!.id),
    enabled: !!user?.id,
    retry: false,
  })

  // Get produce list
  const { data: produce = [] } = useQuery<Produce[]>({
    queryKey: ['produce', farmer?.id],
    queryFn: () => farmerApi.getProduceByFarmer(farmer!.id),
    enabled: !!farmer?.id,
  })

  // Get orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders', farmer?.id],
    queryFn: () => buyerApi.getOrdersByFarmer(farmer!.id),
    enabled: !!farmer?.id,
  })

  // Calculate active orders (PENDING + CONFIRMED)
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
  ).length

  // Calculate this month revenue (DELIVERED orders from this month)
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const thisMonthRevenue = orders
    .filter((o) => {
      if (o.status !== 'DELIVERED' || !o.orderedAt) return false
      const orderDate = new Date(o.orderedAt)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    })
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0)

  const isLoading = farmerLoading

  const items = [
    { title: 'Total Products', value: String(produce.length), description: 'Listed produce items' },
    { title: 'Active Orders', value: String(activeOrdersCount), description: 'Orders awaiting action' },
    { title: 'This Month', value: `LKR ${thisMonthRevenue.toFixed(0)}`, description: 'Revenue (LKR)' },
    { title: 'Rating', value: '—', description: 'Average buyer rating' },
  ]

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Farmer Dashboard"
          description={getWelcomeMessage('FARMER', name)}
          icon={Sprout}
        />
        <div className="text-center text-slate-500">Loading dashboard...</div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Farmer Dashboard"
        description={getWelcomeMessage('FARMER', name)}
        icon={Sprout}
      />
      <PlaceholderGrid items={items} />
    </>
  )
}
