import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { ROLE_DASHBOARD_PATH, type UserRole } from '@/lib/constants'

export function UnauthorizedPage() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role.toUpperCase() as UserRole | undefined
  const dashboard = role ? ROLE_DASHBOARD_PATH[role] : '/'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50">
        <ShieldAlert className="h-10 w-10 text-amber-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900">Access Denied</h1>
      <p className="mt-2 max-w-md text-slate-600">
        You don&apos;t have permission to view this page with your current account role.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {user ? (
          <Button asChild>
            <Link to={dashboard}>Go to My Dashboard</Link>
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  )
}
