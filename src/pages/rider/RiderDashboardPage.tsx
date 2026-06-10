import { useState } from 'react'
import { Bike, User, MapPin, Star, Package, TrendingUp, Zap, Clock, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { getWelcomeMessage } from '@/lib/navigation'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatsGridSkeleton } from '@/components/shared/SkeletonLoaders'
import { useAuthStore } from '@/store/auth.store'
import { deliveryApi } from '@/api/delivery.api'
import { useToast } from '@/hooks/useToast'
import { parseApiError, cn } from '@/lib/utils'
import { VEHICLE_TYPES, DELIVERY_STATUS_COLORS } from '@/lib/constants'
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/animations'
import type { Rider, Delivery } from '@/types'

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  sub: string
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub }: StatCardProps) {
  return (
    <motion.div variants={staggerItem}>
      <AppCard variant="default" className="h-full">
        <div className="flex items-start gap-4">
          <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{sub}</p>
          </div>
        </div>
      </AppCard>
    </motion.div>
  )
}

// ─── Delivery Status Badge ─────────────────────────────────────────────────
function DeliveryStatusBadge({ status }: { status?: string }) {
  const s = (status ?? 'PENDING').toUpperCase()
  const colors = DELIVERY_STATUS_COLORS[s] ?? 'bg-slate-100 text-slate-700'
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize', colors)}>
      {s.toLowerCase().replace(/_/g, ' ')}
    </span>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function RiderDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const name = user?.fullName?.split(' ')[0] ?? 'Rider'

  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    vehicleType: 'MOTORBIKE' as typeof VEHICLE_TYPES[number],
    licenseNo: '',
    currentLocation: '',
  })

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: riders = [], isLoading: ridersLoading } = useQuery<Rider[]>({
    queryKey: ['riders'],
    queryFn: () => deliveryApi.getRiders(),
  })

  const rider = riders.find((r) => r.userId === user?.id)

  const {
    data: deliveries = [],
    isLoading: deliveriesLoading,
    isError: deliveriesError,
    refetch: refetchDeliveries,
  } = useQuery<Delivery[]>({
    queryKey: ['deliveries', rider?.id],
    queryFn: () => deliveryApi.getDeliveriesByRider(rider!.id),
    enabled: !!rider?.id,
  })

  // ── Stats ─────────────────────────────────────────────────────────────────
  const deliveredCount = deliveries.filter((d) => d.status === 'DELIVERED').length
  const activeCount = deliveries.filter((d) =>
    d.status === 'ASSIGNED' || d.status === 'PICKED_UP' || d.status === 'IN_TRANSIT'
  ).length
  const totalCount = deliveries.length

  // Recent active deliveries (max 3 for dashboard preview)
  const recentDeliveries = deliveries
    .filter((d) => d.status !== 'DELIVERED' && d.status !== 'FAILED')
    .slice(0, 3)

  // ── Mutations ─────────────────────────────────────────────────────────────
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
    onError: (e) => toast.error('Registration failed', parseApiError(e)),
  })

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

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Rider Dashboard"
          description={getWelcomeMessage('RIDER', name)}
          icon={Bike}
        />
        <StatsGridSkeleton />
      </>
    )
  }

  // ── Not registered ─────────────────────────────────────────────────────────
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
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                  <User className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Rider Registration</h3>
                  <p className="text-sm text-slate-500">Fill in your details to get started</p>
                </div>
              </div>
              <div className="space-y-4 max-w-md">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    placeholder="Your Full Name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    placeholder="0712345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
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

                {/* License No */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    placeholder="Your License Number"
                    value={form.licenseNo}
                    onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
                  />
                </div>

                {/* Current Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Location</label>
                  <input
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                    placeholder="e.g. Colombo, Western Province"
                    value={form.currentLocation}
                    onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => registerRider.mutate()}
                    disabled={
                      registerRider.isPending ||
                      !form.fullName ||
                      !form.phone ||
                      !form.licenseNo ||
                      !form.currentLocation
                    }
                    className="flex-1"
                  >
                    {registerRider.isPending ? 'Registering...' : 'Register as Rider'}
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
            </motion.div>
          )}
        </AppCard>
      </>
    )
  }

  // ── Registered Rider Dashboard ────────────────────────────────────────────
  return (
    <>
      <PageHeader
        title="Rider Dashboard"
        description={getWelcomeMessage('RIDER', name)}
        icon={Bike}
      />

      {/* ── Rider Profile + Availability Card ──────────────────────────── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-6">
        <AppCard variant="gradient">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Profile Info */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
                <span className="text-lg font-bold text-white">
                  {rider.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{rider.fullName}</h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Bike className="h-3.5 w-3.5" />
                    {rider.vehicleType.replace(/_/g, ' ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {rider.currentLocation}
                  </span>
                  {rider.rating != null && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {rider.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-400">License: {rider.licenseNo}</p>
              </div>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <div className="text-right">
                <p className={cn('text-sm font-semibold', rider.available ? 'text-green-700' : 'text-slate-500')}>
                  {rider.available ? 'Online — Ready' : 'Offline'}
                </p>
                <p className="text-xs text-slate-400">
                  {rider.available ? 'Accepting deliveries' : 'Go online to accept jobs'}
                </p>
              </div>
              <button
                onClick={() => updateAvailability.mutate(!rider.available)}
                disabled={updateAvailability.isPending}
                aria-label="Toggle availability"
                className={cn(
                  'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                  rider.available ? 'bg-green-500' : 'bg-slate-300',
                  updateAvailability.isPending && 'opacity-60 cursor-not-allowed'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform duration-200',
                    rider.available ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </AppCard>
      </motion.div>

      {/* ── Stats Grid ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard
          icon={TrendingUp}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Delivered"
          value={deliveredCount}
          sub="Completed deliveries"
        />
        <StatCard
          icon={Zap}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Active"
          value={activeCount}
          sub="In progress now"
        />
        <StatCard
          icon={Package}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="Total"
          value={totalCount}
          sub="All time deliveries"
        />
        <StatCard
          icon={Star}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          label="Rating"
          value={rider.rating != null ? rider.rating.toFixed(1) : '—'}
          sub="Customer rating"
        />
      </motion.div>

      {/* ── Active Deliveries Preview ──────────────────────────────────────── */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Active Deliveries</h2>
            <p className="text-sm text-slate-500">Your current in-progress jobs</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-brand-600 hover:text-brand-700"
            onClick={() => navigate('/rider/deliveries')}
          >
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {deliveriesError ? (
          <AppCard>
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-red-600">Failed to load deliveries.</p>
              <Button variant="outline" size="sm" onClick={() => refetchDeliveries()}>
                Retry
              </Button>
            </div>
          </AppCard>
        ) : recentDeliveries.length === 0 ? (
          <AppCard>
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Package className="h-7 w-7 text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">No active deliveries</p>
              <p className="text-sm text-slate-400">
                {rider.available
                  ? 'New assignments will appear here automatically.'
                  : 'Go online to start receiving delivery assignments.'}
              </p>
            </div>
          </AppCard>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {recentDeliveries.map((delivery) => (
              <motion.div key={delivery.id} variants={staggerItem}>
                <AppCard variant="default" hover className="cursor-pointer" >
                  <div
                    className="flex items-start justify-between gap-4"
                    onClick={() => navigate('/rider/deliveries')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate('/rider/deliveries') }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">Order #{delivery.orderId}</span>
                        <DeliveryStatusBadge status={delivery.status} />
                      </div>
                      <div className="flex items-start gap-1.5 text-sm text-slate-500">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{delivery.deliveryAddress}</span>
                      </div>
                      {delivery.assignedAt && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          Assigned {new Date(delivery.assignedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center">
                      {delivery.deliveryFee != null && (
                        <span className="text-sm font-semibold text-slate-700">
                          LKR {delivery.deliveryFee.toFixed(0)}
                        </span>
                      )}
                      <ChevronRight className="ml-2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </AppCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {recentDeliveries.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => navigate('/rider/deliveries')}>
              Go to all deliveries →
            </Button>
          </div>
        )}
      </motion.div>
    </>
  )
}
