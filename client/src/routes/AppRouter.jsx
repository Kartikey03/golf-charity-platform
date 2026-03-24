import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'

// Layouts
import MainLayout from '../components/layout/MainLayout'
import DashboardLayout from '../components/layout/DashboardLayout'

// Public pages
import HomePage from '../pages/public/HomePage'
import CharitiesPage from '../pages/public/CharitiesPage'
import CharityDetailPage from '../pages/public/CharityDetailPage'
import HowItWorksPage from '../pages/public/HowItWorksPage'
import PricingPage from '../pages/public/PricingPage'
// Auth
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
// Dashboard
import DashboardHome from '../pages/dashboard/DashboardHome'
import ScoresPage from '../pages/dashboard/ScoresPage'
import DrawsPage from '../pages/dashboard/DrawsPage'
import WinningsPage from '../pages/dashboard/WinningsPage'
import CharityPage from '../pages/dashboard/CharityPage'
import SettingsPage from '../pages/dashboard/SettingsPage'
// Admin
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminDraws from '../pages/admin/AdminDraws'
import AdminCharities from '../pages/admin/AdminCharities'
import AdminWinners from '../pages/admin/AdminWinners'
import AdminReports from '../pages/admin/AdminReports'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public Routes - Wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/charities" element={<CharitiesPage />} />
          <Route path="/charities/:slug" element={<CharityDetailPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Dashboard Routes - Wrapped in DashboardLayout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/scores" element={<ScoresPage />} />
          <Route path="/dashboard/draws" element={<DrawsPage />} />
          <Route path="/dashboard/winnings" element={<WinningsPage />} />
          <Route path="/dashboard/charity" element={<CharityPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Routes - Wrapped in DashboardLayout (Admin Required) */}
        <Route element={<ProtectedRoute requireAdmin><DashboardLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/draws" element={<AdminDraws />} />
          <Route path="/admin/charities" element={<AdminCharities />} />
          <Route path="/admin/winners" element={<AdminWinners />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}
