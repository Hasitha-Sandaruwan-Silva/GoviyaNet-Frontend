import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Logo } from '@/components/shared/Logo'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import type { UserRole } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { buyerApi } from '@/api/buyer.api'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  role: UserRole
  navItems: NavItem[]
}

export function DashboardLayout({ role, navItems }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  // Get cart count for BUYER role
  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => buyerApi.getCart(user!.id),
    enabled: !!user?.id && role === 'BUYER',
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Logo size="sm" />
          <button
            type="button"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            const showBadge = role === 'BUYER' && item.href === '/buyer/cart' && cartItems.length > 0

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-l-4 border-brand-500 bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
                {showBadge && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {user ? (
          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 flex items-center gap-3">
              <UserAvatar name={user.fullName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{user.fullName}</p>
                <p className="truncate text-xs text-slate-500">{user.role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center justify-end gap-2">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
