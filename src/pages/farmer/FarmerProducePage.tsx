import { useState } from 'react'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { farmerApi } from '@/api/farmer.api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import { PRODUCE_CATEGORIES } from '@/lib/constants'
import type { Farmer, Produce } from '@/types'

export function FarmerProducePage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [form, setForm] = useState({
    name: '', category: 'Vegetables', pricePerKg: '', stockKg: '', unit: 'KG',
  })
  const [profileForm, setProfileForm] = useState({
    farmName: '', location: '', nic: '',
  })

  // Get farmer profile
  const { data: farmer, isLoading: farmerLoading } = useQuery<Farmer>({
    queryKey: ['farmer', user?.id],
    queryFn: () => farmerApi.getByUserId(user!.id),
    enabled: !!user?.id,
    retry: false,
  })

  // Get produce list
  const { data: produce = [], isLoading: produceLoading } = useQuery<Produce[]>({
    queryKey: ['produce', farmer?.id],
    queryFn: () => farmerApi.getProduceByFarmer(farmer!.id),
    enabled: !!farmer?.id,
  })

  // Register farm profile
  const registerFarmer = useMutation({
    mutationFn: () => farmerApi.register({
      userId: user!.id,
      farmName: profileForm.farmName,
      location: profileForm.location,
      nic: profileForm.nic,
    }),
    onSuccess: () => {
      toast.success('Farm registered!', 'Your farm profile has been created.')
      setShowProfileForm(false)
      queryClient.invalidateQueries({ queryKey: ['farmer'] })
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  // Add produce
  const addProduce = useMutation({
    mutationFn: () => farmerApi.createProduce({
      farmerId: farmer!.id,
      name: form.name,
      category: form.category,
      pricePerKg: Number(form.pricePerKg),
      stockKg: Number(form.stockKg),
      unit: form.unit,
    }),
    onSuccess: () => {
      toast.success('Produce added!', `${form.name} listed successfully.`)
      setShowAddForm(false)
      setForm({ name: '', category: 'Vegetables', pricePerKg: '', stockKg: '', unit: 'KG' })
      queryClient.invalidateQueries({ queryKey: ['produce'] })
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  // Delete produce
  const deleteProduce = useMutation({
    mutationFn: (id: number) => farmerApi.deleteProduce(id),
    onSuccess: () => {
      toast.success('Deleted', 'Produce removed.')
      queryClient.invalidateQueries({ queryKey: ['produce'] })
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  if (farmerLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>

  // No farmer profile yet
  if (!farmer) return (
    <>
      <PageHeader title="My Produce" description="First, register your farm profile." icon={Package} />
      <AppCard>
        {!showProfileForm ? (
          <EmptyState
            icon={Package}
            title="Register your farm first"
            description="You need a farm profile before listing produce."
            actionLabel="Register Farm"
            onAction={() => setShowProfileForm(true)}
          />
        ) : (
          <div className="space-y-4 max-w-md">
            <h3 className="font-semibold text-slate-900">Farm Profile</h3>
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Farm Name" value={profileForm.farmName} onChange={e => setProfileForm({ ...profileForm, farmName: e.target.value })} />
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Location (District)" value={profileForm.location} onChange={e => setProfileForm({ ...profileForm, location: e.target.value })} />
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="NIC Number" value={profileForm.nic} onChange={e => setProfileForm({ ...profileForm, nic: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={() => registerFarmer.mutate()} disabled={registerFarmer.isPending}>
                {registerFarmer.isPending ? 'Registering...' : 'Register Farm'}
              </Button>
              <Button variant="outline" onClick={() => setShowProfileForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </AppCard>
    </>
  )

  return (
    <>
      <PageHeader title="My Produce" description={`${farmer.farmName} — ${produce.length} items listed`} icon={Package}>
        <Button className="gap-2" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4" />
          Add Produce
        </Button>
      </PageHeader>

      {/* Add Produce Form */}
      {showAddForm && (
        <AppCard className="mb-4">
          <h3 className="mb-4 font-semibold text-slate-900">Add New Produce</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Produce Name (e.g. Tomato)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="rounded-lg border px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {PRODUCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Price per KG (LKR)" type="number" value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: e.target.value })} />
            <input className="rounded-lg border px-3 py-2 text-sm" placeholder="Stock (KG)" type="number" value={form.stockKg} onChange={e => setForm({ ...form, stockKg: e.target.value })} />
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => addProduce.mutate()} disabled={addProduce.isPending || !form.name || !form.pricePerKg || !form.stockKg}>
              {addProduce.isPending ? 'Adding...' : 'Add Produce'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </AppCard>
      )}

      {/* Produce Grid */}
      {produceLoading ? (
        <div className="text-center text-slate-500">Loading produce...</div>
      ) : produce.length === 0 ? (
        <AppCard>
          <EmptyState icon={Package} title="No produce listed yet" description="Click Add Produce to list your first item." actionLabel="Add Produce" onAction={() => setShowAddForm(true)} />
        </AppCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {produce.map((p) => (
            <AppCard key={p.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.category}</p>
                </div>
                <StatusBadge status={p.available ? 'ACTIVE' : 'INACTIVE'} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Price/KG</p>
                  <p className="font-medium text-slate-900">LKR {p.pricePerKg}</p>
                </div>
                <div>
                  <p className="text-slate-500">Stock</p>
                  <p className="font-medium text-slate-900">{p.stockKg} {p.unit}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 flex-1">
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:bg-red-50" onClick={() => deleteProduce.mutate(p.id)} disabled={deleteProduce.isPending}>
                  <Trash2 className="h-3 w-3" /> Delete
                </Button>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </>
  )
}