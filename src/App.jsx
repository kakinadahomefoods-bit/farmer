import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import MobileBottomNav from './components/MobileBottomNav'
import { useAuth } from './contexts/AuthContext'
import ScrollToTop from './components/ScrollToTop'
import PageTracker from './components/PageTracker'
import AdminLayout from './components/admin/AdminLayout'

const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Combos = lazy(() => import('./pages/Combos'))
const BundleDetail = lazy(() => import('./pages/BundleDetail'))
const About = lazy(() => import('./pages/About'))
const Farmers = lazy(() => import('./pages/Farmers'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Payment = lazy(() => import('./pages/Payment'))
const Account = lazy(() => import('./pages/Account'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'))
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'))
const AdminFarmers = lazy(() => import('./pages/admin/AdminFarmers'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function LoadingFallback() { return <div className="min-h-[40vh]" /> }

function AppLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 md:pb-0 pb-20">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/combos" element={<Combos />} />
            <Route path="/combos/:id" element={<BundleDetail />} />
            <Route path="/cart" element={<Navigate to="/checkout" replace />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Account initialTab="orders" /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account initialTab="account" /></ProtectedRoute>} />
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*" element={<div className="p-10 text-center text-slate-500">Page not found</div>} />
          </Routes>
        </Suspense>
      </main>
      <MobileBottomNav />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="farmers" element={<AdminFarmers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/*" element={<><ScrollToTop /><PageTracker /><AppLayout /></>} />
      </Routes>
    </Suspense>
  )
}
