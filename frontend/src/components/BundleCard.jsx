import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { toast } from 'react-toastify'

function calculateBundlePrice(bundle) {
  const items = bundle?.items || bundle?.bundle_items || []
  const total = items.reduce((sum, item) => sum + Number(item.price || item.variant?.price || item.variant_price || 0) * Number(item.quantity || 1), 0)
  if (total > 0) {
    const discountPct = Number(bundle?.discountPercent || bundle?.bundle_discount_percent || 0)
    return Number((total - total * discountPct / 100).toFixed(2))
  }
  return Number(bundle?.price || bundle?.bundle_price || 0)
}

export default function BundleCard({ bundle }) {
  const { addToCart, removeFromCart, cartItems, updateQuantity, bundleSelections, setBundleSelection } = useCart()
  const { settings } = useSiteSettings()
  const [showFullDesc, setShowFullDesc] = useState(false)

  const id = bundle._id || bundle.id
  const name = bundle.name || bundle.bundle_name
  const image = bundle.image || bundle.bundle_image_url || bundle.image_url
  const description = bundle.description || bundle.bundle_description || 'Complete combo offer'
  const discountPct = Math.round(bundle.discountPercent || bundle.bundle_discount_percent || 0)
  const items = bundle?.items || bundle?.bundle_items || []
  const slug = bundle.slug || id

  const { displayDesc, contains } = (() => {
    const idx = description.indexOf('[CONTAINS]')
    if (idx === -1) return { displayDesc: description, contains: '' }
    return { displayDesc: description.substring(0, idx).trim(), contains: description.substring(idx + 10).trim() }
  })()

  const originalTotal = items.reduce((sum, item) => sum + (item.price || item.variant?.price || 0) * item.quantity, 0) || 0
  const bundlePrice = calculateBundlePrice(bundle)
  const cartItem = cartItems?.find(item => item.bundle_id === id || item.bundle?._id === id)
  const isInCart = Boolean(cartItem)
  const quantity = cartItem?.quantity || bundleSelections?.[id]?.quantity || 1
  const productCount = items.length
  const savings = discountPct > 0 && originalTotal > 0 ? Math.round(originalTotal - bundlePrice) : 0

  const handleQuantityChange = async (newQty) => {
    if (newQty < 1) return
    if (cartItem) await updateQuantity(cartItem.id, newQty)
    else toast.info('Add to cart first')
  }

  return (
    <div className="w-full rounded-3xl border border-border-warm bg-white shadow-md overflow-hidden hover:shadow-xl transition">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-terracotta-500">
              Best Value
            </span>
            <span className="text-sm font-medium text-forest-900/60">{productCount} Products</span>
          </div>
          <Link to={`/combos/${slug}`} className="relative block overflow-hidden rounded-2xl border border-border-warm bg-cream-50">
            <img
              src={getImageUrl(image, settings?.placeholder_image)}
              alt={name}
              className="h-72 w-full object-cover transition duration-500 hover:scale-105"
              onError={(e) => { e.target.src = settings?.placeholder_image || 'https://placehold.co/600x400?text=Combo' }}
            />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-forest-900/90 px-4 py-1.5 text-sm font-semibold text-cream-50 backdrop-blur-sm">
              {productCount} Products
            </span>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Link to={`/combos/${slug}`} className="hover:text-terracotta-500 transition">
              <h2 className="font-heading text-2xl font-bold text-text-dark">{name}</h2>
            </Link>
            <div className="mt-2 text-sm text-forest-900/60">
              <div className="relative">
                <p className={showFullDesc ? '' : 'line-clamp-2'}>{displayDesc}</p>
                {!showFullDesc && displayDesc.length > 50 && (
                  <button onClick={(e) => { e.preventDefault(); setShowFullDesc(true) }} className="inline-block font-semibold text-terracotta-500 hover:text-terracotta-600">...</button>
                )}
                {showFullDesc && (
                  <button onClick={(e) => { e.preventDefault(); setShowFullDesc(false) }} className="text-xs text-terracotta-500 hover:underline font-semibold block mt-1">Show less</button>
                )}
              </div>
              {contains && (
                <div className="mt-2 text-xs font-medium text-forest-900/70 bg-cream-50 p-3 rounded-xl border border-border-warm">
                  <span className="font-semibold text-forest-900">Contains: </span>{contains}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-nowrap gap-2 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-1 rounded-lg bg-sage-300/20 px-3 py-1.5 text-[10px] font-medium text-forest-900 whitespace-nowrap">100% Natural</div>
            <div className="flex items-center gap-1 rounded-lg bg-sage-300/20 px-3 py-1.5 text-[10px] font-medium text-forest-900 whitespace-nowrap">Chemical Free</div>
            <div className="flex items-center gap-1 rounded-lg bg-sage-300/20 px-3 py-1.5 text-[10px] font-medium text-forest-900 whitespace-nowrap">Direct from Farmers</div>
          </div>

          <div className="space-y-3 border-t border-border-warm pt-4 mt-auto">
            <div className="space-y-1">
              {originalTotal > bundlePrice && <span className="block text-base text-forest-900/40 line-through">{formatPrice(originalTotal)}</span>}
              <div className="flex items-center gap-2 flex-nowrap">
                <span className="font-heading text-3xl font-bold text-forest-900">{formatPrice(bundlePrice)}</span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sage-300/20 px-3 py-0.5 text-[10px] font-semibold text-forest-900/70">+ shipping</span>
              </div>
              {savings > 0 && <p className="text-sm font-medium text-terracotta-500">Save {formatPrice(savings)} ({discountPct}%)</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-border-warm bg-white">
                <button type="button" onClick={() => handleQuantityChange(quantity - 1)} className="px-3 py-2 text-forest-900/60 hover:bg-cream-100 disabled:opacity-50 text-sm" disabled={quantity <= 1}>−</button>
                <span className="min-w-[2rem] text-center text-sm font-semibold text-text-dark">{quantity}</span>
                <button type="button" onClick={() => handleQuantityChange(quantity + 1)} className="px-3 py-2 text-forest-900/60 hover:bg-cream-100 text-sm">+</button>
              </div>
              <button
                onClick={async () => {
                  if (isInCart) {
                    await removeFromCart(cartItem.id)
                  } else {
                    await addToCart({
                      bundle_id: id,
                      quantity: quantity,
                      bundle: { _id: id, name, price: bundlePrice, discountPercent: discountPct, image, items, ...bundle }
                    })
                  }
                }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold tracking-[0.05em] uppercase transition ${isInCart ? 'bg-forest-900/10 text-forest-900 hover:bg-forest-900 hover:text-cream-50' : 'bg-terracotta-500 text-cream-50 hover:bg-terracotta-600'}`}
              >{isInCart ? 'Remove' : 'Add to cart'}</button>
            </div>

            <Link to={`/combos/${slug}`} className="block text-center text-sm font-medium text-terracotta-500 hover:text-terracotta-600 transition">
              View all {productCount} products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
