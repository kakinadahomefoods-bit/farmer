import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileBottomNav from './components/MobileBottomNav'
import FloatingWhatsApp from './components/FloatingWhatsApp'
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
const FarmerDetail = lazy(() => import('./pages/FarmerDetail'))
const Impact = lazy(() => import('./pages/Impact'))
const Journal = lazy(() => import('./pages/Journal'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'))
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'))
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'))
const AdminBundles = lazy(() => import('./pages/admin/AdminBundles'))
const AdminFarmers = lazy(() => import('./pages/admin/AdminFarmers'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'))

function LoadingFallback() { return <div className="min-h-[40vh]" /> }

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 md:pb-0 pb-20">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/farmers/:code" element={<FarmerDetail />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/combos" element={<Combos />} />
            <Route path="/combos/:slug" element={<BundleDetail />} />
            <Route path="/cart" element={<Navigate to="/checkout" replace />} />
            <Route path="/checkout" element={<Navigate to="/" replace />} />
            <Route path="/payment" element={<Navigate to="/" replace />} />
            <Route path="/orders" element={<Navigate to="/" replace />} />
            <Route path="/account" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/" replace />} />
            <Route path="*" element={<div className="p-10 text-center text-slate-500">Page not found</div>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
      <FloatingWhatsApp />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
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
          <Route path="bundles" element={<AdminBundles />} />
          <Route path="farmers" element={<AdminFarmers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="/*" element={<><ScrollToTop /><PageTracker /><AppLayout /></>} />
      </Routes>
    </Suspense>
  )
}
