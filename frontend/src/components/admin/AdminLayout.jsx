import { useEffect, useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { api } from '../../lib/api'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/categories', label: 'Categories', icon: '📁' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
  { to: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { to: '/admin/bundles', label: 'Combos', icon: '📦' },
  { to: '/admin/banners', label: 'Banners', icon: '🖼️' },
  { to: '/admin/farmers', label: 'Farmers', icon: '👨‍🌾' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession')
    if (!adminSession) {
      navigate('/admin/login', { replace: true })
      return
    }
    api.getAdminMe().then(() => {
      setVerifying(false)
    }).catch(() => {
      localStorage.removeItem('adminSession')
      toast.error('Session expired — please login again')
      navigate('/admin/login', { replace: true })
    })
  }, [navigate])

  useEffect(() => {
    setVerifying(true)
    api.getAdminMe().catch(() => {
      localStorage.removeItem('adminSession')
      navigate('/admin/login', { replace: true })
    }).finally(() => {
      setVerifying(false)
    })
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    toast.success('Logged out')
    navigate('/admin/login')
  }

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Verifying session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 z-50 h-full w-56 bg-slate-900 text-white shadow-xl md:block hidden overflow-y-auto">
        <div className="p-4 border-b border-slate-700">
          <h1 className="text-lg font-bold tracking-wide">HAiFarmer Admin</h1>
        </div>
        <nav className="p-2 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => {
                if (window.innerWidth < 768) {
                  document.querySelector('aside')?.classList.add('hidden')
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >{item.icon} {item.label}</NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition w-full py-2">
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg flex justify-around px-1 py-1">
        {navItems.slice(0, 5).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-semibold rounded-lg transition ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'
              }`
            }
          ><span className="text-lg">{item.icon}</span><span>{item.label}</span></NavLink>
        ))}
      </div>

      <main className="flex-1 md:ml-56 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
