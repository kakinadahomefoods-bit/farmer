import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
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

export default function BundleCard({ bundle, compact }) {
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
  const bundleFallback = generatePlaceholder('bundle', name)

  const handleQuantityChange = async (newQty) => {
    if (newQty < 1) return
    if (cartItem) await updateQuantity(cartItem.id, newQty)
    else toast.info('Add to cart first')
  }

  if (compact) {
    return (
      <div className="w-full rounded-xl border border-border bg-white overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 group">
        <Link to={`/combos/${slug}`} className="relative block overflow-hidden rounded-t-xl bg-white">
          <img src={getImageUrl(image, settings?.placeholder_image)} alt={name}
            className="aspect-[1/1] w-full object-cover object-center transition duration-500"
            loading="lazy"
            onError={(e) => { e.target.src = bundleFallback }} />
          {discountPct > 0 && (
            <span className="absolute top-3 left-3 rounded-full bg-sale px-2.5 py-0.5 text-[9px] font-semibold uppercase text-white shadow-sm">
              Save {discountPct}%
            </span>
          )}
          {productCount > 0 && (
            <span className="absolute top-3 right-3 rounded-full bg-ink/80 px-2.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
              {productCount} Items
            </span>
          )}
        </Link>
        <div className="p-3">
          <Link to={`/combos/${slug}`} className="hover:text-green-600 transition-colors">
            <h3 className="text-xs font-semibold text-ink line-clamp-1">{name}</h3>
          </Link>
          <p className="mt-0.5 text-[10px] text-muted line-clamp-2">{displayDesc}</p>
          <div className="mt-2 space-y-0.5">
            {originalTotal > bundlePrice && (
              <span className="block text-[10px] text-muted-light line-through">{formatPrice(originalTotal)}</span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-ink">{formatPrice(bundlePrice)}</span>
              {savings > 0 && (
                <span className="text-[9px] font-semibold text-sale">Save {formatPrice(savings)}</span>
              )}
            </div>
          </div>
          <div className="mt-2 flex gap-1.5">
            <button onClick={async () => {
                if (isInCart) await removeFromCart(cartItem.id)
                else await addToCart({ bundle_id: id, quantity, bundle: { _id: id, name, price: bundlePrice, discountPercent: discountPct, image, items, ...bundle } })
              }}
              className={`flex-1 rounded-lg py-1.5 text-[10px] font-semibold uppercase transition-all ${isInCart ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {isInCart ? 'Remove' : 'Add to Cart'}
            </button>
            <Link to={`/combos/${slug}`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted hover:text-green-600 hover:border-green-300 transition-all">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl border border-border bg-white overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-semibold uppercase text-green-600">Best Value</span>
            <span className="text-[11px] text-muted">{productCount} Products</span>
          </div>
          <Link to={`/combos/${slug}`} className="relative block overflow-hidden rounded-xl bg-white">
            <img src={getImageUrl(image, settings?.placeholder_image)} alt={name}
              className="aspect-[1/1] w-full object-cover object-center transition duration-500"
              onError={(e) => { e.target.src = bundleFallback }} />
            {productCount > 0 && (
              <span className="absolute top-3 left-3 rounded-full bg-ink/80 px-2.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">{productCount} Products</span>
            )}
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Link to={`/combos/${slug}`} className="hover:text-green-600 transition-colors">
              <h2 className="font-heading text-xl font-bold text-ink">{name}</h2>
            </Link>
            <div className="mt-2 text-sm text-muted">
              <div className="relative">
                <p className={showFullDesc ? '' : 'line-clamp-2'}>{displayDesc}</p>
                {!showFullDesc && displayDesc.length > 50 && (
                  <button onClick={(e) => { e.preventDefault(); setShowFullDesc(true) }} className="inline-block font-semibold text-green-600 hover:text-green-700">...</button>
                )}
                {showFullDesc && <button onClick={(e) => { e.preventDefault(); setShowFullDesc(false) }} className="text-xs text-green-600 hover:underline font-semibold block mt-1">Show less</button>}
              </div>
              {contains && (
                <div className="mt-2 text-xs font-medium text-muted bg-green-50 p-3 rounded-lg border border-border">
                  <span className="font-semibold text-ink">Contains: </span>{contains}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-nowrap gap-2 overflow-x-auto">
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-medium text-muted whitespace-nowrap">100% Natural</span>
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-medium text-muted whitespace-nowrap">Chemical Free</span>
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-medium text-muted whitespace-nowrap">Direct from Farmers</span>
          </div>

          <div className="space-y-3 border-t border-border pt-4 mt-auto">
            <div className="space-y-1">
              {originalTotal > bundlePrice && <span className="block text-base text-muted-light line-through">{formatPrice(originalTotal)}</span>}
              <div className="flex items-center gap-2 flex-nowrap">
                <span className="font-heading text-3xl font-bold text-ink">{formatPrice(bundlePrice)}</span>
                <span className="text-[10px] text-muted">+ shipping</span>
              </div>
              {savings > 0 && <p className="text-sm font-medium text-sale">Save {formatPrice(savings)} ({discountPct}%)</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-border bg-white">
                <button type="button" onClick={() => handleQuantityChange(quantity - 1)} className="px-3 py-2 text-muted hover:bg-green-50 disabled:opacity-50 text-sm" disabled={quantity <= 1}>−</button>
                <span className="min-w-[2rem] text-center text-sm font-semibold text-ink">{quantity}</span>
                <button type="button" onClick={() => handleQuantityChange(quantity + 1)} className="px-3 py-2 text-muted hover:bg-green-50 text-sm">+</button>
              </div>
              <button onClick={async () => {
                  if (isInCart) await removeFromCart(cartItem.id)
                  else await addToCart({ bundle_id: id, quantity, bundle: { _id: id, name, price: bundlePrice, discountPercent: discountPct, image, items, ...bundle } })
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold uppercase transition-all ${isInCart ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                {isInCart ? 'Remove' : 'Add to cart'}
              </button>
            </div>

            <Link to={`/combos/${slug}`} className="block text-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
              View all {productCount} products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
