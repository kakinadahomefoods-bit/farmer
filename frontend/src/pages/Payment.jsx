import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice } from '../lib/utils'
import { createOrder } from '../lib/orderService'
import { toast } from 'react-toastify'

function getItemName(item) {
  if (item.bundle) return item.bundle.bundle_name || item.bundle.name || 'Bundle'
  return item.product?.name || 'Product'
}

function getItemPrice(item) {
  if (item.bundle) return item.bundle.bundle_price || 0
  return item.variant?.price || item.product?.price || 0
}

function getItemVariantName(item) {
  return item.variant?.weight_label || item.variant?.name || ''
}

export default function Payment() {
  const { user } = useAuth()
  const { cartItems, totals } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)

  const total = totals?.finalTotal || 0
  const shippingCost = total >= 1499 ? 0 : (settings?.shipping_cost || settings?.delivery_charge_amount || 0)
  const totalWithShipping = total + shippingCost

  const handlePayment = async () => {
    setProcessing(true)
    try {
      const options = {
        key: 'rzp_live_SeagFUXcQMCgdT',
        amount: Math.round(totalWithShipping * 100),
        currency: 'INR',
        name: settings?.store_name || 'HAiFarmer',
        description: 'Order Payment',
        handler: async (response) => {
          try {
            await createOrder({
              user_id: user?.id || null,
              items: cartItems.map(i => ({
                product_id: i.product_id,
                variant_id: i.variant_id,
                bundle_id: i.bundle_id,
                name: getItemName(i),
                variant_name: getItemVariantName(i),
                price: getItemPrice(i),
                quantity: i.quantity
              })),
              total: totalWithShipping,
              shipping_cost: shippingCost,
              payment_id: response.razorpay_payment_id,
              status: 'paid',
              payment_method: 'razorpay',
            })
            toast.success('Payment successful! Order placed.')
            navigate('/')
          } catch (err) {
            toast.error('Payment received but order failed. Please contact support.')
          }
        },
        prefill: { email: user?.email || '', phone: user?.phone || '' },
        theme: { color: '#16a34a' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="heading-font mb-8 text-3xl font-extrabold text-slate-900">Payment</h1>
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-100 bg-white p-8 shadow-sm text-center">
        <p className="text-slate-600">Total amount: <span className="heading-font font-extrabold text-brand-700 text-xl">{formatPrice(totalWithShipping)}</span></p>
        <button onClick={handlePayment} disabled={processing || cartItems.length === 0} className="mt-6 w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-700 transition disabled:opacity-50">
          {processing ? 'Processing...' : 'Pay with Razorpay'}
        </button>
      </div>
    </div>
  )
}
