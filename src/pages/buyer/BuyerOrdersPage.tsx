import { useState } from 'react'
import { ClipboardList, XCircle, Bike, Phone, MapPin, Clock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ListSkeleton } from '@/components/shared/SkeletonLoaders'
import { StepProgress } from '@/components/shared/StepProgress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buyerApi } from '@/api/buyer.api'
import { farmerApi } from '@/api/farmer.api'
import { deliveryApi } from '@/api/delivery.api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError, cn } from '@/lib/utils'
import type { Order, Delivery, Rider } from '@/types'

function getOrderStep(status: string): number {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 1
    case 'CONFIRMED':
      return 2
    case 'DISPATCHED':
      return 3
    case 'DELIVERED':
      return 5
    default:
      return 1
  }
}

const ORDER_STEPS = ['Pending', 'Confirmed', 'Dispatched', 'Delivered']

export function BuyerOrdersPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()

  // Load orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', user?.id],
    queryFn: () => buyerApi.getOrdersByBuyer(user!.id),
    enabled: !!user?.id,
  })

  // Load all deliveries (so we can match by orderId)
  const { data: allDeliveries = [] } = useQuery<Delivery[]>({
    queryKey: ['deliveries', 'all'],
    queryFn: () => deliveryApi.getAllDeliveries(),
    enabled: !!user?.id,
  })

  // Load all riders (so we can show rider details)
  const { data: allRiders = [] } = useQuery<Rider[]>({
    queryKey: ['riders'],
    queryFn: () => deliveryApi.getRiders(),
    enabled: !!user?.id,
  })

  // Helper: get delivery + rider info for a specific order
  const getDeliveryInfo = (orderId: number) => {
    const delivery = allDeliveries.find((d) => d.orderId === orderId)
    if (!delivery) return null
    const rider = allRiders.find((r) => r.id === delivery.riderId)
    return { delivery, rider }
  }

  const [activeTab, setActiveTab] = useState('active')

  // Cancel order mutation
  const cancelOrder = useMutation({
    mutationFn: async (order: Order) => {
      await buyerApi.cancelOrder(order.id)

      const produceList = await farmerApi.getProduceByFarmer(order.farmerId)
      const produce = produceList.find((p) => p.id === order.produceId)
      if (produce) {
        await farmerApi.updateStock(produce.id, produce.stockKg + order.quantity)
        void queryClient.invalidateQueries({ queryKey: ['available-produce'] })
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order cancelled', 'Your order has been cancelled.')
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="My Orders"
          description="Track all your orders from farm to doorstep."
          icon={ClipboardList}
        />
        <ListSkeleton count={3} />
      </>
    )
  }

  if (orders.length === 0) {
    return (
      <>
        <PageHeader
          title="My Orders"
          description="Track all your orders from farm to doorstep."
          icon={ClipboardList}
        />
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Time to make your first order! Order cards with visual trackers will appear here."
          actionLabel="Browse Produce"
          onAction={() => (window.location.href = '/buyer/browse')}
        />
      </>
    )
  }

  // Sort orders: active first, completed/cancelled last
  const statusOrder = {
    PENDING: 1,
    CONFIRMED: 2,
    DISPATCHED: 3,
    DELIVERED: 4,
    CANCELLED: 5,
  }

  const sortedOrders = [...orders].sort((a, b) => {
    const scoreA = statusOrder[a.status as keyof typeof statusOrder] ?? 99
    const scoreB = statusOrder[b.status as keyof typeof statusOrder] ?? 99
    return scoreA - scoreB
  })

  const activeOrders = sortedOrders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'DISPATCHED'].includes(o.status)
  )
  const completedOrders = sortedOrders.filter((o) => o.status === 'DELIVERED')
  const cancelledOrders = sortedOrders.filter((o) => o.status === 'CANCELLED')

  // ── Delivery Info Card (inside each order) ─────────────────────────────
  const renderDeliveryInfo = (order: Order) => {
    if (order.status === 'CANCELLED' || order.status === 'PENDING') return null

    const info = getDeliveryInfo(order.id)

    // No rider yet
    if (!info) {
      return (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
            <p className="text-sm font-semibold text-amber-800">
              Waiting for a rider to accept...
            </p>
          </div>
          <p className="mt-1 text-xs text-amber-700">
            Your order is confirmed. We'll notify you once a rider is assigned.
          </p>
        </div>
      )
    }

    const { delivery, rider } = info

    return (
      <div className="mt-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
              <Bike className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Rider Assigned</p>
              <p className="text-xs text-blue-700">Your order is on the way</p>
            </div>
          </div>
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
              delivery.status === 'DELIVERED'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
            )}
          >
            {delivery.status?.toLowerCase().replace(/_/g, ' ')}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Rider Info */}
          <div className="rounded-lg bg-white/70 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Rider
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {rider?.fullName || 'Unknown'}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600">
              {rider?.vehicleType && (
                <span className="flex items-center gap-1">
                  <Bike className="h-3 w-3" />
                  {rider.vehicleType.replace(/_/g, ' ')}
                </span>
              )}
              {rider?.phone && (
                <a
                  href={`tel:${rider.phone}`}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {rider.phone}
                </a>
              )}
            </div>
          </div>

          {/* Delivery Fee */}
          <div className="rounded-lg bg-white/70 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Delivery Fee
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900">
              LKR {delivery.deliveryFee?.toFixed(2) ?? '—'}
            </p>
            {rider?.currentLocation && (
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                <MapPin className="h-3 w-3" />
                {rider.currentLocation}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderOrderList = (list: Order[]) => {
    if (list.length === 0) {
      return (
        <EmptyState
          icon={ClipboardList}
          title="No orders"
          description="There are no orders in this category."
        />
      )
    }

    return (
      <div className="space-y-4">
        {list.map((order) => (
          <AppCard key={order.id} variant="default">
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      {order.produce?.name || `Produce ${order.produceId}`}
                    </h3>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      Quantity:{' '}
                      <span className="font-medium text-slate-900">
                        {order.quantity} kg
                      </span>
                    </div>
                    <div>
                      Total:{' '}
                      <span className="font-medium text-slate-900">
                        LKR{' '}
                        {(
                          order.totalPrice || order.quantity * order.pricePerKg!
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      Delivery:{' '}
                      <span className="font-medium text-slate-900">
                        {order.deliveryAddress}
                      </span>
                    </div>
                    {order.orderedAt && (
                      <div>
                        Ordered:{' '}
                        <span className="font-medium text-slate-900">
                          {new Date(order.orderedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {order.status === 'PENDING' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelOrder.mutate(order)}
                    disabled={cancelOrder.isPending}
                    className="gap-2 shrink-0"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>

              {/* ✅ Delivery / Rider Info */}
              {renderDeliveryInfo(order)}

              {/* Progress Tracker */}
              {order.status !== 'CANCELLED' && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">
                    Delivery Track
                  </p>
                  <StepProgress
                    steps={ORDER_STEPS}
                    currentStep={getOrderStep(order.status)}
                    className="max-w-xl"
                  />
                </div>
              )}
            </div>
          </AppCard>
        ))}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="My Orders"
        description="Track all your orders from farm to doorstep."
        icon={ClipboardList}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="active">{renderOrderList(activeOrders)}</TabsContent>
        <TabsContent value="completed">
          {renderOrderList(completedOrders)}
        </TabsContent>
        <TabsContent value="cancelled">
          {renderOrderList(cancelledOrders)}
        </TabsContent>
      </Tabs>
    </>
  )
}