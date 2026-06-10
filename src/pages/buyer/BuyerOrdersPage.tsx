import { ClipboardList, XCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ListSkeleton } from '@/components/shared/SkeletonLoaders'
import { StepProgress } from '@/components/shared/StepProgress'
import { Button } from '@/components/ui/button'
import { buyerApi } from '@/api/buyer.api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import type { Order } from '@/types'

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

  // Cancel order mutation
  const cancelOrder = useMutation({
    mutationFn: buyerApi.cancelOrder,
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
          onAction={() => window.location.href = '/buyer/browse'}
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

  return (
    <>
      <PageHeader
        title="My Orders"
        description="Track all your orders from farm to doorstep."
        icon={ClipboardList}
      />
      <div className="space-y-4">
        {sortedOrders.map((order) => (
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
                    <div>Quantity: <span className="font-medium text-slate-900">{order.quantity} kg</span></div>
                    <div>Total: <span className="font-medium text-slate-900">LKR {(order.totalPrice || order.quantity * order.pricePerKg!).toFixed(2)}</span></div>
                    <div>Delivery: <span className="font-medium text-slate-900">{order.deliveryAddress}</span></div>
                    {order.orderedAt && (
                      <div>Ordered: <span className="font-medium text-slate-900">{new Date(order.orderedAt).toLocaleDateString()}</span></div>
                    )}
                  </div>
                </div>
                {order.status === 'PENDING' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => cancelOrder.mutate(order.id)}
                    disabled={cancelOrder.isPending}
                    className="gap-2 shrink-0"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>

              {/* Progress Tracker */}
              {order.status !== 'CANCELLED' && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider">Delivery Track</p>
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
    </>
  )
}
