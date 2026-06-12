import { useState } from 'react'
import { ClipboardList, CheckCircle, Truck, XCircle, Bike, Phone, MapPin, Clock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ListSkeleton } from '@/components/shared/SkeletonLoaders'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { farmerApi } from '@/api/farmer.api'
import { buyerApi } from '@/api/buyer.api'
import { deliveryApi } from '@/api/delivery.api'
import { notificationApi } from '@/api/notification.api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError, cn } from '@/lib/utils'
import type { Farmer, Order, Delivery, Rider } from '@/types'

export function FarmerOrdersPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()

  // Get farmer profile
  const { data: farmer, isLoading: farmerLoading } = useQuery<Farmer>({
    queryKey: ['farmer', user?.id],
    queryFn: () => farmerApi.getByUserId(user!.id),
    enabled: !!user?.id,
    retry: false,
  })

  // Get orders by farmer
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['orders', farmer?.id],
    queryFn: () => buyerApi.getOrdersByFarmer(farmer!.id),
    enabled: !!farmer?.id,
  })

  // Load all deliveries (match by orderId)
  const { data: allDeliveries = [] } = useQuery<Delivery[]>({
    queryKey: ['deliveries', 'all'],
    queryFn: () => deliveryApi.getAllDeliveries(),
    enabled: !!farmer?.id,
  })

  // Load all riders
  const { data: allRiders = [] } = useQuery<Rider[]>({
    queryKey: ['riders'],
    queryFn: () => deliveryApi.getRiders(),
    enabled: !!farmer?.id,
  })

  // Helper: get delivery + rider info for an order
  const getDeliveryInfo = (orderId: number) => {
    const delivery = allDeliveries.find((d) => d.orderId === orderId)
    if (!delivery) return null
    const rider = allRiders.find((r) => r.id === delivery.riderId)
    return { delivery, rider }
  }

  const [activeTab, setActiveTab] = useState('active')

  // ✅ UPDATE STATUS MUTATION
  const updateStatus = useMutation({
    mutationFn: async (data: {
      order: Order
      status: 'CONFIRMED' | 'DISPATCHED' | 'CANCELLED'
    }) => {
      const { order, status } = data

      await buyerApi.updateOrderStatus(order.id, { status })

      if (status === 'CANCELLED') {
        const produceList = await farmerApi.getProduceByFarmer(farmer!.id)
        const produce = produceList.find((p) => p.id === order.produceId)
        if (produce) {
          await farmerApi.updateStock(produce.id, produce.stockKg + order.quantity)
          void queryClient.invalidateQueries({ queryKey: ['available-produce'] })
        }
      } else if (status === 'CONFIRMED') {
        // Notify Buyer
        await notificationApi.createNotification({
          userId: order.buyerId,
          userRole: 'BUYER',
          type: 'ORDER_CONFIRMED',
          title: 'Order Confirmed!',
          message: `Your order #${order.id} for ${order.produce?.name} has been confirmed.`,
          referenceId: order.id,
          referenceType: 'ORDER',
        })

        // Notify Farmer (self)
        await notificationApi.createNotification({
          userId: farmer!.userId,
          userRole: 'FARMER',
          type: 'ORDER_CONFIRMED',
          title: 'You Confirmed an Order',
          message: `You have confirmed order #${order.id}. Please prepare it for pickup.`,
          referenceId: order.id,
          referenceType: 'ORDER',
        })

        // Notify all available Riders
        const riders = await deliveryApi.getRiders()
        const availableRiders = riders.filter((r) => r.available)
        for (const rider of availableRiders) {
          await notificationApi.createNotification({
            userId: rider.userId,
            userRole: 'RIDER',
            type: 'SYSTEM',
            title: 'New Delivery Available',
            message: `A new order (#${order.id}) is available for pickup.`,
            referenceId: order.id,
            referenceType: 'ORDER',
          })
        }
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Status updated', 'Order status has been updated successfully.')
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  const isLoading = farmerLoading || ordersLoading

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Orders"
          description="View and update orders from buyers."
          icon={ClipboardList}
        />
        <ListSkeleton count={3} />
      </>
    )
  }

  if (!farmer) {
    return (
      <>
        <PageHeader
          title="Orders"
          description="View and update orders from buyers."
          icon={ClipboardList}
        />
        <EmptyState
          icon={ClipboardList}
          title="Register your farm first"
          description="You need a farm profile to receive orders."
        />
      </>
    )
  }

  if (orders.length === 0) {
    return (
      <>
        <PageHeader
          title="Orders"
          description="View and update orders from buyers."
          icon={ClipboardList}
        />
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Orders from buyers will appear here. Keep your produce listed and updated!"
        />
      </>
    )
  }

  // Counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length
  const activeCount = orders.filter(
    (o) => o.status === 'CONFIRMED' || o.status === 'DISPATCHED'
  ).length
  const completedCount = orders.filter((o) => o.status === 'DELIVERED').length

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

  // ── Pickup / Rider Info Card ───────────────────────────────────────────
  const renderPickupInfo = (order: Order) => {
    // Show only for CONFIRMED or DISPATCHED orders
    if (!['CONFIRMED', 'DISPATCHED'].includes(order.status)) return null

    const info = getDeliveryInfo(order.id)

    // No rider yet
    if (!info) {
      return (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
            <p className="text-sm font-semibold text-amber-800">
              Waiting for a rider to accept pickup...
            </p>
          </div>
          <p className="mt-1 text-xs text-amber-700">
            Notification sent to all available riders. Please keep the order ready.
          </p>
        </div>
      )
    }

    const { delivery, rider } = info

    return (
      <div className="mt-4 rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 shadow-sm">
              <Bike className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">
                Rider Assigned for Pickup
              </p>
              <p className="text-xs text-green-700">Please prepare the order</p>
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
          {/* Rider */}
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
                  className="flex items-center gap-1 text-green-700 hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {rider.phone}
                </a>
              )}
            </div>
          </div>

          {/* Fee + Location */}
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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatus.mutate({ order, status: 'CONFIRMED' })
                        }
                        disabled={updateStatus.isPending}
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          updateStatus.mutate({ order, status: 'CANCELLED' })
                        }
                        disabled={updateStatus.isPending}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({ order, status: 'DISPATCHED' })
                      }
                      disabled={updateStatus.isPending}
                      className="gap-2"
                    >
                      <Truck className="h-4 w-4" />
                      Dispatch
                    </Button>
                  )}
                </div>
              </div>

              {/* ✅ Rider / Pickup Info */}
              {renderPickupInfo(order)}
            </div>
          </AppCard>
        ))}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        title="Orders"
        description="View and update orders from buyers."
        icon={ClipboardList}
      />

      {/* Summary strip */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-sm font-medium text-amber-700">
            {pendingCount} pending
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {activeCount} processing
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3.5 py-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            {completedCount} delivered
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
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