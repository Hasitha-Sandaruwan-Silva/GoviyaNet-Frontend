import { useState } from 'react'
import { TrendingUp, Plus, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { priceApi } from '@/api/price.api'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import { PRODUCE_CATEGORIES, SRI_LANKAN_DISTRICTS } from '@/lib/constants'
import type { PriceRecord } from '@/types'

export function AdminPricesPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<PriceRecord, 'id'>>({
    produceName: '',
    category: 'Vegetables',
    region: 'Colombo',
    minPrice: 0,
    maxPrice: 0,
    avgPrice: 0,
    unit: 'KG',
    recordedDate: new Date().toISOString().split('T')[0]!,
    source: '',
  })

  // Fetch all prices
  const { data: prices = [], isLoading, error } = useQuery<PriceRecord[]>({
    queryKey: ['admin-prices'],
    queryFn: () => priceApi.getAll(),
  })

  // Create price mutation
  const createPrice = useMutation({
    mutationFn: () => priceApi.create(form),
    onSuccess: () => {
      toast.success('Price record created!', 'New market price added successfully.')
      setShowAddModal(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['admin-prices'] })
    },
    onError: (e) => toast.error('Failed to create price', parseApiError(e)),
  })

  // Update price mutation
  const updatePrice = useMutation({
    mutationFn: () => (editingId ? priceApi.update(editingId, form) : Promise.reject('No ID')),
    onSuccess: () => {
      toast.success('Price record updated!', 'Market price updated successfully.')
      setShowAddModal(false)
      setEditingId(null)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['admin-prices'] })
    },
    onError: (e) => toast.error('Failed to update price', parseApiError(e)),
  })

  // Delete price mutation
  const deletePrice = useMutation({
    mutationFn: (id: number) => priceApi.delete(id),
    onSuccess: () => {
      toast.success('Price record deleted!', 'Market price removed.')
      queryClient.invalidateQueries({ queryKey: ['admin-prices'] })
    },
    onError: (e) => toast.error('Failed to delete price', parseApiError(e)),
  })

  const resetForm = () => {
    setForm({
      produceName: '',
      category: 'Vegetables',
      region: 'Colombo',
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      unit: 'KG',
      recordedDate: new Date().toISOString().split('T')[0]!,
      source: '',
    })
  }

  const handleOpenAddModal = () => {
    setEditingId(null)
    resetForm()
    setShowAddModal(true)
  }

  const handleOpenEditModal = (price: PriceRecord) => {
    setEditingId(price.id ?? null)
    setForm({
      produceName: price.produceName,
      category: price.category,
      region: price.region,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      avgPrice: price.avgPrice,
      unit: price.unit,
      recordedDate: price.recordedDate,
      source: price.source || '',
    })
    setShowAddModal(true)
  }

  const handleSubmit = () => {
    if (!form.produceName || !form.category || !form.region) {
      toast.error('Validation error', 'Please fill in all required fields.')
      return
    }
    if (editingId) {
      updatePrice.mutate()
    } else {
      createPrice.mutate()
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Manage Prices"
          description="Record and update market price data by category and region."
          icon={TrendingUp}
        />
        <div className="text-center text-slate-500">Loading prices...</div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageHeader
          title="Manage Prices"
          description="Record and update market price data by category and region."
          icon={TrendingUp}
        />
        <AppCard className="border-red-200 bg-red-50">
          <p className="text-red-700">Error loading prices. Please try again later.</p>
        </AppCard>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Manage Prices"
        description="Record and update market price data by category and region."
        icon={TrendingUp}
      >
        <Button className="gap-2" onClick={handleOpenAddModal}>
          <Plus className="h-4 w-4" />
          Add Price Record
        </Button>
      </PageHeader>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Price Record' : 'Add New Price Record'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="text-sm font-medium text-slate-700">Product Name *</label>
              <Input
                placeholder="e.g., Tomato"
                value={form.produceName}
                onChange={(e) => setForm({ ...form, produceName: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-slate-700">Category *</label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div>
              <label className="text-sm font-medium text-slate-700">Region *</label>
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SRI_LANKAN_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prices Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium text-slate-700">Min Price (LKR)</label>
                <Input
                  type="number"
                  value={form.minPrice}
                  onChange={(e) => setForm({ ...form, minPrice: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Max Price (LKR)</label>
                <Input
                  type="number"
                  value={form.maxPrice}
                  onChange={(e) => setForm({ ...form, maxPrice: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Avg Price (LKR)</label>
                <Input
                  type="number"
                  value={form.avgPrice}
                  onChange={(e) => setForm({ ...form, avgPrice: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="text-sm font-medium text-slate-700">Unit</label>
              <Input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="mt-1"
                placeholder="e.g., KG, LB"
              />
            </div>

            {/* Recorded Date */}
            <div>
              <label className="text-sm font-medium text-slate-700">Recorded Date</label>
              <Input
                type="date"
                value={form.recordedDate}
                onChange={(e) => setForm({ ...form, recordedDate: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Source */}
            <div>
              <label className="text-sm font-medium text-slate-700">Source (Optional)</label>
              <Input
                placeholder="e.g., Central Market, Weekly Report"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={createPrice.isPending || updatePrice.isPending}
              >
                {createPrice.isPending || updatePrice.isPending
                  ? 'Saving...'
                  : editingId
                    ? 'Update Record'
                    : 'Add Record'}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prices Grid */}
      {prices.length === 0 ? (
        <AppCard>
          <EmptyState
            icon={TrendingUp}
            title="No price records yet"
            description="Add your first market price record to get started."
            actionLabel="Add Price Record"
            onAction={handleOpenAddModal}
          />
        </AppCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prices.map((price) => (
            <AppCard key={price.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{price.produceName}</h3>
                  <p className="text-sm text-slate-500">{price.category}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleOpenEditModal(price)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      if (price.id) {
                        deletePrice.mutate(price.id)
                      }
                    }}
                    disabled={deletePrice.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Region:</span>
                  <span className="font-medium text-slate-900">{price.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Price Range:</span>
                  <span className="font-medium text-slate-900">
                    LKR {price.minPrice} - {price.maxPrice}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Average:</span>
                  <span className="font-semibold text-brand-600">LKR {price.avgPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unit:</span>
                  <span className="font-medium text-slate-900">{price.unit}</span>
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <p className="text-xs text-slate-400">
                    Updated: {new Date(price.recordedDate).toLocaleDateString()}
                  </p>
                  {price.source && <p className="text-xs text-slate-400">Source: {price.source}</p>}
                </div>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </>
  )
}
