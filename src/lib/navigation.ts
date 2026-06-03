import {
  LayoutDashboard,
  User,
  Package,
  ClipboardList,
  Search,
  ShoppingCart,
  TrendingUp,
  Bike,
  MapPin,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { NavItem } from '@/components/layout/DashboardLayout'
import type { UserRole } from '@/lib/constants'

export const FARMER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/farmer', icon: LayoutDashboard },
  { label: 'Profile', href: '/farmer/profile', icon: User },
  { label: 'My Produce', href: '/farmer/produce', icon: Package },
  { label: 'Orders', href: '/farmer/orders', icon: ClipboardList },
]

export const BUYER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/buyer', icon: LayoutDashboard },
  { label: 'Browse Produce', href: '/buyer/browse', icon: Search },
  { label: 'Cart', href: '/buyer/cart', icon: ShoppingCart },
  { label: 'My Orders', href: '/buyer/orders', icon: ClipboardList },
  { label: 'Market Prices', href: '/buyer/prices', icon: TrendingUp },
]

export const RIDER_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/rider', icon: LayoutDashboard },
  { label: 'Deliveries', href: '/rider/deliveries', icon: MapPin },
]

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Verify Farmers', href: '/admin/farmers', icon: Users },
  { label: 'Manage Prices', href: '/admin/prices', icon: TrendingUp },
]

export const ROLE_NAV: Record<UserRole, NavItem[]> = {
  FARMER: FARMER_NAV,
  BUYER: BUYER_NAV,
  RIDER: RIDER_NAV,
  ADMIN: ADMIN_NAV,
}

export function getWelcomeMessage(role: UserRole, name: string): string {
  const messages: Record<UserRole, string> = {
    FARMER: `Good morning, ${name}! Ready to manage your farm and orders.`,
    BUYER: `Welcome back, ${name}! Find fresh produce from Sri Lankan farmers.`,
    RIDER: `Hello, ${name}! Check available deliveries and go online.`,
    ADMIN: `Welcome, ${name}. Monitor platform activity and pending actions.`,
  }
  return messages[role]
}

export const ROLE_ICONS: Record<UserRole, LucideIcon> = {
  FARMER: Package,
  BUYER: ShoppingCart,
  RIDER: Bike,
  ADMIN: ShieldCheck,
}
