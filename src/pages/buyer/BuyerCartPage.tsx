import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'
import { buyerApi } from '@/api/buyer.api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'

export function BuyerCartPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()

  // Load cart items
  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => buyerApi.getCart(user!.id),
    enabled: !!user?.id,
  })

  // Remove item from cart
  const removeItem = useMutation({
    mutationFn: buyerApi.removeFromCart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Item removed', 'Item removed from cart.')
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  // Clear cart
  const clearCart = useMutation({
    mutationFn: () => buyerApi.clearCart(user!.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Cart cleared', 'All items removed from cart.')
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Shopping Cart"
          description="Review items before checkout."
          icon={ShoppingCart}
        />
        <div className="text-center text-slate-500">Loading cart...</div>
      </>
    )
  }

  if (cartItems.length === 0) {
    return (
      <>
        <PageHeader
          title="Shopping Cart"
          description="Review items before checkout."
          icon={ShoppingCart}
        />
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is feeling lonely 🛒"
          description="Add fresh produce from local farmers to get started."
          actionLabel="Browse Produce"
          onAction={() => navigate('/buyer/browse')}
        />
      </>
    )
  }

  // Calculate totals
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.quantity * item.pricePerKg), 0)

  return (
    <>
      <PageHeader
        title="Shopping Cart"
        description="Review items before checkout."
        icon={ShoppingCart}
      />

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => {
          const subtotal = item.quantity * item.pricePerKg
          return (
            <AppCard key={item.id} variant="default">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {item.produce?.name || `Produce ${item.produceId}`}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.quantity} kg @ LKR {item.pricePerKg}/kg
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    LKR {subtotal.toFixed(2)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem.mutate(item.id)}
                  disabled={removeItem.isPending}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </AppCard>
          )
        })}
      </div>

      {/* Summary */}
      <AppCard variant="gradient" className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total Price</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">LKR {totalPrice.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => clearCart.mutate()}
              disabled={clearCart.isPending}
            >
              Clear All
            </Button>
            <Button
              onClick={() => navigate('/buyer/checkout')}
              disabled={clearCart.isPending || removeItem.isPending}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </AppCard>
    </>
  )
}
