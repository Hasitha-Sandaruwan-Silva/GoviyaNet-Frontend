import { ShoppingBag, ShoppingCart, ClipboardList, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { getWelcomeMessage } from '@/lib/navigation'
import { buyerApi } from '@/api/buyer.api'
import { AppCard } from '@/components/shared/AppCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StatsGridSkeleton } from '@/components/shared/SkeletonLoaders'
import type { Order } from '@/types'

export function BuyerDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const name = user?.fullName?.split(' ')[0] ?? 'there'

  // Get cart items
  const { data: cartItems = [], isLoading: cartLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => buyerApi.getCart(user!.id),
    enabled: !!user?.id,
  })

  // Get orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['orders', user?.id],
    queryFn: () => buyerApi.getOrdersByBuyer(user!.id),
    enabled: !!user?.id,
  })

  const isLoading = cartLoading || ordersLoading

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Buyer Dashboard"
          description={getWelcomeMessage('BUYER', name)}
          icon={ShoppingBag}
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

  const activeOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'DISPATCHED'
  )
  const activeOrdersCount = activeOrders.length
  const recentOrders = orders.slice(0, 3)

  return (
    <>
      <PageHeader
        title="Buyer Dashboard"
        description={getWelcomeMessage('BUYER', name)}
        icon={ShoppingBag}
      >
        <Button asChild>
          <Link to="/buyer/browse" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Browse Produce
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Cart Items</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{cartItems.length}</p>
              <p className="mt-1 text-xs text-slate-400">Items ready to checkout</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </div>
          <Button asChild variant="link" className="mt-3 h-auto p-0 text-emerald-600 hover:text-emerald-700">
            <Link to="/buyer/cart" className="inline-flex items-center gap-1 text-sm font-medium">
              View Cart <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </AppCard>

        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Orders</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{activeOrdersCount}</p>
              <p className="mt-1 text-xs text-slate-400">In progress deliveries</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <ClipboardList className="h-6 w-6" />
            </div>
          </div>
          <Button asChild variant="link" className="mt-3 h-auto p-0 text-amber-600 hover:text-amber-700">
            <Link to="/buyer/orders" className="inline-flex items-center gap-1 text-sm font-medium">
              Track Orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </AppCard>

        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{orders.length}</p>
              <p className="mt-1 text-xs text-slate-400">All-time order history</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </div>
          <Button asChild variant="link" className="mt-3 h-auto p-0 text-blue-600 hover:text-blue-700">
            <Link to="/buyer/orders" className="inline-flex items-center gap-1 text-sm font-medium">
              Order History <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </AppCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <AppCard>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/buyer/browse" className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <ShoppingBag className="h-6 w-6 text-brand-600 group-hover:scale-105 transition-transform" />
              <h4 className="mt-2 font-medium text-slate-950">Marketplace</h4>
              <p className="text-xs text-slate-500 mt-1">Shop fresh produce directly from farmers.</p>
            </Link>
            <Link to="/buyer/cart" className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <ShoppingCart className="h-6 w-6 text-brand-600 group-hover:scale-105 transition-transform" />
              <h4 className="mt-2 font-medium text-slate-950">Shopping Cart</h4>
              <p className="text-xs text-slate-500 mt-1">Checkout items in your cart.</p>
            </Link>
            <Link to="/buyer/orders" className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <ClipboardList className="h-6 w-6 text-brand-600 group-hover:scale-105 transition-transform" />
              <h4 className="mt-2 font-medium text-slate-950">Track Orders</h4>
              <p className="text-xs text-slate-500 mt-1">Check the delivery status of your orders.</p>
            </Link>
            <Link to="/buyer/prices" className="group rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
              <TrendingUp className="h-6 w-6 text-brand-600 group-hover:scale-105 transition-transform" />
              <h4 className="mt-2 font-medium text-slate-950">Market Prices</h4>
              <p className="text-xs text-slate-500 mt-1">Compare prices before buying.</p>
            </Link>
          </div>
        </AppCard>

        {/* Recent Orders */}
        <AppCard>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <ClipboardList className="h-10 w-10 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No orders placed yet.</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to="/buyer/browse">Shop Now</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-slate-900">{order.produce?.name || `Produce #${order.produceId}`}</p>
                    <p className="text-xs text-slate-500">
                      {order.quantity} kg · LKR {(order.totalPrice || order.quantity * order.pricePerKg!).toFixed(0)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              ))}
              <div className="pt-2 text-center">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/buyer/orders">View All Orders</Link>
                </Button>
              </div>
            </div>
          )}
        </AppCard>
      </div>
    </>
  )
}
