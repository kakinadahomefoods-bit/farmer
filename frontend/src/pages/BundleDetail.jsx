import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useCart } from '../contexts/CartContext'

function calculateBundlePrice(bundle) {
  const total = (Array.isArray(bundle?.bundle_items) ? bundle.bundle_items : [])
    .reduce((sum, item) => sum + Number(item.variant?.price ?? 0) * Number(item.quantity || 1), 0)
  if (total > 0) {
    const discountPct = Number(bundle?.bundle_discount_percent || 0)
    return Number((total - total * discountPct / 100).toFixed(2))
  }
  return Number(bundle?.bundle_price || 0)
}

export default function BundleDetail() {
  const { id } = useParams()
  const { settings } = useSiteSettings()
  const { addToCart, removeFromCart, cartItems } = useCart()
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        const { supabase } = await import('../lib/supabase')
        const { data, error } = await supabase.from('bundles')
          .select('*, bundle_items(*, product:products(*), variant:product_variants(*))')
          .eq('id', id)
          .single()
        if (!error) setBundle(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" /></div>
  if (!bundle) return <div className="flex min-h-[60vh] items-center justify-center text-slate-500">Bundle not found</div>

  const imgSrc = getImageUrl(bundle.bundle_image_url || bundle.image_url, settings?.placeholder_image)
  const bundlePrice = calculateBundlePrice(bundle)
  const originalTotal = (bundle.bundle_items?.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0)) || 0
  const cartItem = cartItems?.find(item => item.bundle_id === bundle.id)
  const isInCart = Boolean(cartItem)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/combos" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">← Back to Combos</Link>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-slate-50">
          <img src={imgSrc} alt={bundle.bundle_name || bundle.name} className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">⭐ BEST VALUE</div>
          <h1 className="heading-font text-3xl font-extrabold text-slate-900">{bundle.bundle_name || bundle.name}</h1>
          {bundle.bundle_description && <p className="mt-4 leading-relaxed text-slate-600">{bundle.bundle_description}</p>}
          <div className="mt-4 flex items-end gap-3">
            {originalTotal > bundlePrice && <span className="heading-font text-lg text-slate-400 line-through">{formatPrice(originalTotal)}</span>}
            <span className="heading-font text-3xl font-extrabold text-green-700">{formatPrice(bundlePrice)}</span>
          </div>
          <p className="mt-2 text-sm text-slate-500">🚚 + shipping cost</p>

          <div className="mt-6 flex flex-nowrap gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 whitespace-nowrap">🌿 100% Natural</div>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 whitespace-nowrap">🚫 Chemical Free</div>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700 whitespace-nowrap">👨‍🌾 Direct from Farmers</div>
          </div>

          <button
            onClick={async () => {
              if (isInCart) await removeFromCart(cartItem.id)
              else await addToCart({ bundle_id: bundle.id, quantity: 1, bundle })
            }}
            className={`mt-6 w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 ${isInCart ? 'bg-red-600 hover:bg-red-700' : 'bg-green-700 hover:bg-green-800'}`}
          >{isInCart ? '🗑 Remove from cart' : '🛒 Add to cart'}</button>
        </div>
      </div>
    </div>
  )
}
