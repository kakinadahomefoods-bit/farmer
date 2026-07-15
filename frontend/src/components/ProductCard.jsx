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
    <div className={`group flex h-full flex-col ${compact ? 'h-[380px]' : 'h-[580px]'}`}>
      <Link
        to={`/product/${slugify(product.name)}`}
        className={`relative block overflow-hidden rounded-[20px] bg-gradient-to-br from-lime-50 via-white to-amber-50 ${compact ? 'h-[146px]' : 'h-[312px]'}`}
      >
        {product.discount_percent > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-amber-800 shadow-sm">
            {product.discount_percent}% off
          </span>
        )}
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="block h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => {
            if (e.currentTarget.dataset.fallbackApplied !== 'true') {
              e.currentTarget.dataset.fallbackApplied = 'true'
              e.currentTarget.src = settings?.placeholder_image || '/placeholder.jpg'
            }
          }}
        />
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? 'px-0.5 pt-2' : 'px-2 pt-4'}`}>
        <Link to={`/product/${slugify(product.name)}`}>
          <h3 className={`line-clamp-2 font-sans text-slate-900 ${compact ? 'min-h-[2.1rem] text-[12px]' : 'min-h-[3.2rem] text-lg'} font-medium leading-tight tracking-[0.01em]`} title={product.name}>
            {product.name}
          </h3>
        </Link>

        <div className="-mt-[27px]">
          <div className={`mt-2 flex items-end justify-between gap-2 ${compact ? 'min-h-[40px]' : 'min-h-[60px]'}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className={`${compact ? 'text-[15px]' : 'text-2xl'} font-semibold text-slate-900`}>{formatPrice(discountedPrice)}</div>
              <div className="text-[10px] font-medium text-slate-500">+ shipping cost</div>
              {product.discount_percent > 0
                ? <div className="text-[10px] font-medium text-slate-400 line-through">{formatPrice(price)}</div>
                : <div className="text-[10px] font-medium text-lime-700">Farm fresh</div>
              }
            </div>
            {product.category && (
              <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-lime-700">{product.category}</div>
            )}
          </div>
        </div>

        <div className={`${compact ? 'mt-2 min-h-[32px]' : 'mt-4 min-h-[46px]'}`}>
          {product.product_variants && product.product_variants.length > 1 && (
            <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2'}`}>
              {product.product_variants.map(variant => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    const existingCartItem = cartItems?.find(item => item.product_id === product.id && item.variant_id === variant.id)
                    setProductSelection(product.id, {
                      variantId: variant.id,
                      quantity: existingCartItem?.quantity || 1
                    })
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${selectedVariantId === variant.id ? 'bg-green-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {variant.weight_label || variant.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={`${compact ? 'mt-2 min-h-[32px]' : 'mt-4 min-h-[46px]'}`}>
          {isInCart ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white">
                <button type="button" onClick={() => handleQuantityChange(cartQuantity - 1)} className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50" disabled={cartQuantity <= 1}>−</button>
                <span className="min-w-[2rem] text-center font-semibold text-slate-900">{cartQuantity}</span>
                <button type="button" onClick={() => handleQuantityChange(cartQuantity + 1)} className="px-3 py-2 text-slate-600 hover:bg-slate-100">+</button>
              </div>
              <button
                onClick={() => removeFromCart(cartItem.id)}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition"
              >Remove</button>
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
              className="w-full rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 transition"
            >Add to cart</button>
          )}
        </div>
      </div>
    </div>
  )
}
