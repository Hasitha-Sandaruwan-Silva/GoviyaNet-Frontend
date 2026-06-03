import { ShieldCheck } from 'lucide-react'
import { PageHeader, PlaceholderGrid } from '@/components/layout/PageHeader'

export function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Platform analytics and pending actions."
        icon={ShieldCheck}
      />
      <PlaceholderGrid
        items={[
          { title: 'Total Farmers', value: '—', description: 'Registered farmers' },
          { title: 'Total Buyers', value: '—', description: 'Active buyers' },
          { title: 'Total Orders', value: '—', description: 'All time' },
          { title: 'Revenue', value: '—', description: 'Platform GMV (LKR)' },
        ]}
      />
    </>
  )
}
