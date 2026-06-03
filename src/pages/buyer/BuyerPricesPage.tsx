import { useState } from 'react'
import { TrendingUp, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { priceApi } from '@/api/price.api'
import { PRODUCE_CATEGORIES } from '@/lib/constants'

export function BuyerPricesPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Get all market prices
  const { data: prices = [], isLoading } = useQuery({
    queryKey: ['prices'],
    queryFn: () => priceApi.getAll(),
  })

  // Filter prices
  const filtered = prices.filter((p) => {
    const matchSearch = p.produceName.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory
    return matchSearch && matchCategory
  })

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Market Prices"
          description="Compare regional prices and trends across Sri Lanka."
          icon={TrendingUp}
        />
        <div className="text-center text-slate-500">Loading prices...</div>
      </>
    )
  }

  if (filtered.length === 0) {
    return (
      <>
        <PageHeader
          title="Market Prices"
          description="Compare regional prices and trends across Sri Lanka."
          icon={TrendingUp}
        />
        <EmptyState
          icon={Search}
          title="No prices found"
          description="Try adjusting your search or category filters."
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Market Prices"
        description="Compare regional prices and trends across Sri Lanka."
        icon={TrendingUp}
      />

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by produce name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {['All', ...PRODUCE_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((price) => (
          <AppCard key={price.id} variant="default">
            <h3 className="font-semibold text-slate-900">{price.produceName}</h3>
            <p className="mt-1 text-sm text-slate-500">{price.category}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Region:</span>
                <span className="font-medium text-slate-900">{price.region}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Price Range:</span>
                <span className="font-medium text-slate-900">
                  LKR {price.minPrice} - {price.maxPrice} / {price.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Average:</span>
                <span className="font-semibold text-brand-600">LKR {price.avgPrice}</span>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <p className="text-xs text-slate-400">
                  Last updated: {new Date(price.recordedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    </>
  )
}
