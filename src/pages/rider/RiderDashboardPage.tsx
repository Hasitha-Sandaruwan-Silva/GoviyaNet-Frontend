import { useState } from 'react'
import { Bike, User } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader, PlaceholderGrid } from '@/components/layout/PageHeader'
import { getWelcomeMessage } from '@/lib/navigation'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuthStore } from '@/store/auth.store'
import { deliveryApi } from '@/api/delivery.api'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import { VEHICLE_TYPES } from '@/lib/constants'
import type { Rider } from '@/types'

export function RiderDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()
  const name = user?.fullName?.split(' ')[0] ?? 'Rider'

  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    vehicleType: 'MOTORBIKE' as const,
    licenseNo: '',
    currentLocation: '',
  })

  // Get all riders and find current user's rider profile
  const { data: riders = [], isLoading: ridersLoading } = useQuery<Rider[]>({
    queryKey: ['riders'],
    queryFn: () => deliveryApi.getRiders(),
  })

  const rider = riders.find((r) => r.userId === user?.id)

  // Get deliveries for current rider
  const { data: deliveries = [], isLoading: deliveriesLoading } = useQuery({
    queryKey: ['deliveries', rider?.id],
    queryFn: () => deliveryApi.getDeliveriesByRider(rider!.id),
    enabled: !!rider?.id,
  })

  // Count today's completed deliveries
  const today = new Date().toDateString()
  const todayDeliveries = deliveries.filter((d) => {
    if (!d.deliveredAt) return false
    return new Date(d.deliveredAt).toDateString() === today
  }).length

  // Register rider mutation
  const registerRider = useMutation({
    mutationFn: () =>
      deliveryApi.registerRider({
        userId: user!.id,
        fullName: form.fullName,
        phone: form.phone,
        vehicleType: form.vehicleType,
        licenseNo: form.licenseNo,
        currentLocation: form.currentLocation,
      }),
    onSuccess: () => {
      toast.success('Registered!', 'Your rider profile has been created.')
      setShowRegisterForm(false)
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  // Update availability mutation
  const updateAvailability = useMutation({
    mutationFn: (available: boolean) =>
      deliveryApi.updateRiderAvailability(rider!.id, available),
    onSuccess: (_, available) => {
      toast.success(
        available ? 'You are online!' : 'You are offline',
        available
          ? 'You will receive delivery requests'
          : 'You will not receive delivery requests'
      )
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  const isLoading = ridersLoading || deliveriesLoading

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Rider Dashboard"
          description={getWelcomeMessage('RIDER', name)}
          icon={Bike}
        />
        <div className="text-center text-slate-500">Loading dashboard...</div>
      </>
    )
  }

  // If rider not registered, show registration form
  if (!rider) {
    return (
      <>
        <PageHeader
          title="Rider Dashboard"
          description={getWelcomeMessage('RIDER', name)}
          icon={Bike}
        />
        <AppCard>
          {!showRegisterForm ? (
            <EmptyState
              icon={User}
              title="Register as Rider"
              description="Create a rider profile to start accepting deliveries and earning."
              actionLabel="Register Now"
              onAction={() => setShowRegisterForm(true)}
            />
          ) : (
            <div>
              <h3 className="mb-4 font-semibold text-slate-900">Rider Registration</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Your Full Name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Your Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.vehicleType}
                    onChange={(e) =>
                      setForm({ ...form, vehicleType: e.target.value as typeof form.vehicleType })
                    }
                  >
                    {VEHICLE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    License Number
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Your License Number"
                    value={form.licenseNo}
                    onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Location
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Your Current Location"
                    value={form.currentLocation}
                    onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => registerRider.mutate()}
                    disabled={
                      registerRider.isPending ||
                      !form.fullName ||
                      !form.phone ||
                      !form.licenseNo ||
                      !form.currentLocation
                    }
                  >
                    {registerRider.isPending ? 'Registering...' : 'Register'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRegisterForm(false)
                      setForm({
                        fullName: user?.fullName || '',
                        phone: user?.phone || '',
                        vehicleType: 'MOTORBIKE',
                        licenseNo: '',
                        currentLocation: '',
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </AppCard>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Rider Dashboard"
        description={getWelcomeMessage('RIDER', name)}
        icon={Bike}
      />

      {/* Availability Toggle Card */}
      <AppCard className="mb-6" variant="gradient">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {rider.available ? 'You are online' : 'You are offline'}
            </p>
            <p className="text-sm text-slate-600">
              {rider.available
                ? 'Ready to receive delivery requests'
                : 'Go online to receive delivery requests'}
            </p>
          </div>
          <button
            onClick={() => updateAvailability.mutate(!rider.available)}
            disabled={updateAvailability.isPending}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              rider.available ? 'bg-green-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                rider.available ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </AppCard>

      {/* Stats Grid */}
      <PlaceholderGrid
        items={[
          { title: "Today's Deliveries", value: String(todayDeliveries), description: 'Completed today' },
          { title: 'Total Deliveries', value: String(deliveries.length), description: 'All time' },
          { title: 'Rating', value: rider.rating?.toFixed(1) ?? '—', description: 'Customer rating' },
        ]}
      />
    </>
  )
}
