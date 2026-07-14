import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../lib/utils'

const WHATSAPP_NUMBER = '9709704563'

export default function Account() {
  const { user, signOut } = useAuth()
  const { cartItems, totals } = useCart()
  const [activeTab, setActiveTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      setLoadingOrders(true)
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => { setOrders(data || []); setLoadingOrders(false) })
        .catch(() => setLoadingOrders(false))
    }
  }, [activeTab, user])

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'orders', label: 'Orders' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="heading-font mb-8 text-3xl font-extrabold text-slate-900">My Account</h1>
      <div className="grid gap-8 lg:grid-cols-[250px,1fr]">
        <div className="flex flex-row gap-2 lg:flex-col">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-left transition ${activeTab === tab.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}>{tab.label}</button>
          ))}
          <button onClick={signOut} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-left text-red-600 hover:bg-red-50 transition mt-auto">Logout</button>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          {activeTab === 'profile' && (
            <div>
              <h2 className="heading-font text-xl font-extrabold text-slate-900">Profile</h2>
              <p className="mt-2 text-sm text-slate-600">Email: {user?.email || 'N/A'}</p>
              <p className="mt-1 text-sm text-slate-600">Phone: {user?.phone || 'N/A'}</p>
            </div>
          )}
          {activeTab === 'orders' && (
            <div>
              <h2 className="heading-font text-xl font-extrabold text-slate-900">Orders</h2>
              {loadingOrders ? (
                <div className="mt-4 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
              ) : orders.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No orders yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex justify-between text-sm"><span className="font-bold text-slate-900">Order #{order.id.slice(0, 8)}</span><span className={`font-semibold ${order.status === 'delivered' ? 'text-green-600' : order.status === 'cancelled' ? 'text-red-600' : 'text-amber-600'}`}>{order.status}</span></div>
                      <p className="mt-1 text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="mt-1 text-sm font-bold text-brand-700">{formatPrice(order.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'contact' && (
            <div>
              <h2 className="heading-font text-xl font-extrabold text-slate-900">Contact Us</h2>
              <p className="mt-2 text-sm text-slate-600">Need help? Reach out to us on WhatsApp.</p>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello HAiFarmer, I need help.')}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-green-500 px-6 py-3 text-sm font-bold text-white hover:bg-green-600 transition">💬 Chat on WhatsApp</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
