import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

const DEFAULT_HOW_TO_USE = [
  { icon: '🌿', title: 'Store', tip: 'Keep in a cool, dry place away from direct sunlight.' },
  { icon: '💧', title: 'Prepare', tip: 'Rinse thoroughly before use. Traditional preparation methods recommended.' },
  { icon: '🍽️', title: 'Serve', tip: 'Enjoy as part of your daily meals. Perfect for traditional recipes.' },
  { icon: '💚', title: 'Benefits', tip: 'Rich in natural nutrients. Ideal for a healthy lifestyle.' },
]

const DEFAULT_METRICS = [
  { icon: '👨‍👩‍👧‍👦', label: 'Tribal Families Supported', value: '250+', percent: 85 },
  { icon: '🌳', label: 'Forest Area Preserved', value: '120+ Acres', percent: 70 },
  { icon: '🐝', label: 'Chemical-Free Beekeeping', value: '100%', percent: 100 },
  { icon: '🤝', label: 'Fair Income to Farmers', value: '₹12L+', percent: 90 },
]

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [wishlisted, setWishlisted] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const { getProductBySlug } = await import('../lib/productService')
        const data = await getProductBySlug(slug)
        setProduct(data)
        if (data?.product_variants?.length) setSelectedVariant(data.product_variants[0])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4EEE1]">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500" />
        <p className="mt-4 font-heading text-lg text-forest-900/40 italic">HAiFarmer</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F4EEE1]">
      <div className="text-center">
        <p className="font-heading text-2xl text-forest-900/50 italic">Product not found</p>
        <Link to="/products" className="mt-4 btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-terracotta-600 transition-all">Back to Products</Link>
      </div>
    </div>
  )

  const images = product.galleryImages?.length ? product.galleryImages : (product.images?.length ? product.images : [product.image_url])
  const mainImgSrc = getImageUrl(images[selectedImg], settings?.placeholder_image)
  const currentPrice = selectedVariant?.price ?? product.base_price ?? product.price
  const rating = product.rating ?? 4.9
  const reviewCount = product.reviewCount ?? 320
  const badges = product.badges?.length ? product.badges : ['100% RAW & UNFILTERED']
  const kicker = product.kicker || product.badges?.join(' • ') || 'RAW • UNFILTERED • SINGLE-ORIGIN'

  const farmerNote = product.farmerNote || { quote: '"Growing pure food, sustaining traditions."', body: 'This product is sourced directly from tribal farming communities who have cultivated the land for generations using traditional, sustainable methods.', name: 'Tribal Farmer & Honey Harvester', role: '', photo: '' }
  const howToUse = product.howToUse?.length ? product.howToUse : DEFAULT_HOW_TO_USE
  const impactMetrics = product.impactMetrics?.length ? product.impactMetrics : DEFAULT_METRICS
  const origin = product.origin || (product.category === 'Honey' ? 'Kandhamal, Odisha' : product.origin || '')
  const harvestSeason = product.harvestSeason || 'March – May'

  const productSchema = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description: product.description || product.tagline || '',
    image: images[0],
    offers: { '@type': 'Offer', price: currentPrice, priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
  }

  return (
    <div className="min-h-screen bg-[#F4EEE1]">
      <SeoHead title={product.name} description={product.description || product.tagline} ogImage={images[0]} schema={productSchema} canonical={`https://haifarmer.com/products/${slug}`} />

      {/* Breadcrumb */}
      <div className="bg-cream-100 border-b border-forest-900/5">
        <div className="mx-auto max-w-7xl px-5 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 text-xs text-forest-900/40">
            <Link to="/" className="hover:text-terracotta-500 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-terracotta-500 transition-colors">Products</Link>
            <span>/</span>
            {product.category && <><Link to={`/products?category=${product.category_slug || ''}`} className="hover:text-terracotta-500 transition-colors">{product.category}</Link><span>/</span></>}
            <span className="text-forest-900/70 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* Two-column: Gallery + Info */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-300/20 via-cream-50 to-sage-300/10 border border-forest-900/10 shadow-lg">
              <img src={mainImgSrc} alt={product.name} className="h-[400px] w-full object-cover transition-transform duration-700 sm:h-[500px] lg:h-[560px] group-hover:scale-105" />
              {/* Badge pill */}
              <span className="absolute left-3 top-3 z-10 rounded-full bg-forest-900/80 backdrop-blur-sm px-3 py-1 text-[9px] font-semibold tracking-[0.12em] uppercase text-cream-50 shadow-sm">{badges[0]}</span>
            </div>

            {/* Thumbnail carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedImg(prev => Math.max(0, prev - 1))} disabled={selectedImg === 0}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-forest-900/10 bg-[#FBF8F1] text-forest-900/40 transition-all hover:bg-forest-900/5 disabled:opacity-30">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${selectedImg === i ? 'border-terracotta-500 ring-2 ring-terracotta-500/20' : 'border-forest-900/10 opacity-60 hover:opacity-100'}`}>
                      <img src={getImageUrl(img, settings?.placeholder_image)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
                <button onClick={() => setSelectedImg(prev => Math.min(images.length - 1, prev + 1))} disabled={selectedImg >= images.length - 1}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-forest-900/10 bg-[#FBF8F1] text-forest-900/40 transition-all hover:bg-forest-900/5 disabled:opacity-30">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#FBF8F1] p-3 border border-forest-900/5 lg:grid-cols-4">
              {[
                { icon: '🌱', label: '100% Natural', sub: 'No additives' },
                { icon: '🍯', label: 'Unfiltered', sub: '& Unprocessed' },
                { icon: '🤝', label: 'Ethically Sourced', sub: 'Direct from tribes' },
                { icon: '🧪', label: 'Lab Tested', sub: 'For Purity' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-center">
                  <span className="text-lg">{item.icon}</span>
                  <div className="text-left">
                    <p className="text-[11px] font-semibold text-forest-900 leading-tight">{item.label}</p>
                    <p className="text-[9px] text-forest-900/40">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Kicker */}
            <p className="font-heading text-[11px] font-semibold tracking-[0.2em] uppercase text-terracotta-500">{kicker}</p>

            {/* Name */}
            <h1 className="font-heading text-3xl font-bold text-forest-900 sm:text-4xl tracking-tight">{product.name}</h1>

            {/* Price + Rating */}
            <div className="flex items-center gap-4">
              <span className="font-heading text-3xl font-bold text-forest-900">{formatPrice(currentPrice)}</span>
              <div className="flex items-center gap-1.5">
                <div className="flex text-gold-500">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-gold-500' : 'text-forest-900/10'}`}>★</span>
                  ))}
                </div>
                <span className="text-xs text-forest-900/50">{rating} ({reviewCount} reviews)</span>
              </div>
            </div>

            {/* Description */}
            {(product.description || product.tagline) && (
              <p className="text-sm leading-relaxed text-forest-900/60">{product.tagline ? `"${product.tagline}"` : ''}{product.tagline && product.description ? ' — ' : ''}{product.description || ''}</p>
            )}

            {/* Meta rows */}
            <div className="flex flex-wrap gap-4">
              {origin && (
                <div className="flex items-center gap-1.5 text-xs text-forest-900/60">
                  <span className="text-forest-900/80">📍</span>
                  <span><span className="font-semibold text-forest-900">Origin:</span> {origin}</span>
                </div>
              )}
              {harvestSeason && (
                <div className="flex items-center gap-1.5 text-xs text-forest-900/60">
                  <span className="text-forest-900/80">📅</span>
                  <span><span className="font-semibold text-forest-900">Harvest Season:</span> {harvestSeason}</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-forest-900/10" />

            {/* Size selector */}
            {product.product_variants?.length > 0 && (
              <div>
                <p className="font-heading text-sm font-semibold text-forest-900 mb-2">SELECT SIZE</p>
                <div className="flex flex-wrap gap-2">
                  {product.product_variants.map(v => {
                    const active = selectedVariant?.id === v.id
                    return (
                      <button key={v.id} onClick={() => setSelectedVariant(v)}
                        className={`rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                          active
                            ? 'border-terracotta-500 bg-terracotta-500/10 text-terracotta-500 shadow-sm'
                            : 'border-forest-900/10 bg-[#FBF8F1] text-forest-900/60 hover:border-forest-900/30'
                        }`}>
                        {v.weight_label || v.name}
                        <span className={`ml-2 ${active ? 'text-terracotta-600' : 'text-forest-900/40'}`}>{formatPrice(v.price)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add to cart + Wishlist */}
            <div className="flex gap-3">
              <button className="btn-font flex-1 rounded-2xl bg-terracotta-500 py-4 text-base font-semibold tracking-[0.06em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-1 shadow-xl shadow-terracotta-500/25 btn-lift flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2"/></svg>
                Add to Cart
              </button>
              <button onClick={() => setWishlisted(!wishlisted)}
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 transition-all btn-lift ${
                  wishlisted ? 'border-terracotta-500 bg-terracotta-500/10 text-terracotta-500' : 'border-forest-900/10 bg-[#FBF8F1] text-forest-900/30 hover:border-terracotta-500/30 hover:text-terracotta-500'
                }`}>
                <svg className="h-6 w-6" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>

            {/* Guarantee */}
            <div className="flex items-center gap-2 rounded-xl bg-forest-900/5 px-4 py-2.5">
              <span className="text-lg">🛡️</span>
              <p className="text-xs text-forest-900/60">100% Satisfaction Guaranteed — return within 7 days for a full refund.</p>
            </div>

            {/* About */}
            {product.description && (
              <div className="border-t border-forest-900/10 pt-4">
                <h3 className="font-heading text-base font-semibold text-forest-900 mb-1">About This Product</h3>
                <p className="text-sm leading-relaxed text-forest-900/60">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* 3-column section: Farmer's Note / Impact Meter / How to Use */}
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* Farmer's Note */}
          <div className="rounded-2xl bg-[#FBF8F1] p-5 border border-forest-900/5 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-500/10">
                {farmerNote.photo ? (
                  <img src={getImageUrl(farmerNote.photo)} alt="" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span className="text-lg">👨‍🌾</span>
                )}
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-forest-900">Farmer's Note</p>
              </div>
            </div>
            <p className="font-heading text-base italic text-forest-900/70 leading-relaxed">{farmerNote.quote}</p>
            <p className="mt-2 text-xs leading-relaxed text-forest-900/50 flex-1">{farmerNote.body}</p>
            <p className="mt-3 font-heading text-xs font-semibold text-terracotta-500">– {farmerNote.name}</p>
          </div>

          {/* Impact Meter */}
          <div className="rounded-2xl bg-[#11281D] p-5 border border-gold-500/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🌍</span>
              <h3 className="font-heading text-sm font-bold text-cream-50">Your purchase makes a real difference.</h3>
            </div>
            <div className="space-y-3">
              {impactMetrics.map(m => (
                <div key={m.label} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{m.icon}</span>
                      <span className="text-cream-50/70">{m.label}</span>
                    </div>
                    <span className="font-semibold text-gold-500">{m.value}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-forest-900">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-terracotta-500 transition-all" style={{ width: `${Math.min(100, m.percent)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-cream-50/40 italic">Together, we're building a wilder, kinder, and more equitable world.</p>
          </div>

          {/* How to Use */}
          <div className="rounded-2xl bg-[#FBF8F1] p-5 border border-forest-900/5">
            <h3 className="font-heading text-sm font-bold text-forest-900 mb-3 flex items-center gap-2">
              <span>📖</span> How to Use
            </h3>
            <div className="space-y-3">
              {howToUse.map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-terracotta-500/10 text-sm">{item.icon}</span>
                  <div>
                    <p className="font-heading text-sm font-semibold text-forest-900">{item.title}</p>
                    <p className="text-[11px] text-forest-900/50">{item.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer trust bar */}
      <div className="bg-[#11281D] border-t border-gold-500/10">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹2,599' },
              { icon: '🔒', title: 'Secure Payment', desc: '100% protected checkout' },
              { icon: '🔄', title: '7-Day Returns', desc: 'No questions asked' },
              { icon: '🌱', title: 'Support Farmers', desc: 'Every purchase creates impact' },
            ].map(item => (
              <div key={item.title}>
                <span className="text-xl">{item.icon}</span>
                <p className="mt-1 font-heading text-sm font-semibold text-cream-50">{item.title}</p>
                <p className="text-[10px] text-cream-50/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
