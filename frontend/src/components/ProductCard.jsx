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

  return (
    <div className={`group flex h-full flex-col rounded-2xl border border-border-warm bg-white shadow-sm transition hover:shadow-lg ${compact ? '' : 'p-3'}`}>
      <Link
        to={`/products/${slugify(product.name)}`}
        className={`relative block overflow-hidden rounded-xl bg-gradient-to-br from-sage-300/20 via-cream-50 to-sage-300/10 ${compact ? 'h-[150px]' : 'h-[280px]'}`}
      >
        {product.discount_percent > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-terracotta-500 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-cream-50 shadow-sm">
            {product.discount_percent}% off
          </span>
        )}
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="block h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            if (e.currentTarget.dataset.fallbackApplied !== 'true') {
              e.currentTarget.dataset.fallbackApplied = 'true'
              e.currentTarget.src = settings?.placeholder_image || '/placeholder.jpg'
            }
          }}
        />
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? 'px-2 pt-3 pb-2' : 'px-1 pt-3 pb-1'}`}>
        <Link to={`/products/${slugify(product.name)}`}>
          <h3 className={`line-clamp-2 font-medium text-text-dark ${compact ? 'text-sm' : 'text-base'} leading-tight`}>
            {product.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex items-end justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`font-semibold text-text-dark ${compact ? 'text-base' : 'text-xl'}`}>{formatPrice(discountedPrice)}</span>
            <span className="text-[9px] font-medium text-forest-900/50">+ shipping</span>
            {product.discount_percent > 0
              ? <span className="text-[10px] font-medium text-forest-900/40 line-through">{formatPrice(price)}</span>
              : <span className="text-[10px] font-medium text-forest-900/60">Farm fresh</span>
            }
          </div>
          {product.category && (
            <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-terracotta-500">{product.category}</span>
          )}
        </div>

        <div className="mt-2 min-h-[28px]">
          {product.product_variants && product.product_variants.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {product.product_variants.map(variant => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    const existingCartItem = cartItems?.find(item => item.product_id === product.id && item.variant_id === variant.id)
                    setProductSelection(product.id, { variantId: variant.id, quantity: existingCartItem?.quantity || 1 })
                  }}
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold transition ${selectedVariantId === variant.id ? 'bg-forest-900 text-cream-50' : 'bg-cream-100 text-forest-900/60 hover:bg-cream-200'}`}
                >
                  {variant.weight_label || variant.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-2">
          {isInCart ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-border-warm bg-white">
                <button type="button" onClick={() => handleQuantityChange(cartQuantity - 1)} className="px-3 py-1.5 text-forest-900/60 hover:bg-cream-100 disabled:opacity-50 text-sm" disabled={cartQuantity <= 1}>−</button>
                <span className="min-w-[2rem] text-center text-sm font-semibold text-text-dark">{cartQuantity}</span>
                <button type="button" onClick={() => handleQuantityChange(cartQuantity + 1)} className="px-3 py-1.5 text-forest-900/60 hover:bg-cream-100 text-sm">+</button>
              </div>
              <button onClick={() => removeFromCart(cartItem.id)} className="flex-1 rounded-lg bg-forest-900/10 px-3 py-1.5 text-xs font-semibold text-forest-900 hover:bg-forest-900 hover:text-cream-50 transition">Remove</button>
            </div>
          ) : (
            <button
              onClick={async () => {
                await addToCart({
                  product_id: product.id,
                  variant_id: selectedVariantId,
                  quantity: 1,
                  product: product,
                  variant: selectedVariant
                })
              }}
              className="w-full rounded-lg bg-forest-900 px-3 py-2 text-xs font-semibold tracking-[0.05em] uppercase text-cream-50 transition hover:bg-forest-950"
            >Add to cart</button>
          )}
        </div>
      </div>
    </div>
  )
}
