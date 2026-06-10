import { useState } from 'react'
import { User, CheckCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/SkeletonLoaders'
import { useAuthStore } from '@/store/auth.store'
import { farmerApi } from '@/api/farmer.api'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import { SRI_LANKAN_DISTRICTS } from '@/lib/constants'
import type { Farmer } from '@/types'

export function FarmerProfilePage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [form, setForm] = useState({
    farmName: '',
    location: '',
    nic: '',
  })

  // Get farmer profile
  const { data: farmer, isLoading } = useQuery<Farmer>({
    queryKey: ['farmer', user?.id],
    queryFn: () => farmerApi.getByUserId(user!.id),
    enabled: !!user?.id,
    retry: false,
  })

  // Register farm
  const registerFarmer = useMutation({
    mutationFn: () => farmerApi.register({
      userId: user!.id,
      farmName: form.farmName,
      location: form.location,
      nic: form.nic,
    }),
    onSuccess: () => {
      toast.success('Farm registered!', 'Your farm profile has been created.')
      setShowRegisterForm(false)
      setForm({ farmName: '', location: '', nic: '' })
      queryClient.invalidateQueries({ queryKey: ['farmer'] })
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Farm Profile"
          description="Manage your farm details and verification status."
          icon={User}
        />
        <div className="grid gap-6">
          <CardSkeleton />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Farm Profile"
        description="Manage your farm details and verification status."
        icon={User}
      />

      {/* User Info Card */}
      <AppCard className="mb-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Information</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Full Name</dt>
            <dd className="font-medium text-slate-900">{user?.fullName ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-900">{user?.phone ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Username</dt>
            <dd className="font-medium text-slate-900">{user?.username ?? '—'}</dd>
          </div>
        </dl>
      </AppCard>

      {/* Farm Profile Section */}
      {!farmer ? (
        <AppCard>
          {!showRegisterForm ? (
            <EmptyState
              icon={User}
              title="Register your farm"
              description="Create a farm profile to start listing produce and receiving orders."
              actionLabel="Register Farm"
              onAction={() => setShowRegisterForm(true)}
            />
          ) : (
            <div>
              <h3 className="mb-4 font-semibold text-slate-900">Farm Registration</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Farm Name</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Your Farm Name"
                    value={form.farmName}
                    onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  >
                    <option value="">Select a district</option>
                    {SRI_LANKAN_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIC Number</label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g., 123456789V or 123456789012345"
                    value={form.nic}
                    onChange={(e) => setForm({ ...form, nic: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => registerFarmer.mutate()}
                    disabled={registerFarmer.isPending || !form.farmName || !form.location || !form.nic}
                  >
                    {registerFarmer.isPending ? 'Registering...' : 'Register Farm'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRegisterForm(false)
                      setForm({ farmName: '', location: '', nic: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </AppCard>
      ) : (
        <AppCard>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Farm Details</h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Farm Name</dt>
              <dd className="font-medium text-slate-900">{farmer.farmName}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Location (District)</dt>
              <dd className="font-medium text-slate-900">{farmer.location}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">NIC Number</dt>
              <dd className="font-medium text-slate-900">{farmer.nic}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Verification Status</dt>
              <dd className="flex items-center gap-2">
                {farmer.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                ) : (
                  <StatusBadge status="PENDING" />
                )}
              </dd>
            </div>
          </dl>
        </AppCard>
      )}
    </>
  )
}
