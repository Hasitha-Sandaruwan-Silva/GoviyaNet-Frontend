import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Loader } from 'lucide-react'
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

  // Load cart items
  const { data: cartItems = [], isLoading: isLoadingCart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => buyerApi.getCart(user!.id),
    enabled: !!user?.id,
  })

  // Create orders mutation
  const createOrders = useMutation({
    mutationFn: async () => {
      if (!district || !addressLine.trim()) {
        throw new Error('Please fill in all delivery details')
      }
      const deliveryAddress = `${district}, ${addressLine}`
      
      // Create one order per cart item
      const orderPromises = cartItems.map((item) =>
        buyerApi.createOrder({
          buyerId: user!.id,
          produceId: item.produceId,
          farmerId: item.farmerId,
          quantity: item.quantity,
          pricePerKg: item.pricePerKg,
          deliveryAddress,
        })
      )
      
      await Promise.all(orderPromises)
      
      // Clear cart after successful orders
      await buyerApi.clearCart(user!.id)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Orders placed!', 'Your orders have been placed successfully.')
      navigate('/buyer/orders')
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  if (isLoadingCart) {
    return (
      <>
        <PageHeader
          title="Checkout"
          description="Delivery address and order review."
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
          description="Delivery address and order review."
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

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.quantity * item.pricePerKg), 0)

  return (
    <>
      <PageHeader
        title="Checkout"
        description="Delivery address and order review."
        icon={CreditCard}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Delivery Address Form */}
        <AppCard>
          <h3 className="mb-4 font-semibold text-slate-900">Delivery Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                District
              </label>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address Line
              </label>
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

        {/* Order Summary */}
        <div className="space-y-4">
          <AppCard variant="gradient">
            <h3 className="mb-4 font-semibold text-slate-900">Order Items ({cartItems.length})</h3>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
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
            <p className="text-sm text-slate-600 mb-4">
              💳 <strong>Payment:</strong> Cash on Delivery
            </p>
            <Button
              onClick={() => createOrders.mutate()}
              disabled={createOrders.isPending || !district || !addressLine.trim()}
              className="w-full"
              size="lg"
            >
              {createOrders.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          </AppCard>
        </div>
      </div>
    </>
  )
}
