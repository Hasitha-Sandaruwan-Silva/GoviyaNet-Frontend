import { ClipboardList, CheckCircle, Truck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ListSkeleton } from '@/components/shared/SkeletonLoaders'
import { Button } from '@/components/ui/button'
import { farmerApi } from '@/api/farmer.api'
import { buyerApi } from '@/api/buyer.api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import type { Farmer, Order } from '@/types'

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

  // Update order status mutation
  const updateStatus = useMutation({
    mutationFn: (data: { orderId: number; status: 'CONFIRMED' | 'DISPATCHED' }) =>
      buyerApi.updateOrderStatus(data.orderId, { status: data.status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Status updated', 'Order status has been updated.')
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

  // Calculate order statuses counts
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length
  const activeCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'DISPATCHED').length
  const completedCount = orders.filter((o) => o.status === 'DELIVERED').length

  // Sort orders: active first (PENDING -> CONFIRMED -> DISPATCHED), then completed (DELIVERED -> CANCELLED)
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
          <span className="text-sm font-medium text-amber-700">{pendingCount} pending</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{activeCount} processing</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3.5 py-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">{completedCount} delivered</span>
        </div>
      </div>

      <div className="space-y-4">
        {sortedOrders.map((order) => (
          <AppCard key={order.id} variant="default">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900">
                    {order.produce?.name || `Produce ${order.produceId}`}
                  </h3>
                  <StatusBadge status={order.status} />
                </div>
                <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div>Quantity: <span className="font-medium text-slate-900">{order.quantity} kg</span></div>
                  <div>Total: <span className="font-medium text-slate-900">LKR {(order.totalPrice || order.quantity * order.pricePerKg!).toFixed(2)}</span></div>
                  <div>Delivery: <span className="font-medium text-slate-900">{order.deliveryAddress}</span></div>
                  {order.orderedAt && (
                    <div>Ordered: <span className="font-medium text-slate-900">{new Date(order.orderedAt).toLocaleDateString()}</span></div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {order.status === 'PENDING' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus.mutate({ orderId: order.id, status: 'CONFIRMED' })}
                    disabled={updateStatus.isPending}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm
                  </Button>
                )}
                {order.status === 'CONFIRMED' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus.mutate({ orderId: order.id, status: 'DISPATCHED' })}
                    disabled={updateStatus.isPending}
                    className="gap-2"
                  >
                    <Truck className="h-4 w-4" />
                    Dispatch
                  </Button>
                )}
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </>
  )
}
