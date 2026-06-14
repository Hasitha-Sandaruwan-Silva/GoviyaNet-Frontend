import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CreditCard, Loader } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/SkeletonLoaders'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buyerApi } from '@/api/buyer.api'
import { farmerApi } from '@/api/farmer.api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import { SRI_LANKAN_DISTRICTS } from '@/lib/constants'

export function BuyerCheckoutPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()

  const [district, setDistrict] = useState('')
  const [addressLine, setAddressLine] = useState('')

  const { data: cartItems = [], isLoading: isLoadingCart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => buyerApi.getCart(user!.id),
    enabled: !!user?.id,
  })

  const createOrders = useMutation({
    mutationFn: async () => {
      if (!district || !addressLine.trim()) {
        throw new Error('Please fill in all delivery details')
      }

      const deliveryAddress = `${district}, ${addressLine}`

      // ── Stock validation ──
      for (const item of cartItems) {
        const produceList = await farmerApi.getProduceByFarmer(item.farmerId)
        const produce = produceList.find((p) => p.id === item.produceId)

        if (!produce) {
          throw new Error('Produce not found')
        }

        if (item.quantity > produce.stockKg) {
          throw new Error(`Only ${produce.stockKg} kg available for ${produce.name}`)
        }
      }

      // ── Create orders ──
      const orderPromises = cartItems.map(async (item) => {
        try {
          return await buyerApi.createOrder({
            buyerId: user!.id,
            produceId: item.produceId,
            farmerId: item.farmerId,
            quantity: item.quantity,
            pricePerKg: item.pricePerKg,
            deliveryAddress,
          })
        } catch (error: unknown) {
          const e = error as { response?: { status: number; data?: { message: string } } }

          if (e.response?.status === 409) {
            throw new Error(e.response.data?.message || 'Item out of stock.', { cause: error })
          }

          throw error
        }
      })

      const createdOrders = await Promise.all(orderPromises)

      // ── Update stock ──
      for (const item of cartItems) {
        const produceList = await farmerApi.getProduceByFarmer(item.farmerId)
        const produce = produceList.find((p) => p.id === item.produceId)

        if (produce) {
          await farmerApi.updateStock(produce.id, produce.stockKg - item.quantity)
        }
      }

      // ❌ REMOVED: delivery create logic
      // Delivery record is created when a Rider accepts the order.
      // Proper flow: PENDING → Farmer confirms → CONFIRMED → Rider accepts → Delivery

      // ── Clear cart ──
      await buyerApi.clearCart(user!.id)

      return createdOrders
    },
    onSuccess: (createdOrders) => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })

      const finalTotal = createdOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)

      toast.success(
        'Order request placed!',
        `Total order value: LKR ${finalTotal.toFixed(2)}. Waiting for farmer confirmation.`
      )

      navigate('/buyer/orders')
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  if (isLoadingCart) {
    return (
      <>
        <PageHeader
          title="Checkout"
          description="Review your items and confirm delivery details."
          icon={CreditCard}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </>
    )
  }

  if (cartItems.length === 0) {
    return (
      <>
        <PageHeader
          title="Checkout"
          description="Review your items and confirm delivery details."
          icon={CreditCard}
        />
        <EmptyState
          icon={CreditCard}
          title="Cart is empty"
          description="Add items to your cart first."
          actionLabel="Browse Produce"
          onAction={() => navigate('/buyer/browse')}
        />
      </>
    )
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.pricePerKg, 0)

  return (
    <>
      <PageHeader
        title="Checkout"
        description="Review your items and confirm delivery details."
        icon={CreditCard}
      />

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
          <div>
            <h3 className="font-semibold text-amber-900">Payment Module Pending</h3>
            <p className="mt-1 text-sm text-amber-800">
              This prototype currently supports order placement and delivery coordination only.
              Online payment and automated farmer settlement are not integrated yet.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AppCard>
          <h3 className="mb-4 font-semibold text-slate-900">Delivery Address</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">District</label>
              <Select value={district} onValueChange={setDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {SRI_LANKAN_DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Address Line</label>
              <textarea
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Street, building, or house number"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                rows={3}
              />
            </div>
          </div>
        </AppCard>

        <div className="space-y-4">
          <AppCard variant="gradient">
            <h3 className="mb-4 font-semibold text-slate-900">Order Items ({cartItems.length})</h3>

            <div className="mb-4 max-h-40 space-y-2 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {item.produce?.name || `Produce ${item.produceId}`} x {item.quantity} kg
                  </span>
                  <span className="font-medium text-slate-900">
                    LKR {(item.quantity * item.pricePerKg).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-200 pt-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-600">Grand Total</span>
                <span className="text-xl font-bold text-slate-900">LKR {totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </AppCard>

          <AppCard>
            <h3 className="mb-4 font-semibold text-slate-900">Payment Information</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Payment Mode</span>
                <span className="font-medium text-slate-900">Manual Payment (Prototype)</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-slate-600">Payment Status</span>
                <span className="font-medium text-amber-700">Pending</span>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-600">
                This order will be recorded in the system, but payment processing is not automated
                in the current version.
              </div>
            </div>

            <Button
              onClick={() => createOrders.mutate()}
              disabled={createOrders.isPending || !district || !addressLine.trim()}
              className="mt-4 w-full"
              size="lg"
            >
              {createOrders.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Confirming Order...
                </>
              ) : (
                'Confirm Order'
              )}
            </Button>
          </AppCard>
        </div>
      </div>
    </>
  )
}