import { useState, useEffect } from 'react'
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

export default function ProductCard({ product }) {
  const { cartItems, addToCart, removeFromCart, updateQuantity, productSelections, setProductSelection } = useCart()
  const { settings } = useSiteSettings()

  const variants = product.product_variants || product.variants || []
  const hasVariants = variants.length > 1

  const selection = productSelections?.[product.id] || {}
  const selectedVariantId = selection.variantId || variants?.[0]?.id || variants?.[0]?._id
  const selectedVariant = variants.find(v => (v.id || v._id) === selectedVariantId) || variants?.[0] || null

  const price = selectedVariant?.price ?? product.base_price ?? product.price
  const mrp = selectedVariant?.original_price ?? selectedVariant?.originalPrice ?? selectedVariant?.mrp ?? product.mrp ?? price
  const savings = mrp - price
  const discountPercent = product.discount_percent || (mrp > price ? Math.round((savings / mrp) * 100) : 0)

  const cartItem = cartItems?.find(item => item.product_id === product.id && item.variant_id === selectedVariantId)
  const isInCart = Boolean(cartItem)
  const cartQuantity = cartItem?.quantity || selection.quantity || 1
  const imageUrl = getImageUrl(product.image_url || product.images?.[0], settings?.placeholder_image)

  const categoryTag = product.category_tag || product.harvest_type || product.badge || product.category_name || (product.category?.name) || ''
  const descriptor = product.tagline || (product.description ? product.description.slice(0, 80) + (product.description.length > 80 ? '…' : '') : '')
  const rating = product.rating ?? 0
  const reviewCount = product.reviewCount ?? 0

  const isBestSeller = product.isBestSeller || product.is_best_seller || product.totalSold > 50 || false
  const isSale = discountPercent > 0

  useEffect(() => {
    if (selectedVariant && !selection.variantId) {
      setProductSelection(product.id, { variantId: selectedVariant.id || selectedVariant._id })
    }
  }, [product.id, selectedVariant?.id, selectedVariant?._id, selection.variantId, setProductSelection])

  const handleVariantChange = (variantId) => {
    setProductSelection(product.id, { variantId })
  }

  const handleQuantityChange = async (newQty) => {
    if (cartItem) {
      if (newQty < 1) await removeFromCart(cartItem.id)
      else await updateQuantity(cartItem.id, newQty)
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCart({ product_id: product.id, variant_id: selectedVariantId, quantity: 1, product, variant: selectedVariant })
  }

  return (
    <Link to={`/products/${slugify(product.name)}`} className="group relative flex h-full flex-col bg-white rounded-xl border border-border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
      {/* Badge */}
      {isBestSeller && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-green-600 px-3 py-1 text-[11px] font-semibold uppercase text-white shadow-sm">Best Seller</span>
      )}
      {isSale && !isBestSeller && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-sale px-3 py-1 text-[11px] font-semibold uppercase text-white shadow-sm">{discountPercent}% Off</span>
      )}

      {/* Image */}
      <div className="aspect-[1/1] overflow-hidden rounded-t-xl bg-white">
        <img src={imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { if (e.currentTarget.dataset.fallbackApplied !== 'true') { e.currentTarget.dataset.fallbackApplied = 'true'; e.currentTarget.src = settings?.placeholder_image || '/placeholder.jpg' } }} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 pb-5">
        {/* Category tag */}
        {categoryTag && (
          <span className="text-[12px] font-medium text-green-600 uppercase tracking-[0.08em]">{categoryTag}</span>
        )}

        {/* Product name */}
        <h3 className="mt-1 text-lg font-bold text-ink leading-snug line-clamp-2 group-hover:text-green-600 transition-colors">{product.name}</h3>

        {/* Descriptor */}
        {descriptor && (
          <p className="mt-0.5 text-[13px] text-muted line-clamp-1">{descriptor}</p>
        )}

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex text-green-600">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={`text-[13px] ${s <= Math.round(rating) ? 'text-green-600' : 'text-border'}`}>★</span>
              ))}
            </div>
            <span className="text-[12px] text-muted">({reviewCount})</span>
          </div>
        )}

        {/* Variant selector */}
        {hasVariants && (
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map(v => {
              const vid = v.id || v._id
              const isSelected = vid === selectedVariantId
              return (
                <button key={vid} type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVariantChange(vid) }}
                  className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all border ${isSelected ? 'bg-green-600 text-white border-green-600' : 'bg-white text-muted border-border hover:border-green-300 hover:text-green-600'}`}>
                  {v.weight_label || v.weightLabel || v.name || v.unit}
                </button>
              )
            })}
          </div>
        )}

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2 flex-wrap">
          <span className="text-xl font-bold text-ink">{formatPrice(price)}</span>
          {mrp > price && (
            <>
              <span className="text-[13px] text-muted-light line-through">{formatPrice(mrp)}</span>
              <span className="text-[12px] font-semibold text-sale">Save {formatPrice(savings)}/-</span>
            </>
          )}
        </div>

        {/* Add to cart / quantity stepper */}
        <div className="mt-auto pt-4">
          {isInCart ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-white overflow-hidden">
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity - 1) }} className="flex items-center justify-center w-11 h-11 text-muted hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50" disabled={cartQuantity <= 1}>−</button>
              <span className="min-w-[2.5rem] text-center text-sm font-semibold text-ink">{cartQuantity} <span className="text-[12px] text-muted font-normal">in cart</span></span>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuantityChange(cartQuantity + 1) }} className="flex items-center justify-center w-11 h-11 text-muted hover:bg-green-50 hover:text-green-600 transition-colors">+</button>
            </div>
          ) : (
            <button onClick={handleAddToCart}
              className="w-full rounded-lg bg-green-600 px-5 py-3.5 text-[13px] font-semibold uppercase text-white transition-all hover:bg-green-700 active:scale-[0.98]">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
