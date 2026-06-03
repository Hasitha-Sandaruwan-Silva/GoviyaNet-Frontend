import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'

export function BuyerCartPage() {
  const navigate = useNavigate()

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
      <div className="mt-4 text-center">
        <Button asChild variant="outline">
          <Link to="/buyer/checkout">Proceed to Checkout</Link>
        </Button>
      </div>
    </>
  )
}
