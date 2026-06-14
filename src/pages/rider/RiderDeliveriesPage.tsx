import {
  MapPin,
  Clock,
  CheckCircle,
  Package,
  MapPinned,
  Truck,
  AlertCircle,
  RefreshCw,
  DollarSign,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { deliveryApi } from '@/api/delivery.api'
import { buyerApi } from '@/api/buyer.api'
import { notificationApi } from '@/api/notification.api'
import { useToast } from '@/hooks/useToast'
import { parseApiError, cn } from '@/lib/utils'
import { DELIVERY_STATUS_COLORS } from '@/lib/constants'
import { staggerContainer, staggerItem } from '@/lib/animations'
import type { Rider, Delivery } from '@/types'

// ─── Delivery Status Badge ─────────────────────────────────────────────────────
function DeliveryStatusBadge({ status }: { status?: string }) {
  const s = (status ?? 'PENDING').toUpperCase()
  const colors = DELIVERY_STATUS_COLORS[s] ?? 'bg-slate-100 text-slate-700'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
        colors
      )}
    >
      {s.toLowerCase().replace(/_/g, ' ')}
    </span>
  )
}

// ─── Status Flow Progress Indicator ───────────────────────────────────────────
const STATUS_STEPS = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'] as const

function StatusProgress({ status }: { status?: string }) {
  const s = (status ?? '').toUpperCase()
  const currentIndex = STATUS_STEPS.indexOf(s as typeof STATUS_STEPS[number])
  if (currentIndex === -1 || s === 'PENDING' || s === 'FAILED') return null

  return (
    <div className="mt-3 flex items-center gap-1">
      {STATUS_STEPS.map((step, idx) => {
        const isDone = idx <= currentIndex
        const isCurrent = idx === currentIndex
        return (
          <div key={step} className="flex flex-1 items-center">
            <div
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-500',
                isDone ? 'bg-brand-500' : 'bg-slate-200'
              )}
            />
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-0.5 h-2 w-2 shrink-0 rounded-full border-2 transition-colors duration-500',
                  isDone && !isCurrent
                    ? 'border-brand-500 bg-brand-500'
                    : isCurrent
                    ? 'border-brand-500 bg-white'
                    : 'border-slate-300 bg-white'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Delivery Card ─────────────────────────────────────────────────────────────
interface DeliveryCardProps {
  delivery: Delivery
  isPendingMutation: boolean
  onUpdateStatus: (deliveryId: number, orderId: number, status: string) => void
}

function DeliveryCard({
  delivery,
  isPendingMutation,
  onUpdateStatus,
}: DeliveryCardProps) {
  const status = delivery.status ?? 'PENDING'
  const isTerminal = status === 'DELIVERED' || status === 'FAILED'

  return (
    <motion.div variants={staggerItem}>
      <AppCard
        variant="default"
        className={cn('transition-all duration-200', isTerminal && 'opacity-80')}
      >
        {/* ── Header ── */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">
                Order #{delivery.orderId}
              </h3>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">
                Delivery #{delivery.id}
              </span>
              <DeliveryStatusBadge status={delivery.status} />
            </div>
            <StatusProgress status={delivery.status} />
          </div>

          {/* Fee badge */}
          {delivery.deliveryFee != null && delivery.deliveryFee > 0 && (
            <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1">
              <DollarSign className="h-3.5 w-3.5 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                LKR {delivery.deliveryFee.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* ── Address + Details ── */}
        <div className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Package className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Pickup
              </p>
              <p className="mt-0.5 font-medium text-slate-800 leading-snug">
                {delivery.pickupAddress}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100">
              <MapPinned className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Drop-off
              </p>
              <p className="mt-0.5 font-medium text-slate-800 leading-snug">
                {delivery.deliveryAddress}
              </p>
            </div>
          </div>
        </div>

        {/* ── Meta row ── */}
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
          {delivery.assignedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Assigned {new Date(delivery.assignedAt).toLocaleString()}
            </span>
          )}
          {delivery.pickedUpAt && (
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              Picked up {new Date(delivery.pickedUpAt).toLocaleString()}
            </span>
          )}
          {delivery.deliveredAt && (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              Delivered {new Date(delivery.deliveredAt).toLocaleString()}
            </span>
          )}
          {delivery.notes && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {delivery.notes}
            </span>
          )}
        </div>

        {!isTerminal && <div className="mb-4 border-t border-slate-100" />}

        {/* ── Action Buttons ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {status === 'ASSIGNED' && (
              <Button
                onClick={() =>
                  onUpdateStatus(delivery.id, delivery.orderId, 'PICKED_UP')
                }
                disabled={isPendingMutation}
                className="w-full gap-2 sm:w-auto"
              >
                <Package className="h-4 w-4" />
                {isPendingMutation ? 'Updating...' : 'Confirm Pick Up'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {(status === 'PENDING' || !delivery.status) && (
              <Button
                variant="outline"
                onClick={() =>
                  onUpdateStatus(delivery.id, delivery.orderId, 'PICKED_UP')
                }
                disabled={isPendingMutation}
                className="w-full gap-2 sm:w-auto"
              >
                <Package className="h-4 w-4" />
                {isPendingMutation ? 'Updating...' : 'Pick Up'}
              </Button>
            )}

            {status === 'PICKED_UP' && (
              <Button
                onClick={() =>
                  onUpdateStatus(delivery.id, delivery.orderId, 'IN_TRANSIT')
                }
                disabled={isPendingMutation}
                className="w-full gap-2 sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Truck className="h-4 w-4" />
                {isPendingMutation ? 'Updating...' : 'Start Delivery'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}

            {status === 'IN_TRANSIT' && (
              <Button
                onClick={() =>
                  onUpdateStatus(delivery.id, delivery.orderId, 'DELIVERED')
                }
                disabled={isPendingMutation}
                className="w-full gap-2 sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                {isPendingMutation ? 'Updating...' : 'Mark as Delivered'}
              </Button>
            )}

            {/* ✅ DELIVERED — Waiting for Buyer Confirmation */}
            {status === 'DELIVERED' && (
              <div className="flex flex-col gap-2 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-3 border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">
                    Delivery Completed
                  </span>
                </div>
                <p className="text-xs text-green-700/80 pl-6">
                  Waiting for buyer to confirm receipt.
                </p>
              </div>
            )}

            {status === 'FAILED' && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold text-red-700">
                  Delivery Failed
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </AppCard>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function RiderDeliveriesPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: riders = [], isLoading: ridersLoading } = useQuery<Rider[]>({
    queryKey: ['riders'],
    queryFn: () => deliveryApi.getRiders(),
  })

 const rider = riders.find((r) => Number(r.userId) === Number(user?.id))

  const {
    data: deliveries = [],
    isLoading: deliveriesLoading,
    isError: deliveriesError,
    refetch,
  } = useQuery<Delivery[]>({
    queryKey: ['deliveries', rider?.id],
    queryFn: () => deliveryApi.getDeliveriesByRider(rider!.id),
    enabled: !!rider?.id,
    refetchInterval: 15000, // Auto refresh every 15s
  })

  // ── ✅ Smart Update Status Mutation ────────────────────────────────────────
  const updateStatus = useMutation({
    mutationFn: async ({
      deliveryId,
      orderId,
      status,
    }: {
      deliveryId: number
      orderId?: number
      status: string
    }) => {
      // 1. Always update delivery status
      await deliveryApi.updateDeliveryStatus(deliveryId, { status })

      if (!orderId) return

      try {
        const currentOrder = await buyerApi.getOrder(orderId)
        const currentOrderStatus = currentOrder?.status

        // 2. Sync order status based on delivery status
        if (status === 'PICKED_UP' || status === 'IN_TRANSIT') {
          // Order should be DISPATCHED while rider has it
          if (currentOrderStatus === 'CONFIRMED') {
            await buyerApi.updateOrderStatus(orderId, { status: 'DISPATCHED' })
          }
          // Already DISPATCHED → skip
        }

        // ✅ DELIVERED — DO NOT change order to DELIVERED here.
        // Buyer must confirm receipt first!
        // Order stays as DISPATCHED until buyer confirms.

        if (status === 'DELIVERED') {
          // Notify buyer to confirm receipt
          try {
            await notificationApi.createNotification({
              userId: currentOrder.buyerId,
              userRole: 'BUYER',
              type: 'DELIVERY_COMPLETED',
              title: 'Your order has arrived! 🎉',
              message: `Order #${orderId} has been delivered. Please confirm receipt in your orders page.`,
              referenceId: orderId,
              referenceType: 'ORDER',
            })
          } catch (err) {
            console.warn('Failed to send buyer notification:', err)
          }
        }

        if (status === 'FAILED') {
          if (
            currentOrderStatus === 'CONFIRMED' ||
            currentOrderStatus === 'DISPATCHED'
          ) {
            await buyerApi.updateOrderStatus(orderId, { status: 'CANCELLED' })
          }
        }
      } catch (err) {
        const e = err as { message?: string }
        console.warn('Order status sync skipped:', e?.message || err)
      }
    },
    onSuccess: (_, { status }) => {
      const label = status.toLowerCase().replace(/_/g, ' ')
      if (status === 'DELIVERED') {
        toast.success(
          'Marked as delivered',
          'Buyer has been notified to confirm receipt.'
        )
      } else {
        toast.success('Status updated', `Delivery marked as ${label}`)
      }
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (e) => toast.error('Update failed', parseApiError(e)),
  })

  const isLoading = ridersLoading || deliveriesLoading

  const activeDeliveries = deliveries.filter(
    (d) =>
      d.status === 'ASSIGNED' ||
      d.status === 'PICKED_UP' ||
      d.status === 'IN_TRANSIT' ||
      d.status === 'PENDING' ||
      !d.status
  )
  const completedDeliveries = deliveries.filter(
    (d) => d.status === 'DELIVERED' || d.status === 'FAILED'
  )

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="My Deliveries"
          description="Manage your delivery assignments."
          icon={MapPin}
        />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </>
    )
  }

  if (!rider) {
    return (
      <>
        <PageHeader
          title="My Deliveries"
          description="Manage your delivery assignments."
          icon={MapPin}
        />
        <EmptyState
          icon={Package}
          title="Not registered as rider"
          description="Please complete your rider profile on the dashboard to start accepting deliveries."
          actionLabel="Go to Dashboard"
          onAction={() => (window.location.href = '/rider')}
        />
      </>
    )
  }

  if (deliveriesError) {
    return (
      <>
        <PageHeader
          title="My Deliveries"
          description="Manage your delivery assignments."
          icon={MapPin}
        />
        <AppCard>
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Failed to load deliveries
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Check your connection and try again.
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </AppCard>
      </>
    )
  }

  if (deliveries.length === 0) {
    return (
      <>
        <PageHeader
          title="My Deliveries"
          description="Manage your delivery assignments."
          icon={MapPin}
        />
        <EmptyState
          icon={Package}
          title="No deliveries yet"
          description="Available delivery requests will appear here when assigned to you. Make sure you're online on the dashboard."
          actionLabel="Go to Dashboard"
          onAction={() => (window.location.href = '/rider')}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="My Deliveries"
        description="Manage your delivery assignments."
        icon={MapPin}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2">
          <Truck className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            {activeDeliveries.length} active
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3.5 py-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            {
              completedDeliveries.filter((d) => d.status === 'DELIVERED')
                .length
            }{' '}
            delivered
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2">
          <Package className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-600">
            {deliveries.length} total
          </span>
        </div>
      </div>

      {activeDeliveries.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Active ({activeDeliveries.length})
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {activeDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                isPendingMutation={updateStatus.isPending}
                onUpdateStatus={(id, orderId, status) =>
                  updateStatus.mutate({ deliveryId: id, orderId, status })
                }
              />
            ))}
          </motion.div>
        </section>
      )}

      {completedDeliveries.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Completed / Failed ({completedDeliveries.length})
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {completedDeliveries.map((delivery) => (
              <DeliveryCard
                key={delivery.id}
                delivery={delivery}
                isPendingMutation={updateStatus.isPending}
                onUpdateStatus={(id, orderId, status) =>
                  updateStatus.mutate({ deliveryId: id, orderId, status })
                }
              />
            ))}
          </motion.div>
        </section>
      )}
    </>
  )
}