import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'

export function BuyerCheckoutPage() {
  return (
    <>
      <PageHeader
        title="Checkout"
        description="Delivery address and order review."
        icon={CreditCard}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <AppCard>
          <h3 className="mb-4 font-semibold text-slate-900">Delivery Address</h3>
          <p className="text-sm text-slate-600">
            Sri Lankan district selector and address form will connect here.
          </p>
        </AppCard>
        <AppCard variant="gradient">
          <h3 className="mb-4 font-semibold text-slate-900">Order Summary</h3>
          <p className="text-sm text-slate-600">Payment: Cash on Delivery (mock)</p>
          <Button className="mt-6 w-full">Place Order</Button>
        </AppCard>
      </div>
    </>
  )
}
