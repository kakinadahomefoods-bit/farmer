import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { toast } from 'react-toastify'

function calculateBundlePrice(bundle) {
  const total = (Array.isArray(bundle?.bundle_items) ? bundle.bundle_items : [])
    .reduce((sum, item) => sum + Number(item.variant?.price ?? item.variant_price ?? item.price ?? item.unit_price ?? 0) * Number(item.quantity || 1), 0)
  if (total > 0) {
    const discountPct = Number(bundle?.bundle_discount_percent || 0)
    return Number((total - total * discountPct / 100).toFixed(2))
  }
  return Number(bundle?.bundle_price || 0)
}

export default function BundleCard({ bundle }) {
  const { addToCart, removeFromCart, cartItems, updateQuantity, bundleSelections, setBundleSelection } = useCart()
  const { settings } = useSiteSettings()
  const [showFullDesc, setShowFullDesc] = useState(false)

  const { description, contains } = (() => {
    const idx = (bundle.bundle_description || 'Complete combo offer').indexOf('[CONTAINS]')
    if (idx === -1) return { description: bundle.bundle_description || 'Complete combo offer', contains: '' }
    return {
      description: (bundle.bundle_description || '').substring(0, idx).trim(),
      contains: (bundle.bundle_description || '').substring(idx + 10).trim()
    }
  })()

  const originalTotal = (bundle.bundle_items?.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0)) || 0
  const bundlePrice = calculateBundlePrice(bundle)
  const cartItem = cartItems?.find(item => item.bundle_id === bundle.id)
  const isInCart = Boolean(cartItem)
  const quantity = cartItem?.quantity || bundleSelections?.[bundle.id]?.quantity || 1
  const productCount = bundle.bundle_items?.length || 0
  const savings = bundle.bundle_discount_percent > 0 && originalTotal > 0 ? Math.round(originalTotal - bundlePrice) : 0
  const discountPct = bundle.bundle_discount_percent > 0 ? Math.round(bundle.bundle_discount_percent) : 0

  const handleQuantityChange = async (newQty) => {
    if (newQty < 1) return
    if (cartItem) await updateQuantity(cartItem.id, newQty)
    else toast.info('Add to cart first')
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              <span>⭐</span> BEST VALUE
            </span>
            <span className="text-sm font-semibold text-slate-600">{productCount} Products</span>
          </div>
          <Link to={`/combos/${bundle.id}`} className="relative block overflow-hidden rounded-lg border border-slate-200">
            <img
              src={getImageUrl(bundle.bundle_image_url || bundle.image_url, settings?.placeholder_image)}
              alt={bundle.bundle_name || bundle.name}
              className="h-64 w-full object-cover transition-transform hover:scale-105"
              onError={(e) => { e.target.src = settings?.placeholder_image || 'https://placehold.co/600x400?text=Combo' }}
            />
            <span className="absolute top-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-green-700 px-4 py-1.5 text-sm font-bold text-white shadow-md">
              🛒 {productCount} Products
            </span>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Link to={`/combos/${bundle.id}`} className="hover:text-brand-700">
              <h2 className="text-2xl font-bold text-slate-900">{bundle.bundle_name || bundle.name}</h2>
            </Link>
            <div className="mt-1 text-sm text-slate-600">
              <div className="relative">
                <p className={showFullDesc ? '' : 'line-clamp-2'}>{description}</p>
                {!showFullDesc && description.length > 50 && (
                  <button onClick={(e) => { e.preventDefault(); setShowFullDesc(true) }} className="inline-block font-bold text-slate-500 hover:text-green-700 focus:outline-none" style={{ cursor: 'pointer' }}>...</button>
                )}
                {showFullDesc && (
                  <button onClick={(e) => { e.preventDefault(); setShowFullDesc(false) }} className="text-xs text-green-700 hover:underline font-semibold block mt-1">Show less</button>
                )}
              </div>
              {contains && (
                <div className="mt-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-green-700 font-bold">Contains: </span>{contains}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-nowrap gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1 sm:gap-2 rounded-lg bg-green-50 px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-medium text-green-700 whitespace-nowrap"><span>🌿</span> 100% Natural</div>
            <div className="flex items-center gap-1 sm:gap-2 rounded-lg bg-green-50 px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-medium text-green-700 whitespace-nowrap"><span>🚫</span> Chemical Free</div>
            <div className="flex items-center gap-1 sm:gap-2 rounded-lg bg-green-50 px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-medium text-green-700 whitespace-nowrap"><span>👨‍🌾</span> Direct from Farmers</div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4 mt-auto">
            <div className="space-y-1">
              {originalTotal > bundlePrice && <span className="block text-lg text-slate-500 line-through">{formatPrice(originalTotal)}</span>}
              <div className="flex items-center gap-2 flex-nowrap">
                <span className="text-3xl font-bold text-green-700">{formatPrice(bundlePrice)}</span>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-100">🚚 + shipping cost</span>
              </div>
              {savings > 0 && <p className="text-sm font-medium text-slate-600">Save {formatPrice(savings)} ({discountPct}%)</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white">
                <button type="button" onClick={() => handleQuantityChange(quantity - 1)} className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50" disabled={quantity <= 1}>−</button>
                <span className="min-w-[2rem] text-center font-semibold text-slate-900">{quantity}</span>
                <button type="button" onClick={() => handleQuantityChange(quantity + 1)} className="px-3 py-2 text-slate-600 hover:bg-slate-100">+</button>
              </div>
              <button
                onClick={async () => {
                  if (isInCart) {
                    await removeFromCart(cartItem.id)
                  } else {
                    await addToCart({
                      bundle_id: bundle.id,
                      quantity: quantity,
                      bundle: {
                        id: bundle.id,
                        bundle_name: bundle.bundle_name || bundle.name,
                        bundle_price: bundlePrice,
                        bundle_discount_percent: bundle.bundle_discount_percent,
                        bundle_image_url: bundle.bundle_image_url || bundle.image_url,
                        bundle_items: bundle.bundle_items || []
                      }
                    })
                  }
                }}
                className={`flex-1 rounded-lg py-2.5 font-semibold text-white transition ${isInCart ? 'bg-red-600 hover:bg-red-700' : 'bg-green-700 hover:bg-green-800'}`}
              >{isInCart ? '🗑 Remove' : '🛒 Add to cart'}</button>
            </div>

            <Link to={`/combos/${bundle.id}`} className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700 transition">
              View all {productCount} products →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
