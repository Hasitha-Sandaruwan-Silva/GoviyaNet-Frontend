import { MapPin, Clock, CheckCircle, Package, MapPinned } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { deliveryApi } from '@/api/delivery.api'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import type { Rider, Delivery } from '@/types'

export function RiderDeliveriesPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()

  // Get all riders and find current user's rider profile
  const { data: riders = [], isLoading: ridersLoading } = useQuery<Rider[]>({
    queryKey: ['riders'],
    queryFn: () => deliveryApi.getRiders(),
  })

  const rider = riders.find((r) => r.userId === user?.id)

  // Get deliveries for current rider
  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery<Delivery[]>({
    queryKey: ['deliveries', rider?.id],
    queryFn: () => deliveryApi.getDeliveriesByRider(rider!.id),
    enabled: !!rider?.id,
  })

  // Update delivery status mutation
  const updateStatus = useMutation({
    mutationFn: ({
      deliveryId,
      status,
    }: {
      deliveryId: number
      status: 'PICKED_UP' | 'DELIVERED'
    }) => deliveryApi.updateDeliveryStatus(deliveryId, { status }),
    onSuccess: (_, variables) => {
      const statusLabel = variables.status === 'PICKED_UP' ? 'Picked up' : 'Delivered'
      toast.success('Updated', `Delivery marked as ${statusLabel}`)
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  const isLoading = ridersLoading || deliveriesLoading

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Deliveries"
          description="Manage your delivery assignments."
          icon={MapPin}
        />
        <div className="text-center text-slate-500">Loading deliveries...</div>
      </>
    )
  }

  if (!rider) {
    return (
      <>
        <PageHeader
          title="Deliveries"
          description="Manage your delivery assignments."
          icon={MapPin}
        />
        <EmptyState
          icon={Package}
          title="Not registered as rider"
          description="Please complete your rider profile to start accepting deliveries."
          actionLabel="Go to Dashboard"
          onAction={() => (window.location.href = '/rider')}
        />
      </>
    )
  }

  if (deliveries.length === 0) {
    return (
      <>
        <PageHeader
          title="Deliveries"
          description="Manage your delivery assignments."
          icon={MapPin}
        />
        <EmptyState
          icon={Package}
          title="No deliveries yet"
          description="Available delivery requests will appear here when you go online."
          actionLabel="Go Online"
          onAction={() => (window.location.href = '/rider')}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Deliveries"
        description="Manage your delivery assignments."
        icon={MapPin}
      />
      <div className="space-y-4">
        {deliveries.map((delivery) => (
          <AppCard key={delivery.id} variant="default">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">Order #{delivery.orderId}</h3>
                  <StatusBadge status={delivery.status || 'PENDING'} />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 flex-shrink-0 mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-slate-600">Pickup Address</p>
                      <p className="font-medium text-slate-900">{delivery.pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPinned className="h-4 w-4 flex-shrink-0 mt-0.5 text-slate-400" />
                    <div>
                      <p className="text-slate-600">Delivery Address</p>
                      <p className="font-medium text-slate-900">{delivery.deliveryAddress}</p>
                    </div>
                  </div>

                  {delivery.assignedAt && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0 mt-0.5 text-slate-400" />
                      <div>
                        <p className="text-slate-600">Assigned</p>
                        <p className="font-medium text-slate-900">
                          {new Date(delivery.assignedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {delivery.deliveryFee && (
                    <div>
                      <p className="text-slate-600">Delivery Fee</p>
                      <p className="font-medium text-slate-900">LKR {delivery.deliveryFee.toFixed(2)}</p>
                    </div>
                  )}

                  {delivery.notes && (
                    <div>
                      <p className="text-slate-600">Notes</p>
                      <p className="font-medium text-slate-900">{delivery.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:flex-col">
                {(!delivery.status || delivery.status === 'PENDING') && (
                  <Button
                    onClick={() =>
                      updateStatus.mutate({
                        deliveryId: delivery.id,
                        status: 'PICKED_UP',
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Pick Up
                  </Button>
                )}

                {delivery.status === 'PICKED_UP' && (
                  <Button
                    onClick={() =>
                      updateStatus.mutate({
                        deliveryId: delivery.id,
                        status: 'DELIVERED',
                      })
                    }
                    disabled={updateStatus.isPending}
                    className="gap-2"
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Delivered
                  </Button>
                )}

                {delivery.status === 'DELIVERED' && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Completed</span>
                  </div>
                )}
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </>
  )
}
