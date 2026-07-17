import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { applyCoupon, getCouponDiscount } from '../lib/couponService'
import { api } from '../lib/api'
import { toast } from 'react-toastify'

const WHATSAPP_NUMBER = '9709704563'

function getItemName(item) {
  if (item.bundle) return item.bundle.bundle_name || item.bundle.name || 'Bundle'
  return item.product?.name || 'Product'
}

function getItemPrice(item) {
  if (item.bundle) return item.bundle.bundle_price || 0
  return item.variant?.price || item.product?.price || 0
}

function getItemImage(item) {
  if (item.bundle) return item.bundle.bundle_image_url || item.bundle.image_url
  return item.product?.image_url
}

function getItemVariantName(item) {
  return item.variant?.weight_label || item.variant?.name || ''
}

export default function Checkout() {
  const { user } = useAuth()
  const { cartItems, removeFromCart, updateQuantity, totals } = useCart()
  const { settings } = useSiteSettings()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [delivery, setDelivery] = useState({
    name: user?.fullName || user?.user_metadata?.full_name || '',
    phone: user?.phone || user?.user_metadata?.phone || '',
    address: '',
    city: '',
    pincode: '',
  })

  const razorpayEnabled = settings?.razorpayEnabled !== false

  const total = totals?.finalTotal || 0
  const shippingCost = total >= 1499 ? 0 : (settings?.deliveryCharge || settings?.shipping_cost || settings?.delivery_charge_amount || 0)
  const totalWithShipping = total + shippingCost - (couponDiscount || 0)

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const cartPayload = cartItems.map(i => ({
        isCombo: !!i.bundle_id || !!i.bundle,
        price: getItemPrice(i),
        quantity: i.quantity,
      }))
      const result = await applyCoupon(coupon, total, cartPayload)
      if (result.valid) {
        const discount = getCouponDiscount(result.coupon, total)
        setCouponDiscount(discount)
        setAppliedCoupon(result.coupon)
        toast.success(`Coupon applied! You save ${formatPrice(discount)}`)
      } else {
        setCouponError(result.error || 'Invalid coupon')
        setCouponDiscount(0)
        setAppliedCoupon(null)
      }
    } catch (err) {
      setCouponError(err.message || 'Failed to apply coupon')
    } finally {
      setCouponLoading(false)
    }
  }

  const buildWhatsAppMessage = () => {
    const orderLines = cartItems.map(i => {
      const name = getItemName(i)
      const variant = getItemVariantName(i)
      const price = getItemPrice(i)
      return `${name}${variant ? ` (${variant})` : ''} × ${i.quantity} = ${formatPrice(price * i.quantity)}`
    })
    const lines = [
      `🧾 *New HAiFarmer Order*`,
      ``,
      ...orderLines,
      ``,
      `━━━━━━━━━━━━━━`,
      `💰 Subtotal: ${formatPrice(total)}`,
      `🚚 Shipping: ${shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}`,
      couponDiscount > 0 ? `🎟️ Coupon (${appliedCoupon?.code}): -${formatPrice(couponDiscount)}` : null,
      `━━━━━━━━━━━━━━`,
      `💳 *Total: ${formatPrice(totalWithShipping)}*`,
      `💳 *Payment: WhatsApp / Cash on Delivery*`,
      ``,
      `━━ 📋 Delivery Details ━━`,
      `👤 Name: ${delivery.name || 'Not provided'}`,
      `📱 Phone: ${delivery.phone || 'Not provided'}`,
      `📍 Address: ${delivery.address || 'Not provided'}`,
      `🏙️ City: ${delivery.city || 'Not provided'}`,
      `📮 Pincode: ${delivery.pincode || 'Not provided'}`,
    ].filter(Boolean).join('%0A')
    return lines
  }

  const sendWhatsAppOrder = async () => {
    if (!delivery.name || !delivery.phone || !delivery.address) {
      toast.error('Please fill in delivery details (name, phone, address)')
      return
    }
    const message = buildWhatsAppMessage()
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
    try {
      await api.createOrder({
        items: cartItems.map(i => ({
          name: getItemName(i),
          variantName: getItemVariantName(i),
          price: getItemPrice(i),
          quantity: i.quantity
        })),
        total: totalWithShipping,
        shippingCost,
        couponDiscount,
        couponCode: appliedCoupon?.code || null,
        status: 'pending',
        paymentMethod: 'whatsapp',
        shippingAddress: delivery,
        guestInfo: delivery,
      })
      toast.success('Order placed! Check WhatsApp for confirmation.')
      navigate('/')
    } catch (err) {
      toast.error('Failed to save order, but message sent on WhatsApp.')
    }
  }

  const handleRazorpayPayment = async () => {
    if (!delivery.name || !delivery.phone || !delivery.address) {
      toast.error('Please fill in delivery details (name, phone, address)')
      return
    }
    try {
      const options = {
        key: settings?.razorpayKeyId || 'rzp_live_SeagFUXcQMCgdT',
        amount: Math.round(totalWithShipping * 100),
        currency: 'INR',
        name: settings?.storeName || 'HAiFarmer',
        description: 'Order Payment',
        handler: async (response) => {
          try {
            await api.createOrder({
              items: cartItems.map(i => ({
                name: getItemName(i),
                variantName: getItemVariantName(i),
                price: getItemPrice(i),
                quantity: i.quantity
              })),
              total: totalWithShipping,
              shippingCost,
              couponDiscount,
              couponCode: appliedCoupon?.code || null,
              paymentId: response.razorpay_payment_id,
              status: 'pending',
              paymentMethod: 'razorpay',
              shippingAddress: delivery,
              guestInfo: delivery,
            })
            toast.success('Payment successful! Order placed.')
            navigate('/')
          } catch (err) {
            toast.error('Payment received but order failed. Please contact support.')
          }
        },
        prefill: { name: delivery.name, contact: delivery.phone, email: user?.email || '' },
        theme: { color: '#16a34a' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error('Payment failed. Please try again.')
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12"><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="heading-font text-2xl font-extrabold text-slate-900">Your cart is empty</h2>
        <p className="mt-2 text-slate-500">Add some fresh products to get started!</p>
        <Link to="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700 transition">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="heading-font mb-8 text-3xl font-extrabold text-slate-900">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="heading-font mb-4 text-lg font-extrabold text-slate-900">Delivery Details</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={delivery.name} onChange={e => setDelivery(d => ({ ...d, name: e.target.value }))} placeholder="Full Name *" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input value={delivery.phone} onChange={e => setDelivery(d => ({ ...d, phone: e.target.value }))} placeholder="Phone *" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <div className="sm:col-span-2">
                <textarea value={delivery.address} onChange={e => setDelivery(d => ({ ...d, address: e.target.value }))} placeholder="Delivery Address *" rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              </div>
              <input value={delivery.city} onChange={e => setDelivery(d => ({ ...d, city: e.target.value }))} placeholder="City" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
              <input value={delivery.pincode} onChange={e => setDelivery(d => ({ ...d, pincode: e.target.value }))} placeholder="Pincode" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500" />
            </div>
          </div>

          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)} className="h-20 w-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{getItemName(item)}</h3>
                  {getItemVariantName(item) && <p className="text-xs text-slate-500">{getItemVariantName(item)}</p>}
                  <p className="mt-1 text-sm font-semibold text-brand-700">{formatPrice(getItemPrice(item))}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">-</button>
                    <span className="min-w-[2rem] text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-auto text-xs font-semibold text-red-500 hover:text-red-700">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm h-fit sticky top-24">
          <h2 className="heading-font mb-4 text-xl font-extrabold text-slate-900">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-bold">{formatPrice(total)}</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Shipping</span><span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : ''}`}>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span></div>

            <div className="my-3 border-t border-slate-100" />

            <div className="flex gap-2">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none" />
              <button onClick={handleApplyCoupon} disabled={couponLoading} className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 transition disabled:opacity-50">{couponLoading ? '...' : 'Apply'}</button>
            </div>
            {couponError && <p className="text-xs text-red-500">{couponError}</p>}
            {couponDiscount > 0 && <p className="text-xs text-green-600">Coupon discount: -{formatPrice(couponDiscount)}</p>}

            <div className="my-3 border-t border-slate-100" />

            <div className="flex justify-between text-lg"><span className="font-extrabold text-slate-900">Total</span><span className="heading-font font-extrabold text-brand-700">{formatPrice(totalWithShipping)}</span></div>
          </div>

          {razorpayEnabled ? (
            <div className="mt-4 space-y-3">
              <button onClick={handleRazorpayPayment} disabled={placing || cartItems.length === 0} className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-700 hover:-translate-y-0.5 transition disabled:opacity-50">
                Pay with Razorpay
              </button>
              <div className="flex items-center gap-2">
                <span className="flex-1 border-t border-slate-200"></span>
                <span className="text-xs text-slate-400">OR</span>
                <span className="flex-1 border-t border-slate-200"></span>
              </div>
              <button onClick={sendWhatsAppOrder} disabled={placing || cartItems.length === 0} className="w-full rounded-xl bg-green-500 py-3 text-sm font-bold text-white shadow-lg hover:bg-green-600 hover:-translate-y-0.5 transition disabled:opacity-50">
                💬 Pay via WhatsApp
              </button>
            </div>
          ) : (
            <button onClick={sendWhatsAppOrder} disabled={placing || cartItems.length === 0} className="mt-6 w-full rounded-xl bg-green-500 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-green-600 hover:-translate-y-0.5 transition disabled:opacity-50">
              {placing ? 'Placing Order...' : '💬 Place Order via WhatsApp'}
            </button>
          )}

          <p className="mt-3 text-center text-xs text-slate-400">
            {razorpayEnabled ? 'Choose your preferred payment method' : 'You will be redirected to WhatsApp to confirm your order'}
          </p>
        </div>
      </div>
    </div>
  )
}