import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function calculateDiscountedPrice(price, discountPercent) {
  return discountPercent ? Number((price - price * discountPercent / 100).toFixed(2)) : price
}

export default function ProductCard({ product, compact = false }) {
  const { cartItems, addToCart, removeFromCart, updateQuantity, productSelections, setProductSelection } = useCart()
  const { settings } = useSiteSettings()

  const selection = productSelections?.[product.id] || {}
  const selectedVariantId = selection.variantId || product.product_variants?.[0]?.id
  const selectedVariant = product.product_variants?.find(v => v.id === selectedVariantId) || product.product_variants?.[0] || null

  const price = selectedVariant?.price ?? product.base_price ?? product.price
  const discountedPrice = calculateDiscountedPrice(price, product.discount_percent)

  const cartItem = cartItems?.find(item => item.product_id === product.id && item.variant_id === selectedVariantId)
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || selection.quantity || 1
  const imageUrl = getImageUrl(product.image_url || product.images?.[0], settings?.placeholder_image)

  const harvestTag = product.harvest_type || product.badge || (product.tags?.[0] === 'wild' ? 'WILD CRAFTED' : product.category_name || product.category || '')
  const descriptor = product.tagline || (product.description ? product.description.slice(0, 60) + (product.description.length > 60 ? '…' : '') : '')

  useEffect(() => {
    if (selectedVariant && !selection.variantId) {
      setProductSelection(product.id, { variantId: selectedVariant.id })
    }
  }, [product.id, selectedVariant?.id, selection.variantId, setProductSelection])

  const handleQuantityChange = async (newQty) => {
    if (cartItem) {
      if (newQty < 1) await removeFromCart(cartItem.id)
      else await updateQuantity(cartItem.id, newQty)
    }
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInCart) return
    await addToCart({ product_id: product.id, variant_id: selectedVariantId, quantity: 1, product, variant: selectedVariant })
  }

  return (
    <Link to={`/products/${slugify(product.name)}`} className="group relative flex h-full flex-col rounded-2xl bg-[#FBF8F1] shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
      {/* Image */}
      <div className="relative h-[180px] overflow-hidden bg-gradient-to-br from-sage-300/20 via-cream-50 to-sage-300/10">
        {product.discount_percent > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-terracotta-500 px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-cream-50 shadow-sm">{product.discount_percent}% off</span>
        )}
        <img src={imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { if (e.currentTarget.dataset.fallbackApplied !== 'true') { e.currentTarget.dataset.fallbackApplied = 'true'; e.currentTarget.src = settings?.placeholder_image || '/placeholder.jpg' } }} />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-3 pt-2.5 pb-3">
        {/* Harvest tag */}
        {harvestTag && (
          <span className="inline-block w-fit rounded-full bg-terracotta-500/10 px-2.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] uppercase text-terracotta-600">{harvestTag}</span>
        )}

        {/* Product name */}
        <h3 className="mt-1.5 font-heading text-base font-bold text-forest-900 leading-tight group-hover:text-terracotta-500 transition-colors">{product.name}</h3>

        {/* Descriptor */}
        {descriptor && (
          <p className="mt-0.5 text-[11px] text-forest-900/50 line-clamp-1">{descriptor}</p>
        )}

        {/* Price + quick add */}
        <div className="mt-auto flex items-end justify-between pt-2.5">
          <div>
            <span className="font-heading text-lg font-bold text-forest-900">{formatPrice(discountedPrice)}</span>
            {product.discount_percent > 0 && (
              <span className="ml-1.5 text-[10px] text-forest-900/40 line-through">{formatPrice(price)}</span>
            )}
          </div>

          {isInCart ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center rounded-lg border border-forest-900/10 bg-white">
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity - 1) }} className="px-2 py-1 text-forest-900/60 hover:bg-cream-100 text-xs disabled:opacity-50" disabled={cartQuantity <= 1}>−</button>
                <span className="min-w-[1.5rem] text-center text-xs font-semibold text-forest-900">{cartQuantity}</span>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity + 1) }} className="px-2 py-1 text-forest-900/60 hover:bg-cream-100 text-xs">+</button>
              </div>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(cartItem.id) }} className="btn-font rounded-lg border border-forest-900/10 bg-white px-2 py-1 text-[9px] font-semibold text-forest-900 hover:bg-forest-900 hover:text-cream-50 transition-all">✕</button>
            </div>
          ) : (
            <button onClick={handleQuickAdd}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-terracotta-500/40 text-terracotta-500 transition-all hover:bg-terracotta-500 hover:text-cream-50 hover:border-terracotta-500 active:scale-90"
              aria-label="Quick add">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
