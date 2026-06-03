import { User } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { AppCard } from '@/components/shared/AppCard'
import { useAuthStore } from '@/store/auth.store'

export function FarmerProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <PageHeader
        title="Farm Profile"
        description="Manage your farm details and verification status."
        icon={User}
      />
      <AppCard>
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
        <p className="mt-6 text-sm text-slate-500">
          Farm registration and cover photo will be connected to the API in the next phase.
        </p>
      </AppCard>
    </>
  )
}
