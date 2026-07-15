import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { formatPrice } from '../../lib/utils'
import { toast } from 'react-toastify'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (statusFilter) params.status = statusFilter
      const result = await api.getOrders(params)
      setOrders(result.data || [])
      setTotal(result.total || 0)
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [page, statusFilter])

  const handleStatusChange = async (id, status) => {
    try { await api.updateOrderStatus(id, status); toast.success(`Order ${status}`); load() }
    catch (err) { toast.error(err.message) }
  }

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Orders</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 hide-scrollbar">
        <button onClick={() => { setStatusFilter(''); setPage(1) }} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${!statusFilter ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
        {statuses.map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${statusFilter === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500 uppercase">
                <th className="p-3 font-medium">Order #</th><th className="p-3 font-medium">Customer</th><th className="p-3 font-medium">Items</th><th className="p-3 font-medium">Total</th><th className="p-3 font-medium">Payment</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-3 font-mono text-xs font-medium text-slate-900">{order.orderNumber}</td>
                    <td className="p-3 text-slate-600">{order.user?.fullName || order.guestInfo?.name || 'Guest'}<br /><span className="text-[10px] text-slate-400">{order.user?.email || order.guestInfo?.phone || ''}</span></td>
                    <td className="p-3 text-slate-600">{order.items?.length || 0}</td>
                    <td className="p-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>{order.paymentStatus}</span>
                    </td>
                    <td className="p-3">
                      <select value={order.status} onChange={e => handleStatusChange(order._id, e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none">
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button onClick={() => setSelected(selected?._id === order._id ? null : order)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">{selected?._id === order._id ? 'Hide' : 'View'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-3">Order {selected.orderNumber}</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Customer:</span> <span className="font-medium">{selected.user?.fullName || selected.guestInfo?.name || 'Guest'}</span></div>
                <div><span className="text-slate-500">Payment:</span> <span className="font-medium">{selected.paymentMethod}</span></div>
                <div><span className="text-slate-500">Subtotal:</span> <span className="font-medium">{formatPrice(selected.subtotal)}</span></div>
                <div><span className="text-slate-500">Shipping:</span> <span className="font-medium">{formatPrice(selected.shippingCost)}</span></div>
                <div><span className="text-slate-500">Discount:</span> <span className="font-medium">-{formatPrice(selected.couponDiscount)}</span></div>
                <div><span className="text-slate-500">Total:</span> <span className="font-bold text-brand-700">{formatPrice(selected.total)}</span></div>
              </div>
              {selected.items?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Items</p>
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm border-b border-slate-50 pb-2">
                      <span className="flex-1">{item.name} {item.variantName ? `(${item.variantName})` : ''}</span>
                      <span className="text-slate-500">×{item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {total > 20 && (
            <div className="mt-4 flex justify-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Previous</button>
              <span className="flex items-center px-3 text-sm text-slate-600">Page {page} of {Math.ceil(total / 20)}</span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
