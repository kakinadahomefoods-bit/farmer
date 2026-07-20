import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl } from '../lib/utils'
import { useSiteSettings } from '../contexts/SiteSettingsContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)

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
    <div className="flex min-h-screen items-center justify-center bg-cream-50">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-forest-900/20 border-t-terracotta-500" />
        <p className="mt-4 font-heading text-lg text-forest-900/40 italic">HAiFarmer</p>
      </div>
    </div>
  )

  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-cream-50">
      <div className="text-center">
        <p className="font-heading text-2xl text-forest-900/50 italic">Product not found</p>
        <Link to="/products" className="mt-4 btn-font inline-flex items-center gap-2 rounded-xl bg-terracotta-500 px-6 py-3 text-sm font-semibold text-cream-50 hover:bg-terracotta-600 transition-all">Back to Products</Link>
      </div>
    </div>
  )

  const images = product.images?.length ? product.images : [product.image_url]
  const imgSrc = getImageUrl(images[selectedImg], settings?.placeholder_image)
  const currentPrice = selectedVariant?.price ?? product.base_price ?? product.price

  const productSchema = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: product.name, description: product.description || product.tagline || '',
    image: images[0],
    offers: { '@type': 'Offer', price: currentPrice, priceCurrency: 'INR', availability: 'https://schema.org/InStock' },
  }

  return (
    <div className="min-h-screen bg-cream-50">
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

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-300/20 via-cream-50 to-sage-300/10 border border-forest-900/10 shadow-lg">
              <img src={imgSrc} alt={product.name} className="w-full h-[400px] sm:h-[500px] lg:h-[560px] object-cover transition-transform duration-700 group-hover:scale-105" />
              {/* Seal watermark */}
              <div className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest-900/80 backdrop-blur-sm shadow-lg">
                <svg viewBox="0 0 100 100" className="h-8 w-8 text-gold-500 animate-spin-slow" fill="currentColor">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
                  <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold">100%</text>
                  <text x="50" y="62" textAnchor="middle" dominantBaseline="central" fontSize="5">NATURAL</text>
                  <path d="M50 5 A45 45 0 1 1 49.9 5" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" />
                </svg>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-terracotta-500 ring-2 ring-terracotta-500/20' : 'border-forest-900/10 opacity-60 hover:opacity-100'}`}>
                    <img src={getImageUrl(img, settings?.placeholder_image)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="flex flex-col gap-6">
            <div>
              {product.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta-500/10 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase text-terracotta-500">{product.category}</span>
              )}
              <h1 className="mt-2 font-heading text-3xl font-bold text-forest-900 sm:text-4xl tracking-tight">{product.name}</h1>
              {product.tagline && (
                <p className="mt-2 font-heading text-base italic text-forest-900/50">&ldquo;{product.tagline}&rdquo;</p>
              )}
            </div>

            {/* Price row */}
            <div className="flex items-baseline gap-3">
              <span className="font-heading text-3xl font-bold text-forest-900">{formatPrice(currentPrice)}</span>
              <span className="text-xs text-forest-900/40">+ Free Shipping</span>
            </div>

            {/* Trust features */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: '🌱', label: '100% Natural' },
                { icon: '🧪', label: 'Lab Tested' },
                { icon: '🤝', label: 'Ethically Sourced' },
                { icon: '👨‍🌾', label: 'Farmer Direct' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-2 rounded-xl bg-forest-900/5 px-3 py-2">
                  <span className="text-sm">{f.icon}</span>
                  <span className="text-[11px] font-semibold text-forest-900/70">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Size selector */}
            {product.product_variants?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-forest-900/50 uppercase tracking-wider mb-2">Choose Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.product_variants.map(v => {
                    const active = selectedVariant?.id === v.id
                    return (
                      <button key={v.id} onClick={() => setSelectedVariant(v)}
                        className={`rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
                          active
                            ? 'border-terracotta-500 bg-terracotta-500/10 text-terracotta-500 shadow-sm'
                            : 'border-forest-900/10 bg-white text-forest-900/60 hover:border-forest-900/30'
                        }`}>
                        {v.weight_label || v.name}
                        <span className={`ml-2 ${active ? 'text-terracotta-600' : 'text-forest-900/40'}`}>{formatPrice(v.price)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button className="btn-font w-full rounded-2xl bg-terracotta-500 py-4 text-base font-semibold tracking-[0.06em] uppercase text-cream-50 transition-all hover:bg-terracotta-600 hover:-translate-y-1 shadow-xl shadow-terracotta-500/25 btn-lift flex items-center justify-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7.2"/></svg>
              Add to Cart
            </button>

            {/* Payment icons */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-forest-900/30">
              <span>🔒 Secure Checkout</span>
              <span>•</span>
              <span>Razorpay</span>
              <span>•</span>
              <span>UPI</span>
              <span>•</span>
              <span>COD</span>
            </div>

            {/* About */}
            {product.description && (
              <div className="border-t border-forest-900/10 pt-5">
                <h3 className="font-heading text-lg font-semibold text-forest-900 mb-2">About This Product</h3>
                <p className="text-sm leading-relaxed text-forest-900/60">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* How to Use + Farmer Note */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* How to Use cards */}
          <div>
            <h3 className="font-heading text-xl font-bold text-forest-900 mb-4">How to Use</h3>
            <div className="space-y-3">
              {[
                { icon: '🧺', title: 'Store', desc: 'Keep in a cool, dry place away from direct sunlight.' },
                { icon: '💧', title: 'Prepare', desc: 'Rinse thoroughly before use. Traditional preparation methods recommended.' },
                { icon: '🍽️', title: 'Serve', desc: 'Enjoy as part of your daily meals. Perfect for traditional recipes.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-forest-900/10 bg-white p-4 shadow-sm">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900/5 text-lg">{item.icon}</span>
                  <div>
                    <p className="font-heading text-sm font-semibold text-forest-900">{item.title}</p>
                    <p className="mt-0.5 text-xs text-forest-900/50">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Farmer Note */}
          <div className="rounded-3xl bg-forest-900 p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03]">
              <svg viewBox="0 0 200 200" className="w-full h-full" fill="currentColor" color="#C8A96A"><circle cx="100" cy="100" r="80"/></svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20">
                  <span className="text-2xl">👨‍🌾</span>
                </div>
                <div>
                  <p className="font-heading text-sm font-semibold text-gold-500">Farmer's Note</p>
                  <p className="text-[10px] text-cream-50/40 uppercase tracking-wider">Direct from the source</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-cream-50/70">
                This product is sourced directly from tribal farming communities who have cultivated the land for generations
                using traditional, sustainable methods. Every purchase supports indigenous farmers, preserves ancient agricultural
                wisdom, and brings the purest food to your table.
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-forest-950/60 p-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cream-50/60">Impact</span>
                    <span className="font-semibold text-gold-500">12,500+ Lives</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-forest-900 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-gold-500 to-terracotta-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
