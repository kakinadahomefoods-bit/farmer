import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import { formatPrice, getImageUrl, getImageProps, getImageSizes } from '../lib/utils'
import { generatePlaceholder } from '../lib/placeholders'
import { useSiteSettings } from '../contexts/SiteSettingsContext'
import { useCart } from '../contexts/CartContext'
import ProductCard from '../components/ProductCard'

const KEY_BENEFITS = [
  { icon: '🛡️', label: 'Immunity Boost' },
  { icon: '🫐', label: 'Rich in Antioxidants' },
  { icon: '🧪', label: 'Chemical-Free' },
]

const CERTIFICATIONS = [
  { name: 'FSSAI', icon: '✓' },
  { name: '100% Natural', icon: '🌿' },
  { name: 'Ethically Sourced', icon: '🤝' },
]

const VALUES_ROW = [
  { label: 'Made in India' }, { label: 'Eco-Friendly' },
  { label: 'Ethical Practices' }, { label: '100% Natural' },
  { label: 'Non-GMO' }, { label: 'Certified Organic' },
]

export default function ProductDetail() {
  const { slug } = useParams()
  const { settings } = useSiteSettings()
  const { cartItems, addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [accordion, setAccordion] = useState('benefits')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!slug) return
      try {
        const { getProductBySlug } = await import('../lib/productService')
        const data = await getProductBySlug(slug)
        setProduct(data)
        if (data?.product_variants?.length) setSelectedVariant(data.product_variants[0])
        const { getProducts } = await import('../lib/productService')
        const related = await getProducts(1, 4, data?.category || null, null, 'created_at', false)
        setRelatedProducts((related?.data || []).filter(p => p.id !== data?.id))
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-green-600" />
    </div>
  )

  if (!product) return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-lg font-semibold text-ink">Product not found</p>
        <Link to="/products" className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">Back to Products</Link>
      </div>
    </div>
  )

  const images = product.galleryImages?.length ? product.galleryImages : (product.images?.length ? product.images : [product.image_url])
  const mainImgProps = getImageProps(images[selectedImg], { width: 900, sizes: getImageSizes([1024, 768]), priority: true })
  const price = selectedVariant?.price ?? product.base_price ?? product.price
  const mrp = selectedVariant?.mrp ?? product.mrp ?? price
  const savings = mrp - price
  const rating = product.rating ?? 4.9
  const reviewCount = product.reviewCount ?? 320
  const categoryTag = product.category_tag || product.harvest_type || product.badge || product.category_name || product.category || ''

  const cartItem = cartItems?.find(item => item.product_id === product.id && item.variant_id === selectedVariant?.id)
  const inCartQty = cartItem?.quantity || 0

  const handleAddToCart = async () => {
    await addToCart({ product_id: product.id, variant_id: selectedVariant?.id, quantity, product, variant: selectedVariant })
  }

  return (
    <div className="bg-white min-h-screen">
      <SeoHead title={product.name} description={product.description || product.tagline} ogImage={images[0]} />

      <div className="border-b border-border">
        <div className="section-container py-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Link to="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-green-600">All Products</Link>
            {product.category && <><span>/</span><Link to={`/products?category=${product.category_slug || ''}`} className="hover:text-green-600">{product.category}</Link></>}
            <span>/</span>
            <span className="text-ink font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="section-container py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Gallery */}
          <div>
            <button onClick={() => setLightboxOpen(true)} className="bg-off-white rounded-xl overflow-hidden border border-border relative w-full block cursor-zoom-in">
              <img src={mainImgProps.src} alt={product.name} loading="eager" fetchpriority="high"
                srcSet={mainImgProps.srcSet} sizes={mainImgProps.sizes}
                className="w-full aspect-[4/5] object-cover object-center" />
              <span className="absolute top-3 left-3 text-xs text-muted bg-white/80 border border-border rounded px-2 py-0.5">{selectedImg + 1} / {images.length}</span>
              <span className="absolute top-3 right-3 text-xs text-muted bg-white/80 border border-border rounded px-2 py-0.5">🔍</span>
            </button>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => {
                  const thumbProps = getImageProps(img, { width: 120, sizes: '64px' })
                  return (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden bg-white transition-all ${selectedImg === i ? 'border-green-600' : 'border-border opacity-60 hover:opacity-100'}`}>
                      <img src={thumbProps.src} alt="" loading="lazy" className="w-full h-full object-cover object-center" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {categoryTag && <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-green-600">{categoryTag}</span>}
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink tracking-tight">{product.name}</h1>
            {product.tagline && <p className="text-sm text-muted leading-relaxed">{product.tagline}</p>}

            <div className="flex flex-wrap gap-4">
              {KEY_BENEFITS.map(b => (
                <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted"><span>{b.icon}</span><span>{b.label}</span></div>
              ))}
            </div>

            {product.product_variants?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-muted mb-2">Select Size Pack</p>
                <div className="flex flex-wrap gap-2">
                  {product.product_variants.map(v => {
                    const active = selectedVariant?.id === v.id
                    const vPrice = v.price || price
                    const vMrp = v.mrp || mrp
                    const vSavings = vMrp - vPrice
                    const isBestSeller = v.isBestSeller || (v.name?.toLowerCase().includes('500'))
                    return (
                      <button key={v.id} onClick={() => setSelectedVariant(v)}
                        className={`rounded-lg border-2 px-4 py-3 text-left transition-all min-w-[120px] ${
                          active ? 'border-green-600 bg-green-50' : 'border-border bg-white hover:border-green-300'
                        }`}>
                        <span className={`text-sm font-semibold ${active ? 'text-green-700' : 'text-ink'}`}>{v.weight_label || v.name}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className={`text-sm font-bold ${active ? 'text-green-700' : 'text-ink'}`}>{formatPrice(vPrice)}</span>
                          {vMrp > vPrice && <span className="text-[10px] text-muted-light line-through">{formatPrice(vMrp)}</span>}
                        </div>
                        {vSavings > 0 && <span className="text-[9px] font-semibold text-sale">Save {formatPrice(vSavings)}/-</span>}
                        {isBestSeller && <span className="ml-1 text-[8px] font-semibold text-green-600 bg-green-100 px-1 rounded">Best Seller</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-bold text-ink">{formatPrice(price)}</span>
              {mrp > price && <span className="text-sm text-muted-light line-through">{formatPrice(mrp)}</span>}
              {savings > 0 && <span className="text-sm font-semibold text-sale bg-sale-light px-2 py-0.5 rounded">Save {formatPrice(savings)}/-</span>}
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex items-center rounded-lg border border-border bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="flex items-center justify-center w-10 h-10 text-muted hover:text-green-600 transition-colors">−</button>
                <span className="min-w-[2.5rem] text-center text-sm font-semibold text-ink">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="flex items-center justify-center w-10 h-10 text-muted hover:text-green-600 transition-colors">+</button>
              </div>
              {inCartQty > 0 && <span className="text-xs text-muted">({inCartQty} in cart)</span>}
            </div>

            <div className="flex gap-3">
              <button onClick={handleAddToCart} className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors active:scale-[0.98]">Add to Cart</button>
              <button className="flex-1 bg-ink text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-ink/80 transition-colors active:scale-[0.98]">Buy it Now</button>
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div className="mt-12 border-t border-border">
          {[
            { key: 'benefits', label: 'Benefits', content: 'Wild forest honey is packed with natural antioxidants, antibacterial properties, and essential vitamins. It supports immunity, aids digestion, and provides sustained energy. Sourced from pristine forests, it retains all its natural goodness without any processing.' },
            { key: 'ingredients', label: 'Ingredients', content: '100% Pure Raw Wild Forest Honey. No additives, no preservatives, no processing. Naturally harvested from wild beehives in forest regions.' },
            { key: 'howtouse', label: 'How to Use', content: 'Take 1-2 tablespoons daily. Can be taken directly, mixed with warm water or herbal tea, used as a natural sweetener in recipes, or applied topically for skin and hair care.' },
            { key: 'manufacturer', label: 'Manufacturer Information', content: (
              <div className="space-y-1 text-sm text-muted">
                <p><span className="font-semibold text-ink">Shelf Life:</span> 24 months from date of manufacture</p>
                <p><span className="font-semibold text-ink">Product Dimensions:</span> As per pack size selected</p>
                <p><span className="font-semibold text-ink">Manufacturer:</span> HaiFarmer Foods Pvt. Ltd.</p>
                <p><span className="font-semibold text-ink">Manufacturer Address:</span> Kandhamal, Odisha, India</p>
                <p><span className="font-semibold text-ink">Country of Origin:</span> India</p>
              </div>
            )},
          ].map(tab => (
            <div key={tab.key} className="border-b border-border last:border-b-0">
              <button onClick={() => setAccordion(accordion === tab.key ? null : tab.key)} className="flex w-full items-center justify-between py-4 px-1 text-left">
                <span className="text-sm font-semibold text-ink">{tab.label}</span>
                <svg className={`h-4 w-4 text-muted transition-transform ${accordion === tab.key ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {accordion === tab.key && (
                <div className="pb-4 px-1 text-sm text-muted leading-relaxed">{tab.content}</div>
              )}
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-ink mb-4">Our Certifications</h3>
          <div className="flex flex-wrap gap-3">
            {CERTIFICATIONS.map(c => (
              <div key={c.name} className="flex items-center gap-2 border border-border rounded-lg px-4 py-2">
                <span className="text-green-600 text-sm">{c.icon}</span>
                <span className="text-xs font-medium text-muted">{c.name}</span>
              </div>
            ))}
            <button className="text-xs font-semibold text-green-600 hover:text-green-700 border border-border rounded-lg px-4 py-2">View All</button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          {VALUES_ROW.map(v => (
            <span key={v.label} className="text-[10px] font-medium text-muted uppercase tracking-[0.05em] border border-border rounded px-2.5 py-1">{v.label}</span>
          ))}
        </div>

        <div className="mt-12 bg-sand rounded-xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <h3 className="font-heading text-xl font-bold text-ink">Our Farmers Are the Heart of Our Purpose</h3>
              <p className="text-sm text-muted mt-3 leading-relaxed">This product is sourced directly from tribal farming communities who have cultivated the land for generations using traditional, sustainable methods. Every purchase supports their livelihoods and preserves ancient knowledge.</p>
              <Link to="/farmers" className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">Meet the Farmers →</Link>
            </div>
            <div className="bg-green-50 min-h-[200px] flex items-center justify-center">
              <div className="text-center p-8">
                <img src={generatePlaceholder('farmer-card')} alt="Farmer" className="w-20 h-20 rounded-full mx-auto object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h3 className="font-heading text-xl font-bold text-ink mb-6">You may also like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10" aria-label="Close">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedImg(prev => (prev - 1 + images.length) % images.length) }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 disabled:opacity-30" disabled={images.length <= 1} aria-label="Previous">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setSelectedImg(prev => (prev + 1) % images.length) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 disabled:opacity-30" disabled={images.length <= 1} aria-label="Next">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <img src={getImageUrl(images[selectedImg])} alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">{selectedImg + 1} / {images.length}</div>
        </div>
      )}
    </div>
  )
}
