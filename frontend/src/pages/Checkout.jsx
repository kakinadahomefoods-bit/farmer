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

  const paymentMethod = settings?.paymentMethod || (settings?.razorpayEnabled !== false ? 'both' : 'whatsapp')
  const showRazorpay = paymentMethod === 'both' || paymentMethod === 'razorpay'
  const showWhatsApp = paymentMethod === 'both' || paymentMethod === 'whatsapp'
  const total = totals?.finalTotal || 0
  const shippingCost = total >= 1499 ? 0 : (settings?.deliveryCharge || settings?.shipping_cost || settings?.delivery_charge_amount || 0)
  const totalWithShipping = total + shippingCost - (couponDiscount || 0)

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const cartPayload = cartItems.map(i => ({ isCombo: !!i.bundle_id || !!i.bundle, price: getItemPrice(i), quantity: i.quantity }))
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
    } catch (err) { setCouponError(err.message || 'Failed to apply coupon') }
    finally { setCouponLoading(false) }
  }

  const buildWhatsAppMessage = () => {
    const orderLines = cartItems.map(i => {
      const name = getItemName(i)
      const variant = getItemVariantName(i)
      const price = getItemPrice(i)
      return `${name}${variant ? ` (${variant})` : ''} × ${i.quantity} = ${formatPrice(price * i.quantity)}`
    })
    return [
      `🧾 *New HAiFarmer Order*`, ``,
      ...orderLines, ``,
      `━━━━━━━━━━━━━━`,
      `💰 Subtotal: ${formatPrice(total)}`,
      `🚚 Shipping: ${shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}`,
      couponDiscount > 0 ? `🎟️ Coupon (${appliedCoupon?.code}): -${formatPrice(couponDiscount)}` : null,
      `━━━━━━━━━━━━━━`,
      `💳 *Total: ${formatPrice(totalWithShipping)}*`,
      `💳 *Payment: WhatsApp*`, ``,
      `━━ 📋 Delivery Details ━━`,
      `👤 Name: ${delivery.name || 'Not provided'}`,
      `📱 Phone: ${delivery.phone || 'Not provided'}`,
      `📍 Address: ${delivery.address || 'Not provided'}`,
      `🏙️ City: ${delivery.city || 'Not provided'}`,
      `📮 Pincode: ${delivery.pincode || 'Not provided'}`,
    ].filter(Boolean).join('%0A')
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
        items: cartItems.map(i => ({ name: getItemName(i), variantName: getItemVariantName(i), price: getItemPrice(i), quantity: i.quantity })),
        total: totalWithShipping, shippingCost, couponDiscount,
        couponCode: appliedCoupon?.code || null, status: 'pending', paymentMethod: 'whatsapp',
        shippingAddress: delivery, guestInfo: delivery,
      })
      toast.success('Order placed! Check WhatsApp for confirmation.')
      navigate('/')
    } catch (err) { toast.error('Failed to save order, but message sent on WhatsApp.') }
  }

  const handleRazorpayPayment = async () => {
    if (!delivery.name || !delivery.phone || !delivery.address) {
      toast.error('Please fill in delivery details (name, phone, address)')
      return
    }
    try {
      const options = {
        key: settings?.razorpayKeyId || 'rzp_live_SeagFUXcQMCgdT',
        amount: Math.round(totalWithShipping * 100), currency: 'INR',
        name: settings?.storeName || 'HAiFarmer', description: 'Order Payment',
        handler: async (response) => {
          try {
            await api.createOrder({
              items: cartItems.map(i => ({ name: getItemName(i), variantName: getItemVariantName(i), price: getItemPrice(i), quantity: i.quantity })),
              total: totalWithShipping, shippingCost, couponDiscount,
              couponCode: appliedCoupon?.code || null,
              paymentId: response.razorpay_payment_id, status: 'pending', paymentMethod: 'razorpay',
              shippingAddress: delivery, guestInfo: delivery,
            })
            toast.success('Payment successful! Order placed.')
            navigate('/')
          } catch (err) { toast.error('Payment received but order failed. Please contact support.') }
        },
        prefill: { name: delivery.name, contact: delivery.phone, email: user?.email || '' },
        theme: { color: '#B65A34' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) { toast.error('Payment failed. Please try again.') }
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-12 text-center bg-cream-50">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-cream-100 text-forest-900/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2"/></svg>
        </div>
        <h2 className="font-heading text-2xl font-bold text-text-dark">Your cart is empty</h2>
        <p className="mt-2 text-forest-900/50">Add some fresh products to get started!</p>
        <Link to="/products" className="mt-6 btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-8 py-3.5 text-sm font-semibold tracking-[0.06em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-1 shadow-xl shadow-terracotta-500/20 btn-lift">Browse Products</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Breadcrumb */}
      <div className="bg-cream-100 border-b border-border-warm">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-xs text-forest-900/40">
            <Link to="/" className="hover:text-terracotta-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-forest-900/70 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <h1 className="font-heading mb-8 text-3xl font-bold text-text-dark sm:text-4xl tracking-tight">Secure Checkout</h1>
        <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="rounded-2xl border border-border-warm bg-white p-6 shadow-sm">
              <h2 className="font-heading mb-4 text-lg font-bold text-text-dark">Delivery Details</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={delivery.name} onChange={e => setDelivery(d => ({ ...d, name: e.target.value }))} placeholder="Full Name *"
                  className="rounded-xl border border-border-warm bg-white px-4 py-2.5 text-sm text-text-dark placeholder:text-forest-900/30 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20" />
                <input value={delivery.phone} onChange={e => setDelivery(d => ({ ...d, phone: e.target.value }))} placeholder="Phone *"
                  className="rounded-xl border border-border-warm bg-white px-4 py-2.5 text-sm text-text-dark placeholder:text-forest-900/30 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20" />
                <div className="sm:col-span-2">
                  <textarea value={delivery.address} onChange={e => setDelivery(d => ({ ...d, address: e.target.value }))} placeholder="Delivery Address *" rows={2}
                    className="w-full rounded-2xl border border-border-warm bg-white px-4 py-2.5 text-sm text-text-dark placeholder:text-forest-900/30 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20" />
                </div>
                <input value={delivery.city} onChange={e => setDelivery(d => ({ ...d, city: e.target.value }))} placeholder="City"
                  className="rounded-xl border border-border-warm bg-white px-4 py-2.5 text-sm text-text-dark placeholder:text-forest-900/30 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20" />
                <input value={delivery.pincode} onChange={e => setDelivery(d => ({ ...d, pincode: e.target.value }))} placeholder="Pincode"
                  className="rounded-xl border border-border-warm bg-white px-4 py-2.5 text-sm text-text-dark placeholder:text-forest-900/30 outline-none focus:border-terracotta-500 focus:ring-2 focus:ring-terracotta-500/20" />
              </div>
            </div>

            {/* Cart Items */}
            <h2 className="font-heading text-lg font-bold text-text-dark pl-1">Order Items ({cartItems.length})</h2>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-border-warm bg-white p-4 shadow-sm hover:shadow-md transition-all">
                  <img src={getImageUrl(getItemImage(item), settings?.placeholder_image)} alt={getItemName(item)}
                    className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-dark">{getItemName(item)}</h3>
                    {getItemVariantName(item) && <p className="text-xs text-forest-900/40">{getItemVariantName(item)}</p>}
                    <p className="mt-1 text-sm font-semibold text-terracotta-500">{formatPrice(getItemPrice(item))}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-warm text-forest-900/60 hover:bg-cream-100 transition-all">-</button>
                      <span className="min-w-[2rem] text-center text-sm font-semibold text-text-dark">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-warm text-forest-900/60 hover:bg-cream-100 transition-all">+</button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-auto text-xs font-semibold text-terracotta-500 hover:text-terracotta-600 transition-colors">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border border-border-warm bg-white p-6 shadow-sm h-fit sticky top-28">
            <h2 className="font-heading mb-4 text-xl font-bold text-text-dark">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-forest-900/50">Subtotal</span><span className="font-semibold text-text-dark">{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-forest-900/50">Shipping</span><span className={`font-semibold ${shippingCost === 0 ? 'text-forest-900' : ''}`}>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span></div>
              <div className="my-3 border-t border-border-warm" />

              {/* Coupon */}
              <div className="flex gap-2">
                <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code"
                  className="flex-1 rounded-xl border border-border-warm bg-white px-3 py-2.5 text-sm text-text-dark placeholder:text-forest-900/30 outline-none focus:border-terracotta-500" />
                <button onClick={handleApplyCoupon} disabled={couponLoading}
                  className="btn-font rounded-xl border border-terracotta-500/30 bg-terracotta-500/10 px-5 py-2.5 text-xs font-semibold text-terracotta-500 hover:bg-terracotta-500 hover:text-cream-50 transition-all disabled:opacity-50">{couponLoading ? '...' : 'Apply'}</button>
              </div>
              {couponError && <p className="text-xs text-terracotta-500">{couponError}</p>}
              {couponDiscount > 0 && <p className="text-xs text-forest-900 font-medium">Coupon discount: -{formatPrice(couponDiscount)}</p>}

              <div className="my-3 border-t border-border-warm" />
              <div className="flex justify-between text-lg"><span className="font-bold text-text-dark">Total</span><span className="font-heading font-bold text-terracotta-500">{formatPrice(totalWithShipping)}</span></div>
            </div>

            {showRazorpay && showWhatsApp ? (
              <div className="mt-4 space-y-3">
                <button onClick={handleRazorpayPayment} disabled={placing || cartItems.length === 0}
                  className="btn-font w-full rounded-2xl bg-terracotta-500 py-3.5 text-sm font-semibold tracking-[0.06em] uppercase text-cream-50 shadow-xl transition-all hover:bg-terracotta-600 hover:-translate-y-1 disabled:opacity-50 btn-lift flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16l-6.4 5.2L8 14l-6-4.8h7.6z"/></svg>
                  Pay with Razorpay
                </button>
                <div className="flex items-center gap-2"><span className="flex-1 border-t border-border-warm"></span><span className="text-xs text-forest-900/30">OR</span><span className="flex-1 border-t border-border-warm"></span></div>
                <button onClick={sendWhatsAppOrder} disabled={placing || cartItems.length === 0}
                  className="btn-font w-full rounded-2xl bg-forest-900 py-3.5 text-sm font-semibold tracking-[0.06em] uppercase text-cream-50 shadow-xl transition-all hover:bg-forest-950 hover:-translate-y-1 disabled:opacity-50 btn-lift">
                  Pay via WhatsApp
                </button>
              </div>
            ) : showRazorpay ? (
              <button onClick={handleRazorpayPayment} disabled={placing || cartItems.length === 0}
                className="btn-font mt-6 w-full rounded-2xl bg-terracotta-500 py-3.5 text-sm font-semibold tracking-[0.06em] uppercase text-cream-50 shadow-xl transition-all hover:bg-terracotta-600 hover:-translate-y-1 disabled:opacity-50 btn-lift flex items-center justify-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16l-6.4 5.2L8 14l-6-4.8h7.6z"/></svg>
                Pay with Razorpay
              </button>
            ) : (
              <button onClick={sendWhatsAppOrder} disabled={placing || cartItems.length === 0}
                className="btn-font mt-6 w-full rounded-2xl bg-forest-900 py-3.5 text-sm font-semibold tracking-[0.06em] uppercase text-cream-50 shadow-xl transition-all hover:bg-forest-950 hover:-translate-y-1 disabled:opacity-50 btn-lift">
                {placing ? 'Placing Order...' : 'Place Order via WhatsApp'}
              </button>
            )}

            <p className="mt-3 text-center text-xs text-forest-900/30">
              {paymentMethod === 'razorpay' ? 'Secure payment via Razorpay' : paymentMethod === 'whatsapp' ? 'You will be redirected to WhatsApp to confirm your order' : 'Choose your preferred payment method'}
            </p>

            {/* Trust badges */}
            <div className="mt-4 pt-4 border-t border-border-warm">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-cream-50 p-2"><p className="text-[10px] font-semibold text-forest-900">🔒 Secure Payment</p></div>
                <div className="rounded-xl bg-cream-50 p-2"><p className="text-[10px] font-semibold text-forest-900">🚚 Free Shipping</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
