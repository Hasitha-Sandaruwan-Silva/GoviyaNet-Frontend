import { Sprout, Package, ClipboardList, ArrowRight, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { PageHeader } from '@/components/layout/PageHeader'
import { getWelcomeMessage } from '@/lib/navigation'
import { farmerApi } from '@/api/farmer.api'
import { buyerApi } from '@/api/buyer.api'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { StatsGridSkeleton } from '@/components/shared/SkeletonLoaders'
import type { Farmer, Produce, Order } from '@/types'

export function FarmerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const name = user?.fullName?.split(' ')[0] ?? 'Farmer'

  // Get farmer profile
  const { data: farmer, isLoading: farmerLoading, error: farmerError } = useQuery<Farmer>({
    queryKey: ['farmer', user?.id],
    queryFn: () => farmerApi.getByUserId(user!.id),
    enabled: !!user?.id,
    retry: false,
  })

  // Get produce list
  const { data: produce = [], isLoading: produceLoading } = useQuery<Produce[]>({
    queryKey: ['produce', farmer?.id],
    queryFn: () => farmerApi.getProduceByFarmer(farmer!.id),
    enabled: !!farmer?.id,
  })

  // Get orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['orders', farmer?.id],
    queryFn: () => buyerApi.getOrdersByFarmer(farmer!.id),
    enabled: !!farmer?.id,
  })

  const isLoading = farmerLoading || (!!farmer?.id && (produceLoading || ordersLoading))

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Farmer Dashboard"
          description={getWelcomeMessage('FARMER', name)}
          icon={Sprout}
        />
        <div className="space-y-6">
          <StatsGridSkeleton />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </>
    )
  }

  if (farmerError || (!farmerLoading && !farmer)) {
    return (
      <>
        <PageHeader
          title="Farmer Dashboard"
          description={getWelcomeMessage('FARMER', name)}
          icon={Sprout}
        />
        <AppCard className="border-amber-200 bg-amber-50/50">
          <EmptyState
            icon={User}
            title="Register your farm"
            description="You need to complete your farm registration before accessing the dashboard."
            actionLabel="Register Farm Profile"
            onAction={() => window.location.href = '/farmer/profile'}
          />
        </AppCard>
      </>
    )
  }

  // Calculate active orders
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'DISPATCHED'
  ).length

  // Calculate monthly revenue
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const thisMonthRevenue = orders
    .filter((o) => {
      if (o.status !== 'DELIVERED' || !o.orderedAt) return false
      const orderDate = new Date(o.orderedAt)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    })
    .reduce((sum, o) => sum + (o.totalPrice || o.quantity * o.pricePerKg!), 0)

  // Recent active orders preview
  const recentOrders = orders
    .filter((o) => o.status !== 'CANCELLED')
    .slice(0, 3)

  return (
    <>
      <PageHeader
        title="Farmer Dashboard"
        description={getWelcomeMessage('FARMER', name)}
        icon={Sprout}
      />

      {/* Profile summary banner */}
      <AppCard variant="gradient" className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{farmer?.farmName}</h2>
            <p className="text-sm text-slate-500">{farmer?.location} District · Registered Farm</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Verification Status:</span>
            <StatusBadge status={farmer?.verified ? 'VERIFIED' : 'PENDING_VERIFICATION'} />
          </div>
        </div>
      </AppCard>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Products</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{produce.length}</p>
              <p className="mt-1 text-xs text-slate-400">Listed produce items</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <Button asChild variant="link" className="mt-3 h-auto p-0 text-emerald-600 hover:text-emerald-700">
            <Link to="/farmer/produce" className="inline-flex items-center gap-1 text-sm font-medium">
              Manage Produce <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </AppCard>

        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Orders</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{activeOrdersCount}</p>
              <p className="mt-1 text-xs text-slate-400">Orders in progress</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <ClipboardList className="h-6 w-6" />
            </div>
          </div>
          <Button asChild variant="link" className="mt-3 h-auto p-0 text-amber-600 hover:text-amber-700">
            <Link to="/farmer/orders" className="inline-flex items-center gap-1 text-sm font-medium">
              View Orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </AppCard>

        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">This Month Revenue</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">LKR {thisMonthRevenue.toLocaleString()}</p>
              <p className="mt-1 text-xs text-slate-400">Delivered revenue</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Sprout className="h-6 w-6" />
            </div>
          </div>
          <Button asChild variant="link" className="mt-3 h-auto p-0 text-blue-600 hover:text-blue-700">
            <Link to="/farmer/orders" className="inline-flex items-center gap-1 text-sm font-medium">
              View History <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </AppCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <AppCard>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/farmer/produce" className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <Package className="h-6 w-6 text-brand-600 group-hover:scale-105 transition-transform" />
              <h4 className="mt-2 font-medium text-slate-950">Add Produce</h4>
              <p className="text-xs text-slate-500 mt-1">List new crops or update stocks.</p>
            </Link>
            <Link to="/farmer/orders" className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <ClipboardList className="h-6 w-6 text-brand-600 group-hover:scale-105 transition-transform" />
              <h4 className="mt-2 font-medium text-slate-950">Check Orders</h4>
              <p className="text-xs text-slate-500 mt-1">Confirm or dispatch pending orders.</p>
            </Link>
            <Link to="/farmer/profile" className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <User className="h-6 w-6 text-brand-600 group-hover:scale-105 transition-transform" />
              <h4 className="mt-2 font-medium text-slate-950">Farm Profile</h4>
              <p className="text-xs text-slate-500 mt-1">Update district, NIC, and credentials.</p>
            </Link>
            <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-4 flex flex-col justify-center items-center text-center">
              <Sprout className="h-6 w-6 text-slate-400" />
              <p className="text-xs text-slate-400 mt-1">New features coming soon.</p>
            </div>
          </div>
        </AppCard>

        {/* Recent Orders */}
        <AppCard>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <ClipboardList className="h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No recent orders yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-slate-900">{order.produce?.name || `Produce #${order.produceId}`}</p>
                    <p className="text-xs text-slate-500">{order.quantity} kg · LKR {(order.totalPrice || order.quantity * order.pricePerKg!).toFixed(0)}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
            </div>
          )}
        </AppCard>
      </div>
    </>
  )
}
