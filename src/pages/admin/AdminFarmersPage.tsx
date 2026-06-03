import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { Button } from '@/components/ui/button'

export function AdminFarmersPage() {
  return (
    <>
      <PageHeader
        title="Verify Farmers"
        description="Review and approve farmer registrations."
        icon={Users}
      />
      <AppCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">Pending verifications</p>
            <p className="text-sm text-slate-500">Farmers awaiting approval will list here.</p>
          </div>
          <Button size="sm">Verify</Button>
        </div>
      </AppCard>
    </>
  )
}
