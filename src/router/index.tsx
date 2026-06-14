import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, AuthLoadingScreen } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/errors/NotFoundPage'
import { UnauthorizedPage } from '@/pages/errors/UnauthorizedPage'
import {
  FARMER_NAV,
  BUYER_NAV,
  RIDER_NAV,
  ADMIN_NAV,
} from '@/lib/navigation'

const LoginPage = lazy(() =>
  import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const FarmerDashboardPage = lazy(() =>
  import('@/pages/farmer/FarmerDashboardPage').then((m) => ({ default: m.FarmerDashboardPage })),
)
const FarmerProfilePage = lazy(() =>
  import('@/pages/farmer/FarmerProfilePage').then((m) => ({ default: m.FarmerProfilePage })),
)
const FarmerProducePage = lazy(() =>
  import('@/pages/farmer/FarmerProducePage').then((m) => ({ default: m.FarmerProducePage })),
)
const FarmerOrdersPage = lazy(() =>
  import('@/pages/farmer/FarmerOrdersPage').then((m) => ({ default: m.FarmerOrdersPage })),
)
const BuyerDashboardPage = lazy(() =>
  import('@/pages/buyer/BuyerDashboardPage').then((m) => ({ default: m.BuyerDashboardPage })),
)
const BuyerBrowsePage = lazy(() =>
  import('@/pages/buyer/BuyerBrowsePage').then((m) => ({ default: m.BuyerBrowsePage })),
)
const BuyerCartPage = lazy(() =>
  import('@/pages/buyer/BuyerCartPage').then((m) => ({ default: m.BuyerCartPage })),
)
const BuyerCheckoutPage = lazy(() =>
  import('@/pages/buyer/BuyerCheckoutPage').then((m) => ({ default: m.BuyerCheckoutPage })),
)
const BuyerOrdersPage = lazy(() =>
  import('@/pages/buyer/BuyerOrdersPage').then((m) => ({ default: m.BuyerOrdersPage })),
)
const BuyerPricesPage = lazy(() =>
  import('@/pages/buyer/BuyerPricesPage').then((m) => ({ default: m.BuyerPricesPage })),
)
const RiderDashboardPage = lazy(() =>
  import('@/pages/rider/RiderDashboardPage').then((m) => ({ default: m.RiderDashboardPage })),
)
const RiderDeliveriesPage = lazy(() =>
  import('@/pages/rider/RiderDeliveriesPage').then((m) => ({ default: m.RiderDeliveriesPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const AdminFarmersPage = lazy(() =>
  import('@/pages/admin/AdminFarmersPage').then((m) => ({ default: m.AdminFarmersPage })),
)
const AdminPricesPage = lazy(() =>
  import('@/pages/admin/AdminPricesPage').then((m) => ({ default: m.AdminPricesPage })),
)
const NotificationsPage = lazy(() =>
  import('@/pages/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)

export function AppRoutes() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Farmer */}
        <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route element={<DashboardLayout role="FARMER" navItems={FARMER_NAV} />}>
            <Route path="/farmer" element={<FarmerDashboardPage />} />
            <Route path="/farmer/profile" element={<FarmerProfilePage />} />
            <Route path="/farmer/produce" element={<FarmerProducePage />} />
            <Route path="/farmer/orders" element={<FarmerOrdersPage />} />
            <Route path="/farmer/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Buyer */}
        <Route element={<ProtectedRoute allowedRoles={['BUYER']} />}>
          <Route element={<DashboardLayout role="BUYER" navItems={BUYER_NAV} />}>
            <Route path="/buyer" element={<BuyerDashboardPage />} />
            <Route path="/buyer/browse" element={<BuyerBrowsePage />} />
            <Route path="/buyer/cart" element={<BuyerCartPage />} />
            <Route path="/buyer/checkout" element={<BuyerCheckoutPage />} />
            <Route path="/buyer/orders" element={<BuyerOrdersPage />} />
            <Route path="/buyer/prices" element={<BuyerPricesPage />} />
            <Route path="/buyer/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Rider */}
        <Route element={<ProtectedRoute allowedRoles={['RIDER']} />}>
          <Route element={<DashboardLayout role="RIDER" navItems={RIDER_NAV} />}>
            <Route path="/rider" element={<RiderDashboardPage />} />
            <Route path="/rider/deliveries" element={<RiderDeliveriesPage />} />
            <Route path="/rider/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout role="ADMIN" navItems={ADMIN_NAV} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/farmers" element={<AdminFarmersPage />} />
            <Route path="/admin/prices" element={<AdminPricesPage />} />
            <Route path="/admin/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}