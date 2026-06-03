import { useState } from 'react'
import { Users, Check } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { farmerApi } from '@/api/farmer.api'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import type { Farmer } from '@/types'

export function AdminFarmersPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [selectedTab, setSelectedTab] = useState('all')

  // Fetch all farmers
  const { data: farmers = [], isLoading, error } = useQuery<Farmer[]>({
    queryKey: ['admin-farmers-list'],
    queryFn: () => farmerApi.getAll(),
  })

  // Verify farmer mutation
  const verifyFarmer = useMutation({
    mutationFn: (id: number) => farmerApi.verify(id),
    onSuccess: (_, farmerId) => {
      const farmer = farmers.find((f) => f.id === farmerId)
      toast.success('Farmer verified!', `${farmer?.farmName} has been verified.`)
      queryClient.invalidateQueries({ queryKey: ['admin-farmers-list'] })
    },
    onError: (e) => toast.error('Verification failed', parseApiError(e)),
  })

  // Filter farmers based on tab
  const filteredFarmers = farmers.filter((f) => {
    if (selectedTab === 'verified') return f.verified
    if (selectedTab === 'unverified') return !f.verified
    return true
  })

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Verify Farmers"
          description="Review and approve farmer registrations."
          icon={Users}
        />
        <div className="text-center text-slate-500">Loading farmers...</div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Verify Farmers"
          description="Review and approve farmer registrations."
          icon={Users}
        />
        <AppCard className="border-red-200 bg-red-50">
          <p className="text-red-700">Error loading farmers. Please try again later.</p>
        </AppCard>
      </>
    )
  }

  if (farmers.length === 0) {
    return (
      <>
        <PageHeader
          title="Verify Farmers"
          description="Review and approve farmer registrations."
          icon={Users}
        />
        <AppCard>
          <EmptyState
            icon={Users}
            title="No farmers registered yet"
            description="Farmers will appear here once they register on the platform."
          />
        </AppCard>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Verify Farmers"
        description="Review and approve farmer registrations."
        icon={Users}
      />

      {/* Tabs for filtering */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList variant="pill">
          <TabsTrigger value="all" variant="pill">
            All ({farmers.length})
          </TabsTrigger>
          <TabsTrigger value="verified" variant="pill">
            Verified ({farmers.filter((f) => f.verified).length})
          </TabsTrigger>
          <TabsTrigger value="unverified" variant="pill">
            Unverified ({farmers.filter((f) => !f.verified).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Farmers List */}
      {filteredFarmers.length === 0 ? (
        <AppCard>
          <EmptyState
            icon={Users}
            title={
              selectedTab === 'verified'
                ? 'No verified farmers'
                : selectedTab === 'unverified'
                  ? 'All farmers are verified!'
                  : 'No farmers'
            }
            description={
              selectedTab === 'verified'
                ? 'Farmers awaiting verification will appear here.'
                : selectedTab === 'unverified'
                  ? 'Great work! All farmers have been verified.'
                  : 'No farmers found.'
            }
          />
        </AppCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFarmers.map((farmer) => (
            <AppCard key={farmer.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{farmer.farmName}</h3>
                  <p className="text-sm text-slate-500">{farmer.location}</p>
                </div>
                <StatusBadge
                  status={farmer.verified ? 'CONFIRMED' : 'PENDING'}
                  icon={farmer.verified ? Check : undefined}
                />
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-500">NIC Number</p>
                  <p className="font-mono text-sm font-medium text-slate-900">{farmer.nic}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">District</p>
                  <p className="text-sm font-medium text-slate-900">{farmer.location}</p>
                </div>
              </div>

              {!farmer.verified && (
                <Button
                  className="mt-4 w-full gap-2"
                  onClick={() => verifyFarmer.mutate(farmer.id)}
                  disabled={verifyFarmer.isPending}
                >
                  <Check className="h-4 w-4" />
                  {verifyFarmer.isPending ? 'Verifying...' : 'Verify Farmer'}
                </Button>
              )}

              {farmer.verified && (
                <div className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-center text-xs font-medium text-green-700">
                  ✓ Verified
                </div>
              )}
            </AppCard>
          ))}
        </div>
      )}
    </>
  )
}
