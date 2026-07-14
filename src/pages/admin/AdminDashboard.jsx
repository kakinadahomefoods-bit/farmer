import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [bestSelling, setBestSelling] = useState([])
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, orders, products, sales] = await Promise.all([
          api.getOrderStats().catch(() => null),
          api.getRecentOrders().catch(() => []),
          api.getBestSelling().catch(() => []),
          api.getSalesGraph().catch(() => []),
        ])
        setStats(s)
        setRecentOrders(orders)
        setBestSelling(products)
        setSalesData(sales)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>

  const StatCard = ({ label, value, color }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color || 'text-slate-900'}`}>{value}</p>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Revenue" value={stats ? formatPrice(stats.totalRevenue) : '₹0'} color="text-green-600" />
        <StatCard label="Total Orders" value={stats?.totalOrders || 0} color="text-brand-700" />
        <StatCard label="Today's Orders" value={stats?.todayOrders || 0} />
        <StatCard label="Pending" value={stats?.pendingOrders || 0} color="text-amber-600" />
        <StatCard label="Delivered" value={stats?.deliveredOrders || 0} color="text-green-600" />
        <StatCard label="Cancelled" value={stats?.cancelledOrders || 0} color="text-red-600" />
        <StatCard label="Customers" value={stats?.totalCustomers || 0} />
        <StatCard label="Today Revenue" value={stats ? formatPrice(stats.todayRevenue) : '₹0'} color="text-emerald-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sales (30 days)</h2>
          {salesData.length > 0 ? (
            <div className="space-y-2">
              {salesData.slice(-14).map(d => (
                <div key={d._id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 shrink-0">{d._id}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div className="bg-brand-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (d.revenue / Math.max(...salesData.map(x => x.revenue))) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-20 text-right">{formatPrice(d.revenue)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">No sales data yet</p>}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Best Selling Products</h2>
          {bestSelling.length > 0 ? (
            <div className="space-y-3">
              {bestSelling.slice(0, 5).map(p => (
                <div key={p._id} className="flex items-center gap-3">
                  <img src={p.images?.[0] || '/placeholder.jpg'} alt={p.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">{formatPrice(p.basePrice)}</p>
                  </div>
                  <span className="text-xs font-bold text-brand-700">{p.totalSold || 0} sold</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-slate-500">No sales data yet</p>}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View All</Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 text-left text-xs text-slate-500 uppercase">
                <th className="pb-2 font-medium">Order</th><th className="pb-2 font-medium">Customer</th><th className="pb-2 font-medium">Items</th><th className="pb-2 font-medium">Total</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Date</th>
              </tr></thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} className="border-b border-slate-50">
                    <td className="py-2.5 font-medium text-slate-900">{order.orderNumber}</td>
                    <td className="py-2.5 text-slate-600">{order.user?.fullName || order.guestInfo?.name || 'Guest'}</td>
                    <td className="py-2.5 text-slate-600">{order.items?.length || 0}</td>
                    <td className="py-2.5 font-medium">{formatPrice(order.total)}</td>
                    <td className="py-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{order.status}</span>
                    </td>
                    <td className="py-2.5 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-slate-500">No orders yet</p>}
      </div>
    </div>
  )
}
