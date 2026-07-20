import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useCart } from '../contexts/CartContext'

function calculateBundlePrice(bundle) {
  const total = (Array.isArray(bundle?.items) ? bundle.items : [])
    .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)
  if (total > 0) {
    const discountPct = Number(bundle?.discountPercent || 0)
    return Number((total - total * discountPct / 100).toFixed(2))
  }
  return Number(bundle?.price || 0)
}

export default function BundleDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const { addToCart, removeFromCart, cartItems } = useCart()
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const data = await api.getBundle(slug)
        setBundle(data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-cream-50"><div className="h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500" /></div>
  if (!bundle) return <div className="flex min-h-[60vh] items-center justify-center bg-cream-50 text-forest-900/50 font-heading text-xl">Bundle not found</div>

  const imgSrc = getImageUrl(bundle.image, settings?.placeholder_image)
  const bundlePrice = calculateBundlePrice(bundle)
  const originalTotal = (bundle.items?.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)) || 0
  const cartItem = cartItems?.find(item => item.bundle_id === bundle._id || item.product?._id === bundle._id)
  const isInCart = Boolean(cartItem)

  const bundleSchema = bundle ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.name,
    description: bundle.description || 'Combo bundle',
    image: bundle.image,
    offers: { '@type': 'Offer', price: bundlePrice, priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
  } : null

  return (
    <div className="min-h-screen bg-cream-50">
      <SeoHead title={bundle?.name} description={bundle?.description} ogImage={bundle?.image} schema={bundleSchema} canonical={`https://haifarmer.com/combos/${slug}`} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/combos" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-terracotta-500 hover:text-terracotta-600 transition">← Back to Combos</Link>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-border-warm bg-cream-50 shadow-sm">
            <img src={imgSrc} alt={bundle.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="inline-block rounded-full bg-terracotta-500/10 px-4 py-1.5 text-xs font-semibold tracking-[0.08em] uppercase text-terracotta-500">Best Value</span>
            <h1 className="mt-3 font-heading text-3xl font-bold text-text-dark sm:text-4xl tracking-tight">{bundle.name}</h1>
            {bundle.description && <p className="mt-4 leading-relaxed text-forest-900/70">{bundle.description}</p>}
            <div className="mt-4 flex items-end gap-3">
              {originalTotal > bundlePrice && <span className="font-heading text-lg text-forest-900/40 line-through">{formatPrice(originalTotal)}</span>}
              <span className="font-heading text-3xl font-bold text-text-dark">{formatPrice(bundlePrice)}</span>
            </div>
            <p className="mt-1 text-sm text-forest-900/50">+ shipping cost</p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-text-dark mb-3">Includes:</h3>
              <ul className="space-y-2">
                {bundle.items?.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-forest-900/70">
                    <span className="text-terracotta-500">✓</span>
                    {item.variantName || item.product?.name || 'Product'} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="rounded-lg bg-sage-300/20 px-3 py-2 text-xs font-medium text-forest-900">100% Natural</div>
              <div className="rounded-lg bg-sage-300/20 px-3 py-2 text-xs font-medium text-forest-900">Chemical Free</div>
              <div className="rounded-lg bg-sage-300/20 px-3 py-2 text-xs font-medium text-forest-900">Direct from Farmers</div>
            </div>

            <button
              onClick={async () => {
                if (isInCart) await removeFromCart(cartItem.id)
                else await addToCart({ bundle_id: bundle._id, quantity: 1, bundle })
              }}
              className={`mt-6 w-full rounded-full py-3.5 text-sm font-semibold tracking-[0.05em] uppercase text-cream-50 shadow-lg transition hover:-translate-y-0.5 ${isInCart ? 'bg-forest-900/80 hover:bg-forest-900' : 'bg-terracotta-500 hover:bg-terracotta-600'}`}
            >{isInCart ? 'Remove from cart' : 'Add to cart'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
