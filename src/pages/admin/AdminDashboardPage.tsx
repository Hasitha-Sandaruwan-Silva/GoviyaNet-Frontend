import { ShieldCheck, Users, Package, Bike, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'
import { StatsGridSkeleton } from '@/components/shared/SkeletonLoaders'
import { farmerApi } from '@/api/farmer.api'
import { buyerApi } from '@/api/buyer.api'
import { deliveryApi } from '@/api/delivery.api'
import type { Rider, Farmer, Order } from '@/types'

export function AdminDashboardPage() {
  const navigate = useNavigate()

  // Fetch farmers
  const { data: farmers = [], isLoading: farmersLoading } = useQuery<Farmer[]>({
    queryKey: ['admin-farmers'],
    queryFn: () => farmerApi.getAll(),
  })

  // Fetch orders (all orders for all farmers)
  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
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

  // Fetch riders
  const { data: riders = [], isLoading: ridersLoading } = useQuery<Rider[]>({
    queryKey: ['admin-riders'],
    queryFn: () => deliveryApi.getRiders(),
  })

  const isLoading = farmersLoading || ordersLoading || ridersLoading

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Admin Dashboard"
          description="Platform analytics and pending actions."
          icon={ShieldCheck}
        />
        <div className="space-y-6">
          <StatsGridSkeleton />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </>
    )
  }

  const totalFarmers = farmers.length
  const unverifiedFarmers = farmers.filter((f) => !f.verified).length
  const totalOrders = orders.length
  const totalRiders = riders.length
  const onlineRiders = riders.filter((r) => r.available).length
  const offlineRiders = totalRiders - onlineRiders

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Platform analytics and pending actions."
        icon={ShieldCheck}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Farmers</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{totalFarmers}</p>
              <p className="mt-1 text-xs text-slate-400">{unverifiedFarmers} pending verification</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </AppCard>

        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Unverified Farmers</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 text-amber-600">{unverifiedFarmers}</p>
              <p className="mt-1 text-xs text-slate-400">Needs admin approval</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </AppCard>

        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{totalOrders}</p>
              <p className="mt-1 text-xs text-slate-400">All-time marketplace orders</p>
            </div>
            <div className="rounded-xl bg-green-50 p-2 text-green-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </AppCard>

        <AppCard hover variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Available Riders</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{onlineRiders}</p>
              <p className="mt-1 text-xs text-slate-400">{totalRiders} total registered riders</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
              <Bike className="h-6 w-6" />
            </div>
          </div>
        </AppCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <AppCard>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Quick Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-semibold text-slate-900">Verify Farmers</p>
                <p className="text-xs text-slate-500">{unverifiedFarmers} farmers are waiting for verification approval.</p>
              </div>
              <Button size="sm" onClick={() => navigate('/admin/farmers')} className="gap-1">
                Verify <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-semibold text-slate-900">Manage Market Prices</p>
                <p className="text-xs text-slate-500">Update Sri Lankan daily market price indices.</p>
              </div>
              <Button size="sm" onClick={() => navigate('/admin/prices')} className="gap-1">
                Manage <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </AppCard>

        {/* Riders Summary Status */}
        <AppCard>
          <h3 className="mb-4 text-base font-semibold text-slate-900">Riders Summary</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-green-600">{onlineRiders}</p>
                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Online</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-600">{offlineRiders}</p>
                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Offline</p>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Online Riders List</p>
              {riders.filter(r => r.available).length === 0 ? (
                <p className="text-sm text-slate-500 italic">No riders online currently.</p>
              ) : (
                riders.filter(r => r.available).map((rider) => (
                  <div key={rider.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
                    <span className="font-medium text-slate-800">{rider.fullName}</span>
                    <span className="text-xs text-slate-500">{rider.vehicleType.replace(/_/g, ' ')} · {rider.currentLocation}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </AppCard>
      </div>
    </>
  )
}
