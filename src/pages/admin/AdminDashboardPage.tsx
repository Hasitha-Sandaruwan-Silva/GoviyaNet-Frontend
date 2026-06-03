import { ShieldCheck, Users, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader, PlaceholderGrid } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'
import { farmerApi } from '@/api/farmer.api'
import { buyerApi } from '@/api/buyer.api'
import { deliveryApi } from '@/api/delivery.api'

export function AdminDashboardPage() {
  const navigate = useNavigate()

  // Fetch farmers
  const { data: farmers = [], isLoading: farmersLoading } = useQuery({
    queryKey: ['admin-farmers'],
    queryFn: () => farmerApi.getAll(),
  })

  // Fetch orders (all orders for all farmers)
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const farmersList = await farmerApi.getAll()
      const allOrders = []
      for (const farmer of farmersList) {
        const farmerOrders = await buyerApi.getOrdersByFarmer(farmer.id)
        allOrders.push(...farmerOrders)
      }
      return allOrders
    },
  })

  // Fetch available riders
  const { data: availableRiders = [], isLoading: ridersLoading } = useQuery({
    queryKey: ['admin-available-riders'],
    queryFn: () => deliveryApi.getAvailableRiders(),
  })

  const isLoading = farmersLoading || ordersLoading || ridersLoading

  const totalFarmers = farmers.length
  const unverifiedFarmers = farmers.filter((f) => !f.verified).length
  const totalOrders = orders.length
  const availableRidersCount = availableRiders.length

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Platform analytics and pending actions."
        icon={ShieldCheck}
      />

      {isLoading ? (
        <div className="text-center text-slate-500">Loading dashboard data...</div>
      ) : (
        <>
          <PlaceholderGrid
            items={[
              { title: 'Total Farmers', value: String(totalFarmers), description: 'Registered farmers' },
              {
                title: 'Unverified Farmers',
                value: String(unverifiedFarmers),
                description: 'Pending verification',
              },
              { title: 'Total Orders', value: String(totalOrders), description: 'All time' },
              { title: 'Available Riders', value: String(availableRidersCount), description: 'Ready to deliver' },
            ]}
          />

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">Quick Actions</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className="cursor-pointer"
                onClick={() => navigate('/admin/farmers')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/admin/farmers')
                }}
              >
                <AppCard hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="mt-3 font-semibold text-slate-900">Verify Farmers</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {unverifiedFarmers} farmers pending verification
                      </p>
                    </div>
                  </div>
                  <Button className="mt-4 w-full" onClick={() => navigate('/admin/farmers')}>
                    Review Farmers →
                  </Button>
                </AppCard>
              </div>

              <div
                className="cursor-pointer"
                onClick={() => navigate('/admin/prices')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/admin/prices')
                }}
              >
                <AppCard hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="mt-3 font-semibold text-slate-900">Manage Prices</h3>
                      <p className="mt-1 text-sm text-slate-500">Record and update market prices</p>
                    </div>
                  </div>
                  <Button className="mt-4 w-full" onClick={() => navigate('/admin/prices')}>
                    Manage Prices →
                  </Button>
                </AppCard>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
