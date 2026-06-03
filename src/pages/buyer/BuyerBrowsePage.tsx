import { useState } from 'react'
import { Search, ShoppingCart } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { farmerApi } from '@/api/farmer.api'
import { buyerApi } from '@/api/buyer.api'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/hooks/useToast'
import { parseApiError } from '@/lib/utils'
import { PRODUCE_CATEGORIES } from '@/lib/constants'
import type { Produce } from '@/types'

export function BuyerBrowsePage() {
  const user = useAuthStore((s) => s.user)
  const toast = useToast()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  // Load all available produce
  const { data: produce = [], isLoading } = useQuery<Produce[]>({
    queryKey: ['available-produce'],
    queryFn: () => farmerApi.getAvailableProduce(),
  })

  // Add to cart
  const addToCart = useMutation({
    mutationFn: (item: Produce) =>
      buyerApi.addToCart({
        buyerId: user!.id,
        produceId: item.id,
        farmerId: item.farmerId,
        quantity: quantities[item.id] ?? 1,
        pricePerKg: item.pricePerKg,
      }),
    onSuccess: (_, item) => {
      toast.success('Added to cart!', `${item.name} added successfully.`)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
    onError: (e) => toast.error('Failed', parseApiError(e)),
  })

  // Filter produce
  const filtered = produce.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory
    return matchSearch && matchCategory
  })

  return (
    <>
      <PageHeader
        title="Browse Produce"
        description="Fresh vegetables, fruits, and grains direct from Sri Lankan farms."
        icon={Search}
      />

      {/* Search + Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Search produce..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {['All', ...PRODUCE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Produce Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading produce...</div>
      ) : filtered.length === 0 ? (
        <AppCard>
          <EmptyState
            icon={Search}
            title="No produce found"
            description={search ? `No results for "${search}"` : 'No produce available right now.'}
          />
        </AppCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <AppCard key={p.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.category}</p>
                </div>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Available
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-slate-500">Price/KG</p>
                  <p className="font-semibold text-brand-700">LKR {p.pricePerKg}</p>
                </div>
                <div>
                  <p className="text-slate-500">Stock</p>
                  <p className="font-medium text-slate-900">{p.stockKg} {p.unit}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-slate-200">
                  <button
                    className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l-lg"
                    onClick={() => setQuantities((q) => ({ ...q, [p.id]: Math.max(1, (q[p.id] ?? 1) - 1) }))}
                  >−</button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {quantities[p.id] ?? 1}
                  </span>
                  <button
                    className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r-lg"
                    onClick={() => setQuantities((q) => ({ ...q, [p.id]: (q[p.id] ?? 1) + 1 }))}
                  >+</button>
                </div>
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => addToCart.mutate(p)}
                  disabled={addToCart.isPending}
                >
                  <ShoppingCart className="h-3 w-3" />
                  Add to Cart
                </Button>
              </div>
            </AppCard>
          ))}
        </div>
      )}
    </>
  )
}